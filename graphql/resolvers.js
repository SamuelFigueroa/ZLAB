import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import fse from 'fs-extra';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { secretOrKey, storageDir, cacheDir } from '../config';
import path from 'path';
import stringify from 'csv-stringify';
//Load models
import User from '../models/User';
import Asset from '../models/Asset';
import Location from '../models/Location';
import Document from '../models/Document';
import PrinterHub from '../models/PrinterHub';
import Printer from '../models/Printer';
import Counter from '../models/Counter';


// Load input validation
import validateRegisterInput from '../validation/register';
import validateLoginInput from '../validation/login';
import validateLocationInput from '../validation/location';
import validateAddAssetInput from '../validation/asset';
import validateAddMaintenanceEventInput from '../validation/maintenance_event';
import validateAddPurchaseEventInput from '../validation/purchase_event';
import validateUploadInput from '../validation/upload';
import validatePrinterHubInput from '../validation/printer_hub';
import validateAddPrinterInput from '../validation/printer';
import validatePrinterJobInput from '../validation/printer_job';
import validateCounterInput from '../validation/counter';
import validateAssetFilter from '../validation/asset_filter';
import validateFilename from '../validation/filename';

const cache = path.normalize(cacheDir);
const storage = path.normalize(storageDir);

const storeFile = ({ stream, id, name }) => {
  const dstPath = path.join(storage, `${id}-${name}`);
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fse.unlinkSync(dstPath);
        reject(error);
      })
      .pipe(fse.createWriteStream(dstPath))
      .on('error', error => reject(error))
      .on('finish', () => {
        return resolve({ id, dstPath });
      })
  );
};

const cacheFile = ({ stream, name }) => {
  const dstPath = path.join(cache, `${name}`);
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fse.unlinkSync(dstPath);
        reject(error);
      })
      .pipe(fse.createWriteStream(dstPath))
      .on('error', error => reject(error))
      .on('finish', () => {
        return resolve({ dstPath });
      })
  );
};

const conditionsFromInput = (target, input) => {
  const buildConditions = (target, input, key, parent) => {
    if (Array.isArray(input[key]))
      return target[parent.concat([key]).join('.')] = { $in: input[key] };
    if(input[key].length || !isNaN(input[key])) {
      if (target[parent.join('.')] === undefined)
        target[parent.join('.')] = {};
      if (key == 'min')
        return target[parent.join('.')]['$gte'] = input[key];
      else {
        return target[parent.join('.')]['$lte'] = input[key];
      }
    }
    else {
      return Object.keys(input[key]).forEach(k => {
        let p = parent.slice();
        p.push(key);
        return buildConditions(target, input[key], k, p);
      });
    }
  };
  Object.keys(input).forEach(key => buildConditions(target, input, key, []));
  return target;
};

JSON.flatten = (data, delimiter) => {
  const result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      result[prop] = cur;
      // for(var i=0, l=cur.length; i<l; i++)
      //   recurse(cur[i], prop ? prop+'.'+i : ''+i);
      // if (l == 0)
      //   result[prop] = [];
    } else {
      let isEmpty = true;
      Object.keys(cur).forEach(p => {
        isEmpty = false;
        recurse(cur[p], prop ? prop+delimiter+p : p);
      });
      if (isEmpty)
        result[prop] = {};
    }
  };
  recurse(data, '');
  return result;
};

const formatDate = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  const dateArr = new Intl.DateTimeFormat('en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('/');
  const year = dateArr.pop();
  dateArr.unshift(year);
  return dateArr.join('-');
};

const resolvers = {
  Asset: {
    __resolveType(obj, context, info) {
      if(obj.barcode){
        return 'Equipment';
      }

      if(obj.purchase_log){
        return 'Supply';
      }

      return null;
    },
  },


  Query: {
    assets: async (root, args, context, info) => {
      const { errors: inputErrors, isValid } = validateAssetFilter(args.input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Asset filtering failed', errors);
      }

      const { category, location, ...other } = args.input;

      let conditions = {};

      conditions.category = category;
      if (location)
        conditions['location.sub_area'] = { $in: location };

      let assets = await Asset.find(conditionsFromInput(conditions, other));
      let result;
      switch (category) {
      case 'Lab Equipment': {
        result = assets.map(async asset => {
          const { area: areaID, sub_area: subAreaID } = asset.location;
          let location = await Location.findById(areaID);
          const area = location.area.name;
          const sub_area = location.area.sub_areas.id(subAreaID).name;

          return asset.toObject({
            virtuals: true,
            transform: (doc, ret) => {
              ret.location = {};
              ret.location.area = {id: areaID, name: area};
              ret.location.sub_area = {id: subAreaID, name: sub_area};
              return ret;
            }
          });
        });
        break;
      }
      case 'Lab Supplies': {
        result = assets;
        break;
      }
      default: {
        throw new ApolloError('Category does not exist', 'BAD_REQUEST');
      }}
      return result;
    },
    // location: async (root, args, context, info) => {
    //   const { areaID, subAreaID } = args;
    //   let location = await Location.findById(areaID);
    //   const area = location.area.name;
    //   const sub_area = location.area.sub_areas.id(subAreaID).name;
    //
    //   return { area, sub_area };
    // },
    locations: async (root, args, context, info) => {
      let locations = await Location.find();
      return locations;
    },
    users: async (root, args, context, info) => {
      let users = await User.find();
      return users;
    },
    asset: async (root, args, context, info) => {
      let asset = await Asset.findById(args.id);
      if(!asset) {
        throw new ApolloError('Can\'t find asset', 'BAD_REQUEST');
      } else {

        const documents = await asset.documents.map( async docID => {
          let document = await Document.findById(docID);
          return {
            id: docID,
            name: document.name,
            size: document.size,
            category: document.category,
            uploaded_by: document.upload_event.user,
            upload_date: document.upload_event.date
          };
        });

        let result;

        switch (asset.category) {
        case 'Lab Equipment': {
          const { area: areaID, sub_area: subAreaID } = asset.location;
          let location = await Location.findById(areaID);
          const area = location.area.name;
          const sub_area = location.area.sub_areas.id(subAreaID).name;

          result = asset.toObject({
            virtuals: true,
            transform: (doc, ret) => {
              ret.location = {};
              ret.location.area = {id: areaID, name: area};
              ret.location.sub_area = {id: subAreaID, name: sub_area};
              ret.documents = documents;
              return ret;
            }
          });
          break;
        }
        case 'Lab Supplies': {
          result = asset.toObject({
            virtuals: true,
            transform: (doc, ret) => {
              ret.documents = documents;
              return ret;
            }
          });
          break;
        }
        default: {
          throw new ApolloError('Category does not exist', 'BAD_REQUEST');
        }}
        return result;
      }
    },
    document: async (root, args, context, info) => {
      let document = await Document.findById(args.id);
      if(!document) {
        throw new ApolloError('Can\'t find document', 'BAD_REQUEST');
      } else {
        try {
          await fse.ensureDir(cache);
          await fse.ensureDir(storage);
        } catch(err) {
          throw new ApolloError('Document retrieval failed', 'DOC_DIRS_NOT_FOUND');
        }
        const { id, name } = document;
        const srcPath = path.join(storage, `${id}-${name}`);
        const dstPath = path.join(cache, `${id}-${name}`);
        try {
          await fse.copyFile(srcPath, dstPath);
          const p = dstPath.split('/');
          const result = p.slice(p.indexOf('public') + 1);
          result.unshift('/');
          return path.join.apply(this, result);
        } catch(err) {
          throw new ApolloError('Document retrieval failed', 'FILE_CACHE_ERROR');
        }
      }
    },
    printerHub: async (root, args, context, info) => {
      const errors = { errors: {} };
      let hub;

      try {
        hub = await PrinterHub.findOne({ address: args.address });
        if(hub) {
          return hub;
        }
        else {
          errors.errors.Hub = 'Hub not found';
          throw new ApolloError('Hub is not registered', 'BAD_REQUEST', errors);
        }
      } catch(err) {
        if (errors.errors.Hub === undefined)
          errors.errors.HttpRequest = 'Database lookup failed';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
    },
    onlinePrinterHubs: async (root, args, context, info) => {
      let onlineHubs = await PrinterHub.find({ online: true });
      return onlineHubs;
    },
    printer: async (root, args, context, info) => {
      const { connection_name } = args;
      let printer = await Printer.findOne({ connection_name });
      return printer;
    },
    nextPrinterJob: async (root, args, context, info) => {
      const { connection_name } = args;
      const errors = { errors: {} };
      let printer;
      try {
        printer = await Printer.findOne({ connection_name, jobs: { $elemMatch: { status: 'InProgress'} } },
          { 'jobs.$': 1 });
        if(printer) {
          return printer.jobs[0];
        }
        else {
          return null
        }
      } catch(err) {
        errors.errors.HttpRequest = 'Database lookup failed';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
    },
    assetHints: async (root, args, context, info) => {

      const { category } = args;

      const fieldsFromInfo = (info) => {
        let fields = [];
        const getFields = (selection, name) => {
          if (selection.selectionSet === undefined)
            return fields.push(name);
          return selection.selectionSet.selections.
            forEach(selection => getFields(selection,
              name ? `${name}.${selection.name.value}` : selection.name.value ));
        };
        getFields(info.operation.selectionSet.selections[0], null);
        return fields;
      };

      const nestedAssign = (target, property, value) => {
        let propertyArr = property.split('.');
        if (propertyArr.length == 1)
          return target[property] = value;
        else {
          let firstElem = propertyArr.shift();
          if (!(firstElem in target))
            target[firstElem] = {};
          return nestedAssign(target[firstElem], propertyArr.join('.'), value);
        }
      };

      let hints = {};
      let fields = fieldsFromInfo(info);
      for (const field of fields) {
        let value = await Asset.distinct(field, { category, [field]: { $not: /^$/ } });
        nestedAssign(hints, field, value);
      }
      return hints;
    },
    searchAssets: async (root, args, context, info) => {
      const { search } = args;
      const re = new RegExp(search, 'i');
      const paths = Object.keys(Asset.schema.paths).filter(path => Asset.schema.paths[path].instance == 'String');
      let conditions = paths.map( path => ({ [path]: { $regex: re } }));
      let assets = await Asset.find({ '$or': conditions });
      let results = [];
      for (const asset of assets) {
        if (asset.category == 'Lab Equipment') {
          const { area: areaID, sub_area: subAreaID } = asset.location;
          let location = await Location.findById(areaID);
          const area = location.area.name;
          const sub_area = location.area.sub_areas.id(subAreaID).name;

          results.push(asset.toObject({
            virtuals: true,
            transform: (doc, ret) => {
              ret.location = {};
              ret.location.area = {id: areaID, name: area};
              ret.location.sub_area = {id: subAreaID, name: sub_area};
              return ret;
            }
          }));
        }
        else {
          results.push(asset);
        }
      }
      return results;
    }

    // location: async (root, args, context, info) => {
    //   console.log('Executed');
    //   const {areaID, subAreaID} = args.input;
    //   let location = await Location.findById(areaID);
    //   let area = location.name;
    //   let sub_area = location.sub_areas.id(subAreaID).name;
    //   console.log(`${area} / ${sub_area}`);
    //   return {name: `${area} / ${sub_area}`};
    // return {area: 'area', sub_area:'sub_area'};
  },
  Mutation: {
    updateAssetBarcodes: async (root, args, context, info) => {
      let assets = await Asset.find();
      for (const asset of assets) {
        await Asset.findByIdAndUpdate(asset.id,
          { barcode : await Counter.getNextSequenceValue('Lab Equipment') });
      }
    },
    updateDates: async (root, args, context, info) => {
      let assets = await Asset.find();
      for (const asset of assets) {
        if (asset.category == 'Lab Equipment') {
          let warranty_exp = asset.purchasing_info.warranty_exp;
          let log = asset.maintenance_log;
          if (log.length) {
            for (const event of log) {
              const update = { 'maintenance_log.$.scheduled': event.scheduled };
              await Asset.updateOne({ _id: asset.id, 'maintenance_log._id': event.id },
                { $set: update });
            }
          }
          await Asset.findByIdAndUpdate(asset.id, { 'purchasing_info.warranty_exp' : warranty_exp });
        } else {
          let log = asset.purchase_log;
          if (log.length) {
            for (const event of log) {
              const update = { 'purchase_log.$.received': event.received };
              await Asset.updateOne({ _id: asset.id, 'purchase_log._id': event.id },
                { $set: update });
            }
          }
        }
      }
    },
    addCounter: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateCounterInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Counter registration failed', errors);
      }

      let counter;

      try {
        counter = await Counter.findOne({ $or: [{ name: input.name,  prefix: input.prefix }] });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(counter) {
        errors.errors.counter = 'A counter already exists with the same name or prefix.';
        throw new ApolloError('Counter registration failed', 'BAD_REQUEST', errors);
      } else {

        const newCounter = new Counter({
          name: input.name,
          prefix: input.prefix,
        });

        await newCounter.save();
        return null;
      }
    },
    addUser: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateRegisterInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('User registration failed', errors);
      }

      let user;

      try {
        user = await User.findOne({ login: input.login });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(user) {
        errors.errors.login = 'Username already exists';
        throw new ApolloError('User registration failed', 'BAD_REQUEST', errors);
      } else {

        const newUser = new User({
          email: input.email,
          login: input.login,
          name: input.name,
          password: input.password,
          admin: input.admin
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;
        await newUser.save();
        return null;
      }
    },
    login: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateLoginInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Login failed', errors);
      }

      let user;

      try {
        user = await User.findOne({ login: input.login });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!user) {
        errors.errors.login = 'User not found';
        throw new ApolloError('Login failed', 'BAD_REQUEST', errors);
      } else {
        const isMatch = await bcrypt.compare(input.password, user.password);
        if(isMatch) {
          // Create JWT payload
          const payload = {
            login: user.login,
            name: user.name,
            email: user.email,
            admin: user.admin
          };
          // Sign token
          const token = jwt.sign(
            payload,
            secretOrKey,
            { expiresIn: 3600 });
          return ({
            success: true,
            token: 'Bearer ' + token
          });
        } else {
          errors.errors.password = 'Password incorrect';
          throw new ApolloError('Login failed', 'BAD_REQUEST', errors);
        }
      }
    },

    addAsset: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddAssetInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Asset registration failed', errors);
      }

      let newAsset = new Asset(input);

      switch (input.category) {
      case 'Lab Equipment': {
        let allowed_users;
        const allowed_userIDs = input.users.map(userID => mongoose.Types.ObjectId(userID));

        try {
          allowed_users = await User.find({ '_id': { $in: allowed_userIDs } });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(allowed_users.length != input.users.length) {
          errors.errors.users = 'Selected user(s) no longer exist(s)';
          throw new ApolloError('Asset registration failed', 'BAD_REQUEST', errors);
        } else {
          let barcode = await Counter.getNextSequenceValue(input.category);
          newAsset.barcode = barcode;
        }
        break;
      }
      case 'Lab Supplies': {
        break;
      }
      default: {
        errors.errors.category = 'Category does not exist';
        throw new ApolloError('Asset registration failed', 'BAD_REQUEST', errors);
      }}
      await newAsset.save();
      return null;
    },
    updateAsset: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddAssetInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Asset registration failed', errors);
      }

      switch (input.category) {
      case 'Lab Equipment': {
        let allowed_users;
        const allowed_userIDs = input.users.map(userID => mongoose.Types.ObjectId(userID));
        try {
          allowed_users = await User.find({ '_id': { $in: allowed_userIDs } });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
        if(allowed_users.length != input.users.length) {
          errors.errors.users = 'Selected user(s) no longer exist(s)';
          throw new ApolloError('Asset update failed', 'BAD_REQUEST', errors);
        }
        break;
      }
      case 'Lab Supplies': {
        break;
      }
      default: {
        errors.errors.category = 'Category does not exist';
        throw new ApolloError('Asset registration failed', 'BAD_REQUEST', errors);
      }}

      try {
        const { id, ...update } = input;
        await Asset.findByIdAndUpdate(mongoose.Types.ObjectId(id), update);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
      return null;
    },
    deleteAsset: async (root, args, context, info) => {
      let asset;
      let asset_documents;
      try {
        asset = await Asset.findById(args.id, 'documents');
        const asset_document_IDs = asset.documents.map(docID => mongoose.Types.ObjectId(docID));
        asset_documents = await Document.find({ '_id': { $in: asset_document_IDs } }, 'name');
        const file_names = asset_documents.map(({ _id, name }) => `${_id.toString()}-${name}`);

        await Document.deleteMany({ '_id': { $in: asset_document_IDs } });
        await Asset.findByIdAndDelete(args.id);

        for (const name of file_names) {
          await fse.unlink(path.join(storage, name));
        }
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    addMaintenanceEvent: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddMaintenanceEventInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Event registration failed', errors);
      }

      let asset;
      const { assetID, ...logEntry } = input;

      try {
        asset = await Asset.findById(assetID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!asset) {
        errors.errors.asset = 'This asset has been removed';
        throw new ApolloError('Event registration failed', 'BAD_REQUEST', errors);
      } else {
        asset.maintenance_log.push(logEntry);
        await asset.save();
        const result = true;
        return result;
      }
    },
    updateMaintenanceEvent: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddMaintenanceEventInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Event registration failed', errors);
      }

      let asset;
      const { assetID, eventID, ...logEntry } = input;

      try {
        asset = await Asset.findById(assetID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!asset) {
        errors.errors.asset = 'This asset has been removed';
        throw new ApolloError('Event registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          const update = {};
          Object.keys(logEntry).forEach( field => Object.assign(update, { [`maintenance_log.$.${field}`] : logEntry[field]  }));
          await Asset.updateOne({ _id: assetID, 'maintenance_log._id': eventID },
            { $set: update });
          const result = true;
          return result;
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
      }
    },
    deleteMaintenanceEvent: async (root, args, context, info) => {
      const event_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Asset.findByIdAndUpdate(args.assetID,
          { $pull : { 'maintenance_log' : { '_id': { $in : event_IDs } } } } );
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    addPurchaseEvent: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddPurchaseEventInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Event registration failed', errors);
      }

      let asset;
      const { assetID, ...logEntry } = input;

      try {
        asset = await Asset.findById(assetID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!asset) {
        errors.errors.asset = 'This asset has been removed';
        throw new ApolloError('Event registration failed', 'BAD_REQUEST', errors);
      } else {
        asset.purchase_log.push(logEntry);
        await asset.save();
        const result = true;
        return result;
      }
    },
    updatePurchaseEvent: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddPurchaseEventInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Event registration failed', errors);
      }

      let asset;
      const { assetID, eventID, ...logEntry } = input;

      try {
        asset = await Asset.findById(assetID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!asset) {
        errors.errors.asset = 'This asset has been removed';
        throw new ApolloError('Event registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          const update = {};
          Object.keys(logEntry).forEach( field => Object.assign(update, { [`purchase_log.$.${field}`] : logEntry[field]  }));
          await Asset.updateOne({ _id: assetID, 'purchase_log._id': eventID },
            { $set: update });
          const result = true;
          return result;
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
      }
    },
    exportAssetData: async (root, args, context, info) => {
      const { errors: inputErrors, isValid } = validateFilename(args.input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Data export failed', errors);
      }

      const { search, searchCategories, filter, name } = args.input;
      const { category, location, ...other } = filter;

      let conditions = {};

      conditions.category = category;
      if (location)
        conditions['location.sub_area'] = { $in: location };

      const projection = { maintenance_log: 0, users: 0, purchase_log: 0, documents: 0 };
      let assets = await Asset.find(conditionsFromInput(conditions, other), projection);
      let records = [];
      let columns = [];
      switch (category) {
      case 'Lab Equipment': {
        for (const asset of assets) {
          const { area: areaID, sub_area: subAreaID } = asset.location;
          let location = await Location.findById(areaID);
          const area = location.area.name;
          const sub_area = location.area.sub_areas.id(subAreaID).name;

          let record = JSON.flatten(asset.toObject({
            virtuals: false,
            transform: (doc, ret) => {
              ret['location'] = (area == 'UNASSIGNED') ?
                'UNASSIGNED' : `${area} / ${sub_area}`;
              ret.id = doc.id;
              ret.purchasing_info.date = formatDate(ret.purchasing_info.date);
              ret.purchasing_info.warranty_exp = ret.purchasing_info.warranty_exp ? formatDate(ret.purchasing_info.warranty_exp) : '';
              ret.registration_event.date = formatDate(ret.registration_event.date);
              delete ret['_id'];
              delete ret['__v'];
              return ret;
            }
          }), '.');
          records.push(record);
        }
        columns = [
          { key: 'name', header: 'Name'},
          { key: 'barcode', header: 'Barcode'},
          { key: 'brand', header: 'Brand'},
          { key: 'model', header: 'Model'},
          { key: 'serial_number', header: 'Serial No.'},
          { key: 'location', header: 'Location'},
          { key: 'category', header: 'Category'},
          { key: 'condition', header: 'Condition'},
          { key: 'purchasing_info.date', header: 'Purchase Date'},
          { key: 'purchasing_info.supplier', header: 'Supplier'},
          { key: 'purchasing_info.warranty_exp', header: 'Warranty Expires'},
          { key: 'purchasing_info.price', header: 'Purchase Price'},
          { key: 'grant.funding_agency', header: 'Funding Agency'},
          { key: 'grant.grant_number', header: 'Grant No.'},
          { key: 'grant.project_name', header: 'Project Name'},
          { key: 'registration_event.user', header: 'Registered By'},
          { key: 'registration_event.date', header: 'Registration Date'},
          { key: 'shared', header: 'Shared'},
          { key: 'training_required', header: 'Training Req.'},
          { key: 'description', header: 'Description'},
          { key: 'id', header: 'ID'},
        ];

        break;
      }
      case 'Lab Supplies': {
        for (const asset of assets) {
          let record = asset.toObject({
            virtuals: false,
            transform: (doc, ret) => {
              ret.id = doc.id;
              ret.registration_event.date = formatDate(ret.registration_event.date);
              delete ret['_id'];
              delete ret['__v'];
              return ret;
            }
          });
          records.push(record);
        }
        columns = [
          { key: 'name', header: 'Name'},
          { key: 'description', header: 'Description'},
          { key: 'shared', header: 'Shared'},
          { key: 'registration_event.user', header: 'Registered By'},
          { key: 'registration_event.date', header: 'Registration Date'},
          { key: 'category', header: 'Category'},
          { key: 'id', header: 'ID'},
        ];

        break;
      }
      default: {
        throw new ApolloError('Category does not exist', 'BAD_REQUEST');
      }}

      await fse.ensureDir(cache);

      let data = records.slice()
        .filter( result => !searchCategories.length ||
        searchCategories.some( cat =>
          result[cat].toLowerCase().indexOf(search.toLowerCase()) > -1));
      try {
        let stream = await stringify( data, {
          header: true,
          columns
        });
        await cacheFile({ stream, name });
      } catch(err) {
        throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
      }

      const dstPath = path.join(cache, name);
      try {
        const p = dstPath.split('/');
        const result = p.slice(p.indexOf('public') + 1);
        result.unshift('/');
        return path.join.apply(this, result);
      } catch(err) {
        throw new ApolloError('Document retrieval failed', 'FILE_CACHE_ERROR');
      }
    },
    deletePurchaseEvent: async (root, args, context, info) => {
      const event_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Asset.findByIdAndUpdate(args.assetID,
          { $pull : { 'purchase_log' : { '_id': { $in : event_IDs } } } } );
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    addLocation: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateLocationInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Location registration failed', errors);
      }

      let sub_area;
      let area;

      try {
        sub_area = await Location.findOne({ 'area.name': input.area, 'area.sub_areas.name': input.sub_area });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!sub_area) {
        try {
          area = await Location.findOneAndUpdate({ 'area.name': input.area },
            { $push : { 'area.sub_areas' : { name : input.sub_area } } });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
        if(!area) {
          const newLocation = new Location({
            area: {
              name: input.area,
              sub_areas: [{ name: input.sub_area }]
            }
          });
          await newLocation.save();
        }
      } else {
        errors.errors.sub_area = 'Sub-area already exists';
        throw new ApolloError('Location registration failed', 'BAD_REQUEST', errors);
      }

      return null;
    },
    validateUpload: async (root, args, context, info) => {
      const { name, size } = args.input;
      const { errors: inputErrors, isValid } = validateUploadInput({ name, size });
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Document upload failed', errors);
      }
      return true;
    },
    addDocument: async (root, args, context, info) => {
      const { name, size, category, user, model: modelName, field, objID } = args.input;

      try {
        await fse.ensureDir(storage);
      } catch(err) {
        throw new ApolloError('Document upload failed', 'STORAGE_DIR_NOT_FOUND');
      }

      const { stream, mimetype, encoding } = await args.input.file;

      const newDocument = new Document({
        name,
        mimetype,
        encoding,
        size,
        category,
        upload_event: {
          user
        }
      });

      const id = newDocument.id;
      try {
        await storeFile({ stream, id, name });
      } catch(err) {
        throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
      }

      let Model = await context.db_conn.model(modelName);

      let doc;

      try {
        doc = await Model.findById(objID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!doc) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      } else {
        if(field) {
          doc[field].documents.push(id);
        } else {
          doc.documents.push(id);
        }
        await doc.save();
        await newDocument.save();
        return true;
      }
    },
    deleteDocument: async (root, args, context, info) => {
      let asset_documents;
      let names;
      const document_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Asset.findByIdAndUpdate(args.assetID,
          { $pull : { documents : { $in : document_IDs } } } );
        asset_documents = await Document.find({ '_id': { $in: document_IDs }}, 'name');
        names = asset_documents.map(asset_document => `${asset_document._id.toString()}-${asset_document.name}`);
        await Document.deleteMany({ '_id': { $in: document_IDs }});
        for (const name of names) {
          await fse.unlink(path.join(storage, name));
        }
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    clearDocuments: async (root, args, context, info) => {
      try {
        await fse.emptyDir(cache);
        return null;
      } catch(err) {
        throw new ApolloError('Document removal failed', 'FAILED_TO_EMPTY_DIR');
      }
    },
    registerPrinterHub: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validatePrinterHubInput(input);
      const errors = { errors: inputErrors };
      const user = context.user === undefined ? null : context.user.login;

      if (user) {
        // Check validation
        if (!isValid) {
          throw new UserInputError('Printer registration failed', errors);
        }

        let hub;

        try {
          hub = await PrinterHub.findOne({ address: input.address });
          if(hub) {
            await PrinterHub.findOneAndUpdate({ address: input.address },
              { name: input.name, online: true, user });
            return ({ response: 'Hub is now online' });
          } else {

            const newHub = new PrinterHub({
              name: input.name,
              address: input.address,
              online: input.online,
              user
            });

            await newHub.save();
            return ({ response: 'Hub has been registered and is now online' });
          }
        } catch(err) {
          errors.errors.database = 'Database lookup failed';
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
      }
      else {
        errors.errors.login = 'User not found';
        throw new ApolloError('Login failed', 'BAD_REQUEST', errors);
      }
    },
    addPrinter: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddPrinterInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Printer registration failed', errors);
      }

      let printer;
      let printer_name;

      try {
        printer = await Printer.findOne({ connection_name: input.connection_name });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(printer) {
        errors.errors.connection_name = 'The printer has already been registered.';
        throw new ApolloError('Printer registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          printer_name = await Printer.findOne({ name: input.name });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(printer_name) {
          errors.errors.name = 'Name already exists';
          throw new ApolloError('Printer registration failed', 'BAD_REQUEST', errors);
        } else {
          const newPrinter = new Printer({
            name: input.name,
            connection_name: input.connection_name,
            jobs: []
          });

          await newPrinter.save();
          return true;
        }
      }
    },
    addPrinterJob: async (root, args, context, info) => {
      const { connection_name, job } = args.input;
      const { errors: inputErrors, isValid } = validatePrinterJobInput(job);

      const errors = { errors: { [connection_name]: inputErrors } };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Failed to create the job.', errors);
      }

      let printer;
      try {
        printer = await Printer.findOne({ connection_name });
      } catch(err) {
        errors.errors[connection_name].add = 'Couldn\'t find printer, check database connection.';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!printer) {
        errors.errors[connection_name].add = 'This printer has been removed from the database.';
        throw new ApolloError('Adding printer job failed', 'BAD_REQUEST', errors);
      } else {
        await Printer.updateOne({ connection_name }, { $push: { 'jobs' : {...job, status: 'Queued' } } });
        return true;
      }
    },
    updatePrinter: async (root, args, context, info) => {
      // Update printer checks whether there are jobs in the queue, if true turns queue on,
      // and changes the status of the next job to 'In Progress'
      const { connection_name, queue, reset } = args.input;
      const errors = { errors: { [connection_name]: {} } };
      let printer;

      try {
        printer = await Printer.findOne({ connection_name });
      } catch(err) {
        errors.errors[connection_name].update = 'Couldn\'t find printer, check database connection.';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!printer) {
        errors.errors[connection_name].update = 'This printer has been removed from the database.';
        throw new ApolloError('Update printer job queue failed', 'BAD_REQUEST', errors);
      } else {
        if (printer.jobs.length) {
          if (queue) {
            await Printer.updateOne({ connection_name }, { $set: { 'queue': true, 'jobs.0.status': 'InProgress'} });
            return true;
          } else {
            if (reset) {
              await Printer.updateOne({ connection_name }, { $set: { 'queue': false, 'jobs.0.status': 'Queued'} });
              return true;
            } else {
              await Printer.updateOne({ connection_name }, { $set: { 'queue': false } });
              return true;
            }
          }
        } else {
          errors.errors[connection_name].update = 'There are no jobs in the queue.';
          throw new ApolloError('Update printer job queue failed', 'BAD_REQUEST', errors);
        }
      }
    },
    deletePrinterJob: async (root, args, context, info) => {
      // Delete printer job, if dequeue is true, then check if queue is on.
      // If queue is on, check whether there are jobs in the queue.
      // If there are, update the next job to 'In Progress'.
      // If there aren't, turn queue off.

      let printer;
      const { connection_name, jobID, dequeue } = args.input;
      const errors = { errors: { [connection_name]: {} } };

      try {
        printer = await Printer.findOne({ connection_name });
      } catch(err) {
        errors.errors[connection_name].update = 'Couldn\'t find printer, check database connection.';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!printer) {
        errors.errors[connection_name].update = 'This printer has been removed from the database.';
        throw new ApolloError('Update printer job queue failed', 'BAD_REQUEST', errors);
      } else {
        await printer.jobs.id(jobID).remove();
        await printer.save();
        if (dequeue && printer.queue) {
          if (printer.jobs.length) {
            await Printer.updateOne({ connection_name }, { $set: { 'queue': true, 'jobs.0.status': 'InProgress' } });
            return true;
          } else {
            await Printer.updateOne({ connection_name }, { $set: { 'queue': false } });
            return false;
          }
        }
      }
    }
  }
};

export default resolvers;
