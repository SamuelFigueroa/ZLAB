import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import { storageDir, cacheDir } from '../../config';
import path from 'path';
import fse from 'fs-extra';
import stringify from 'csv-stringify';

import Asset from '../../models/Asset';
import Counter from '../../models/Counter';
import Document from '../../models/Document';
import Location from '../../models/Location';
import User from '../../models/User';

import validateAssetFilter from '../../validation/asset_filter';
import validateAddAssetInput from '../../validation/asset';
import validateAddMaintenanceEventInput from '../../validation/maintenance_event';
import validateAddPurchaseEventInput from '../../validation/purchase_event';
import validateFilename from '../../validation/filename';

const storage = path.normalize(storageDir);
const cache = path.normalize(cacheDir);

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

const getFilterConditions = flatFilter =>
  Object.keys(flatFilter).map(key => {
    const value = flatFilter[key];
    if (Array.isArray(value))
      return { [key]: { $in: value } };
    const keyArr = key.split('.');
    let lastKey = keyArr.pop();
    if( lastKey == 'min')
      return { [keyArr.join('.')]: { $gte: typeof value == 'string' ? new Date(value) : value } };
    if( lastKey == 'max')
      return { [keyArr.join('.')]: { $lte: typeof value == 'string' ? new Date(value) : value } };
    return { [key]: value };
  });

const resolvers = {

  Asset: {
    __resolveType(obj) {
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
    assets: async (root, args) => {
      const { filter, search } = args;
      let searchPipelineIndex = 3;

      let pipeline = [
        {
          $lookup: {
            from: 'locations',
            localField: 'location.area',
            foreignField: '_id',
            as: 'locArray'
          }
        },
        {
          $addFields: {
            'id': '$_id',
            'location.area.id': '$location.area',
            'location.sub_area.id': '$location.sub_area',
            'location.area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc.area.name'
              }
            },
            'location.sub_area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: {
                  $let: {
                    vars: { sub: { $arrayElemAt: [{
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area._id', '$location.sub_area']}
                      }}, 0]}},
                    in: '$$sub.name'
                  }}
              }}
          }
        },
        { $project: { _id: 0, locArray: 0, 'location.area._id': 0, 'location.sub_area._id': 0 } },
        { $group: { _id: '$category', results: { $push: '$$ROOT' } } },
        { $addFields: { category: '$_id' } },
        { $project: { _id: 0 } },
      ];

      let assets = [];
      if(filter && Object.keys(filter).length) {
        const { errors: inputErrors, isValid } = validateAssetFilter(filter);
        const errors = { errors: inputErrors };
        // Check validation
        if (!isValid) {
          throw new UserInputError('Asset filtering failed', errors);
        }

        const { location, users, ...other } = filter;
        const flatFilter = JSON.flatten(other, '.');
        const filterConditions = {
          $and: getFilterConditions(flatFilter)
        };
        if (location)
          filterConditions['$and'].unshift({ 'location.sub_area': { $in: location.map(locID => mongoose.Types.ObjectId(locID)) } });
        if (users)
          filterConditions['$and'].unshift({ 'users': { $in: users.map(userID => mongoose.Types.ObjectId(userID)) } });

        pipeline.unshift({ $match:  filterConditions });
        searchPipelineIndex++;
      }

      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['shared', 'training_required'];

        if(words) {

          let paths = Object.keys(Asset.schema.paths).filter(path =>
            ( Asset.schema.paths[path].instance == 'String' ||
            (
              Asset.schema.paths[path].instance == 'Array' &&
              Asset.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Asset.schema.childSchemas;

          Object.keys(childSchemas).forEach(childSchema => {
            let parent = childSchemas[childSchema].model.path;
            let p = Object.keys(childSchemas[childSchema].model.schema.paths)
              .filter( path =>
                childSchemas[childSchema].model.schema.paths[path].instance == 'String' ||
              (
                childSchemas[childSchema].model.schema.paths[path].instance == 'Array' &&
                childSchemas[childSchema].model.schema.paths[path].caster.instance == 'String'
              ))
              .map( path => `${parent}.${path}`);

            paths = paths.concat(p);
          });

          paths.push('location.area.name','location.sub_area.name');
          let searchConditions = {
            $and: words.map( word => ({ '$or': paths.map( path => ({ [path]: { $regex: new RegExp(word, 'i') } })) }))
          };

          pipeline.splice(searchPipelineIndex, 0, { $match: searchConditions });
        } else {
          return assets;
        }
      }
      assets = await Asset.aggregate(pipeline);
      return assets;
    },
    asset: async (root, args) => {
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
  },
  Mutation: {
    addAsset: async (root, args) => {
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
    updateAsset: async (root, args) => {
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
    deleteAsset: async (root, args) => {
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
    addMaintenanceEvent: async (root, args) => {
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
    updateMaintenanceEvent: async (root, args) => {
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
    deleteMaintenanceEvent: async (root, args) => {
      const event_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Asset.findByIdAndUpdate(args.assetID,
          { $pull : { 'maintenance_log' : { '_id': { $in : event_IDs } } } } );
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    addPurchaseEvent: async (root, args) => {
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
    updatePurchaseEvent: async (root, args) => {
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
    exportAssetData: async (root, args) => {
      const { errors: inputErrors, isValid } = validateFilename(args.input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Data export failed', errors);
      }

      const { filter, search, searchCategories, search2, name } = args.input;
      let searchPipelineIndex = 4;

      let pipeline = [
        {
          $lookup: {
            from: 'locations',
            localField: 'location.area',
            foreignField: '_id',
            as: 'locArray'
          }
        },
        {
          $addFields: {
            'id': '$_id',
            'location.area.id': '$location.area',
            'location.sub_area.id': '$location.sub_area',
            'location.area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc.area.name'
              }
            },
            'location.sub_area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: {
                  $let: {
                    vars: { sub: { $arrayElemAt: [{
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area._id', '$location.sub_area']}
                      }}, 0]}},
                    in: '$$sub.name'
                  }}
              }}
          }
        },
        { $project: { _id: 0, locArray: 0, 'location.area._id': 0, 'location.sub_area._id': 0, maintenance_log: 0, users: 0, purchase_log: 0, documents: 0 } },
        { $group: { _id: '$category', results: { $push: '$$ROOT' } } },
        { $addFields: { category: '$_id' } },
        { $project: { _id: 0 } },
      ];

      let assets = [];

      const { location, users, ...other } = filter;
      const flatFilter = JSON.flatten(other, '.');
      const filterConditions = {
        $and: getFilterConditions(flatFilter)
      };
      if (location)
        filterConditions['$and'].unshift({ 'location.sub_area': { $in: location.map(locID => mongoose.Types.ObjectId(locID)) } });
      if (users)
        filterConditions['$and'].unshift({ 'users': { $in: users.map(userID => mongoose.Types.ObjectId(userID)) } });

      pipeline.unshift({ $match:  filterConditions });

      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['shared', 'training_required'];

        if(words) {

          let paths = Object.keys(Asset.schema.paths).filter(path =>
            ( Asset.schema.paths[path].instance == 'String' ||
            (
              Asset.schema.paths[path].instance == 'Array' &&
              Asset.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Asset.schema.childSchemas;

          Object.keys(childSchemas).forEach(childSchema => {
            let parent = childSchemas[childSchema].model.path;
            let p = Object.keys(childSchemas[childSchema].model.schema.paths)
              .filter( path =>
                childSchemas[childSchema].model.schema.paths[path].instance == 'String' ||
              (
                childSchemas[childSchema].model.schema.paths[path].instance == 'Array' &&
                childSchemas[childSchema].model.schema.paths[path].caster.instance == 'String'
              ))
              .map( path => `${parent}.${path}`);

            paths = paths.concat(p);
          });

          paths.push('location.area.name','location.sub_area.name');
          let searchConditions = {
            $and: words.map( word => ({ '$or': paths.map( path => ({ [path]: { $regex: new RegExp(word, 'i') } })) }))
          };

          pipeline.splice(searchPipelineIndex, 0, { $match: searchConditions });
        } else {
          return assets;
        }
      }
      assets = await Asset.aggregate(pipeline);

      let columns = [];
      let records = [];
      switch (filter.category) {
      case 'Lab Equipment': {
        if (assets.length) {
          for (const asset of assets[0].results) {
            let record = JSON.flatten(asset, '.');
            record.id = asset.id.toString();
            record['location'] = (asset.location.area.name == 'UNASSIGNED') ?
              'UNASSIGNED' : `${asset.location.area.name} / ${asset.location.sub_area.name}`;
            record['purchasing_info.date'] = formatDate(asset.purchasing_info.date);
            record['purchasing_info.warranty_exp'] = asset.purchasing_info.warranty_exp ? formatDate(asset.purchasing_info.warranty_exp) : '';
            record['registration_event.date'] = formatDate(asset.registration_event.date);
            record['category'] = 'Equipment';
            records.push(record);
          }
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
        if (assets.length) {
          for (const asset of assets[0].results) {
            let record = asset;
            record.id = asset.id.toString();
            record['registration_event.date'] = formatDate(asset.registration_event.date);
            record['category'] = 'Consumables';
            records.push(record);
          }
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
          result[cat].toLowerCase().indexOf(search2.toLowerCase()) > -1));
      try {
        let stream = await stringify( data, {
          header: true,
          columns
        });
        await cacheFile({ stream, name });
      } catch(err) {
        throw new ApolloError('Data export failed', 'DATA_EXPORT_ERROR');
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
    deletePurchaseEvent: async (root, args) => {
      const event_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Asset.findByIdAndUpdate(args.assetID,
          { $pull : { 'purchase_log' : { '_id': { $in : event_IDs } } } } );
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
  }
};


export default resolvers;
