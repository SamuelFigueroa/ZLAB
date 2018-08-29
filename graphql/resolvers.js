import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import fse from 'fs-extra';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { secretOrKey, uploadDir } from '../config';

//Load models
import User from '../models/User';
import Asset from '../models/Asset';
import Location from '../models/Location';
import Document from '../models/Document';


// Load input validation
import validateRegisterInput from '../validation/register';
import validateLoginInput from '../validation/login';
import validateLocationInput from '../validation/location';
import validateAddAssetInput from '../validation/asset';
import validateAddMaintenanceEventInput from '../validation/maintenance_event';
import validateUploadInput from '../validation/upload';

const storeFile = ({ stream, id, name }) => {
  const path = `${uploadDir}/${id}-${name}`;
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fse.unlinkSync(path);
        reject(error);
      })
      .pipe(fse.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => {
        return resolve({ id, path });})
  );
};

const resolvers = {
  Query: {
    assets: async (root, args, context, info) => {
      let assets = await Asset.find();
      return assets.map(async asset => {
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
            // area == 'UNASSIGNED' ?
            //   ret.location = `${area}`
            //   :
            //   ret.location = `${area} / ${sub_area}`;
            return ret;
          }
        });

      });
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
        const { area: areaID, sub_area: subAreaID } = asset.location;
        let location = await Location.findById(areaID);
        const area = location.area.name;
        const sub_area = location.area.sub_areas.id(subAreaID).name;

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

        return asset.toObject({
          virtuals: true,
          transform: (doc, ret) => {
            ret.location = {};
            ret.location.area = {id: areaID, name: area};
            ret.location.sub_area = {id: subAreaID, name: sub_area};
            ret.documents = documents;
            return ret;
          }
        });
      }
    },
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

      let asset;
      let allowed_users;
      const allowed_userIDs = input.users.map(userID => mongoose.Types.ObjectId(userID));

      try {
        asset = await Asset.findOne({ barcode: input.barcode });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(asset) {
        errors.errors.barcode = 'Barcode already exists';
        throw new ApolloError('Asset registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          allowed_users = await User.find({ '_id': { $in: allowed_userIDs } });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(allowed_users.length != input.users.length) {
          errors.errors.users = 'Selected user(s) no longer exist(s)';
          throw new ApolloError('Asset registration failed', 'BAD_REQUEST', errors);
        } else {
          const newAsset = new Asset({ ...input, maintenance_log: [], documents: [] });
          await newAsset.save();
          return null;
        }
      }
    },
    updateAsset: async (root, args, context, info) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddAssetInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Asset registration failed', errors);
      }

      let asset;
      let allowed_users;
      const allowed_userIDs = input.users.map(userID => mongoose.Types.ObjectId(userID));

      try {
        asset = await Asset.findOne({ barcode: input.barcode }).select('id').lean();
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(asset._id.toString() !== input.id) {
        errors.errors.barcode = 'Barcode already exists';
        throw new ApolloError('Asset update failed', 'BAD_REQUEST', errors);
      } else {
        try {
          allowed_users = await User.find({ '_id': { $in: allowed_userIDs } });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(allowed_users.length != input.users.length) {
          errors.errors.users = 'Selected user(s) no longer exist(s)';
          throw new ApolloError('Asset update failed', 'BAD_REQUEST', errors);
        } else {
          try {
            const { id, ...update } = input;
            await Asset.findByIdAndUpdate(mongoose.Types.ObjectId(id), update);
          } catch(err) {
            throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
          }

          return null;
        }
      }
    },

    deleteAsset: async (root, args, context, info) => {
      try {
        await Asset.findByIdAndDelete(args.id);
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
      const { name, size, category, user, model: modelName, field, docID } = args.input;

      try {
        await fse.ensureDir(uploadDir);
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

      const Model = context.db_conn.model(modelName);

      let doc;

      try {
        doc = await Model.findById(docID);
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
    }
  }
};

export default resolvers;
