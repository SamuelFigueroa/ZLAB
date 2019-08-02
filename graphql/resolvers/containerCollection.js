import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import Validator from 'validator';
import path from 'path';
import parse from 'csv-parse';
import transform from 'stream-transform';
import rdkit from 'node-rdkit';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { cacheDir } from '../../config';

import StagedContainer from '../../models/StagedContainer';
import Collection from '../../models/Collection';
import Container from '../../models/Container';
import User from '../../models/User';

import validateAddContainerInput from '../../validation/container';
import validateAddCompoundInput from '../../validation/compound';

import registerContainerCollection from '../../mongo/collection/registerContainerCollection';
import exportContainerCollection from '../../mongo/collection/exportContainerCollection';

const CONTAINER_REGISTERED = 'CONTAINER_REGISTERED';
const REGISTRATION_STARTED = 'REGISTRATION_STARTED';
const REGISTRATION_FINISHED = 'REGISTRATION_FINISHED';
const REGISTRATION_QUEUED = 'REGISTRATION_SUBMITTED';

const cache = path.normalize(cacheDir);

const asyncPipeline = promisify(pipeline);

const parseCsvFile = async ({ stream, parser, transformer }) => {
  await asyncPipeline(
    stream,
    parser,
    transformer,
  );
};

const resolvers = {
  Query: {
    containerCollections: async () => {
      let collections = await Collection.find({ item: 'StagedContainer' });
      return collections;
    },
    containerCollection: async (root, { id }) => {
      let collection = await Collection.findById(id);
      return collection;
    },
    stagedContainers: async (root, { collectionID, offset, limit }) => {
      let stagedContainers = await StagedContainer.find({ collection_id: collectionID, collection_index: { $gte: offset, $lt: offset + limit } }).sort('collection_index');
      for (const container of stagedContainers)
        container.content.molblock = rdkit.smilesToMolBlock(container.content.smiles);
      return stagedContainers;
    },
    containerNormalization: async(root, { collectionID }) => {
      const containerNormalizationFields = new Set(['Vendor', 'Institution', 'Researcher', 'Solvent']);

      //Find all unregistered sources, researchers and solvents.
      let result = [];
      for (const f of containerNormalizationFields) {
        const field = f.toLowerCase();
        let registeredValues = await Container.distinct(field, { [field]: { $not: /^$/ } });
        let stagedValues = await StagedContainer.distinct(field, { collection_id: collectionID, [field]: { $not: /^$/ } });
        registeredValues = new Set(registeredValues);
        result = result.concat(stagedValues.filter(value => !registeredValues.has(value))
          .map(value=>({ id: `${field}_${value}`, unregistered: value, registerAs: null, field: f })));
      }

      return result;
    },
    locationNormalization: async(root, { collectionID }) => {
      let result = [];

      //Find all unregistered StagedLocations.
      let unregisteredLocations = await StagedContainer.aggregate([
        { $match : { collection_id : mongoose.Types.ObjectId(collectionID) } },
        { $group : { _id : { area: '$location.area', sub_area: '$location.sub_area' } }},
        { $lookup: {
          from: 'locations',
          localField: '_id.area',
          foreignField: 'area.name',
          as: 'locArray'
        }
        },
        { $addFields: {
          'sub_areas': {
            $cond: {
              if: { $gt: [ { $size: '$locArray' }, 0 ] },
              then: {
                $let: {
                  vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                  in: { $map: { input: '$$loc.area.sub_areas',
                    as: 'subAreas',
                    in: '$$subAreas.name' } }
                }
              },
              else: undefined
            }
          }
        }},
        { $match: { $expr: { $or: [
          { $eq: [ { $size: '$locArray' }, 0 ] },
          { $not: [ { $in: [ '$_id.sub_area', '$sub_areas' ] } ] }
        ] } } },
        { $replaceRoot: { newRoot: { $mergeObjects:  [ '$_id' ] } } }
      ]);
      result = unregisteredLocations.map(value=>({ id: `location_${value.area}_${value.sub_area}`, unregistered: value, registerAs: null, field: 'Location' }));
      return result;
    },
    userNormalization: async(root, { collectionID }) => {
      let result = [];

      //Find all unregistered owners.
      let registeredUsers = await User.distinct('login');
      let stagedOwners = await StagedContainer.distinct('owner', { collection_id: collectionID });
      registeredUsers = new Set(registeredUsers);
      result = stagedOwners.filter(user => !registeredUsers.has(user))
        .map(value=>({ id: `owner_${value}`, unregistered: value, registerAs: null, field: 'Owner' }));

      return result;
    }
  },
  Mutation: {
    addContainerCollection: async (root, args) => {
      const { name, size, user } = args.input;
      const errors = { errors: {} };

      const { createReadStream, mimetype } = await args.input.file;
      const stream = createReadStream();
      if(mimetype !== 'text/csv') {
        errors.errors.file = 'File format was not recognized as CSV.';
        throw new UserInputError('Container registration failed', errors);
      }
      if(parseFloat(size) > 10000000) {
        errors.errors.size = 'File size exceeds 10 MB.';
        throw new UserInputError('Container registration failed', errors);
      }
      let newContainerCollection = new Collection({ name, user, item: 'StagedContainer' });

      // Create the parser
      const columns = {
        'SMILES': 'smiles',
        'Barcode': 'barcode',
        'Compound Name': 'name',
        'CAS No.': 'cas',
        'Category': 'category',
        'Area': 'area',
        'Sub Area': 'sub_area',
        'Vendor': 'vendor',
        'Catalog ID': 'catalog_id',
        'Institution': 'institution',
        'Researcher': 'researcher',
        'ELN ID': 'eln_id',
        'State': 'state',
        'Mass': 'mass',
        'Mass Units': 'mass_units',
        'Volume': 'volume',
        'Volume Units': 'vol_units',
        'Concentration': 'concentration',
        'Conc. Units': 'conc_units',
        'Solvent': 'solvent',
        'Owner': 'owner',
        'Compound Description': 'description',
        'Container Description': 'container_description',
        'Storage Conditions': 'storage'
      };
      let valid_header = new Set(Object.keys(columns));
      const num_columns = Array.from(valid_header).length;

      const parser = parse({ relax_column_count: true, columns: h => {
        let invalid_columns = [];
        let file_header = h.map(c=>c.trim())
          .filter(c=>{
            if(!c.length)
              return false;
            if (valid_header.has(c)){
              return true;
            } else {
              invalid_columns.push(c);
              return false;
            }});
        let header = new Set(file_header);
        const duplicate_columns = file_header.filter(c => !header.delete(c));
        header = new Set(file_header);
        const missing = Array.from(new Set([...valid_header].filter(x => !header.has(x))));
        header = Array.from(header).map(column => columns[column]);
        if((header.length === num_columns) && !duplicate_columns.length)
          return header;
        errors.errors.header = `File contains invalid header.${invalid_columns.length ? ` The following column names are not valid: ${invalid_columns}.`: (
          `${missing.length ? ` The following column names were not found: ${missing}.` : (
            `${duplicate_columns.length ? ` The following column names were found more than once: ${duplicate_columns}.` : ''}`
          )}`
        )}`;
        throw new UserInputError('Collection registration failed', errors);
      }});

      const transformer = transform( (data, callback) => {
        return new Promise((resolve,reject) => {
          const { smiles, name, cas, description, storage, owner, area, sub_area, mass, volume, concentration, container_description, ...containerFields } = data;

          const container = {
            ...containerFields,
            owner: owner.trim(),
            collection_id: newContainerCollection.id,
            mass: (mass.length && parseFloat(mass.replace(/,/g, ''))) || null,
            volume: (volume.length && parseFloat(volume.replace(/,/g, ''))) || null,
            concentration: (concentration.length && parseFloat(concentration.replace(/,/g, ''))) || null,
            description: container_description,
            location: {
              area: area.length ? area.trim() : 'UNASSIGNED',
              sub_area: (area.length && sub_area.length && area != 'UNASSIGNED') ? sub_area.trim() : 'UNASSIGNED'
            },
          };
          container.barcode = container.barcode.trim();

          const { started } = transformer.state;
          const errorMessage = container.barcode ? `Container has barcode ${container.barcode}.` : 'Container has no barcode.';

          if(!Validator.isLength(container.location.area, { min: 2, max: 30 })) {
            errors.errors.area = 'Area name must have 2 to 30 characters';
            errors.errors.file = `An error occured at container #${started}. ${errorMessage}`;
            return reject(new UserInputError('Collection registration failed', errors));
          }

          if(!Validator.isLength(container.location.sub_area, { min: 2, max: 30 })) {
            errors.errors.sub_area = 'Sub-area name must have 2 to 30 characters';
            errors.errors.file = `An error occured at container #${started}. ${errorMessage}`;
            return reject(new UserInputError('Collection registration failed', errors));
          }

          let canonicalSmiles;
          let molblock;
          try {
            molblock = rdkit.smilesToMolBlock(smiles);
            canonicalSmiles = rdkit.molBlockToSmiles(molblock);
          } catch(err) {
            errors.errors.smiles = `Unable to parse SMILES entered: ${smiles}`;
            errors.errors.file = `An error occured at container #${started}. ${errorMessage}`;
            return reject(new UserInputError('Collection registration failed', errors));
          }

          const content = { smiles: canonicalSmiles, originalSmiles: smiles, name, cas, description, storage };

          if(container.barcode.length && container.category == 'Reagent') {
            errors.errors.barcode = 'Reagents should not have a barcode value because they will be assigned one during registration.';
            errors.errors.file = `An error occured at container #${started}. ${errorMessage}`;
            return reject(new UserInputError('Collection registration failed', errors));
          }

          if(smiles.length && !canonicalSmiles.length) {
            errors.errors.smiles = `Unable to parse SMILES entered: ${smiles}`;
            errors.errors.file = `An error occured at container #${started}. ${errorMessage}`;
            return reject(new UserInputError('Collection registration failed', errors));
          }

          //Validate and sanitize container record
          const { errors: containerInputErrors, isValid: isValidContainer } = validateAddContainerInput(container);
          const { errors: compoundInputErrors, isValid: isValidCompound } = validateAddCompoundInput(content);
          if(!(isValidContainer && isValidCompound)) {
            errors.errors = { ...compoundInputErrors, ...containerInputErrors };
            errors.errors.file = `Error(s) occured at container #${started}. ${errorMessage}`;
            return reject(new UserInputError('Collection registration failed', errors));
          }
          return resolve({ ...container, content });

        })
          .then(res=>callback(null, res))
          .catch(err=>callback(err));
      });
      // Catch any error
      parser.on('error', () => null);

      let recordCount = 0;
      transformer.on('readable', () => {
        (async () => {
          let records = [];
          for await (const record of transformer) {
            record.collection_index = recordCount;
            recordCount++;
            records.push(record);
          }
          await StagedContainer.insertMany(records);
        })();
      });

      transformer.on('error', () => null);


      // Write data to the stream
      try {
        await parseCsvFile({ stream, parser, transformer });
      } catch(err) {
        throw new UserInputError('Container registration failed', { errors: err.errors });
      }

      // Close the readable stream
      parser.end();
      transformer.end();

      try {
        newContainerCollection.size = recordCount + 1;
        await newContainerCollection.save();
      } catch(err) {
        throw new UserInputError('Container registration failed', errors);
      }

      return newContainerCollection;
    },
    normalizeContainerCollection: async (root, { input }, { pubsub }) => {
      const {
        id,
        containerFieldsNormalized,
        locationsNormalized,
        usersNormalized
      } = input;

      let collection = await Collection.findOneAndUpdate({ _id: id, status: 'Initial' }, { status: 'Queued' });
      if(collection) {
        for (const normalization of containerFieldsNormalized) {
          const { field, unregistered, registerAs } = normalization;
          await StagedContainer.updateMany({ collection_id: id, [field]: unregistered }, { [field]: registerAs });
        }

        for (const normalization of locationsNormalized) {
          const { unregistered, registerAs } = normalization;
          const { area: unregisteredArea, sub_area: unregisteredSubArea } = unregistered;
          const { area: registerAsArea, sub_area: registerAsSubArea } = registerAs;
          await StagedContainer.updateMany({ collection_id: id, 'location.area': unregisteredArea, 'location.sub_area': unregisteredSubArea }, { 'location.area': registerAsArea, 'location.sub_area': registerAsSubArea });
        }

        for (const normalization of usersNormalized) {
          const { unregistered, registerAs } = normalization;
          await StagedContainer.updateMany({ collection_id: id, owner: unregistered }, { owner: registerAs });
        }
        pubsub.publish(REGISTRATION_QUEUED, { registrationQueued: id });
      }
      return null;
    },
    resetRegistrationQueue: async () => {
      await Collection.updateMany({ status: 'Queued' },
        { status: 'Initial' });
      await Collection.findOneAndUpdate({ status: 'InProgress' },
        { $unset: { inProgress: '' }, status: 'Error' });
    },
    startRegistrationQueue: async (root, args, { pubsub }) => {
      try {
        let nextRegistrationInQueue = await Collection.findOneAndUpdate({ status: 'Queued' }, { inProgress: true, status: 'InProgress' }, { sort: { createdAt: 1 } });
        pubsub.publish(REGISTRATION_STARTED, { registrationStarted: nextRegistrationInQueue.id });
        registerContainerCollection(nextRegistrationInQueue, pubsub);
      } catch(err) {
        console.log('Another registration is currently in progress.');
      }
    },
    unqueueContainerCollection: async (root, { ids }) => {
      const collectionIDs = ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Collection.updateMany({ '_id': { $in : collectionIDs }, status: 'Queued' }, { status: 'Initial' }, { timestamps: false });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return ids;
    },
    deleteContainerCollection: async (root, { ids }) => {
      const collectionIDs = ids.map(id => mongoose.Types.ObjectId(id));
      let idleCollectionIDs;
      try {
        let collections = await Collection.find({ '_id': { $in : collectionIDs }, status: { $nin: ['InProgress', 'Queued'] }}).select('_id');
        idleCollectionIDs = collections.map(c => mongoose.Types.ObjectId(c._id));
        await Collection.deleteMany({ _id: { $in : idleCollectionIDs } });
        await StagedContainer.deleteMany({ collection_id: idleCollectionIDs });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return idleCollectionIDs;
    },
    exportRegistrationTemplate: async () => {
      const templatePath = path.join(cache, 'registration_template.csv');
      let filePath = await exportContainerCollection({
        extraCols: [],
        dstPath: templatePath,
        data: new Readable({
          read() {
            this.push(null);
          }
        })
      });
      return filePath;
    },
    exportContainerCollection: async (root, { id }) => {
      let collection = await Collection.findById(id);
      let stagedContainers = StagedContainer
        .find({ collection_id: id })
        .cursor({
          transform: ({ _doc }) => {
            const { content, description, location, registrationError, __v, collection_index, collection_id, _id, ...doc } = _doc;
            return ({
              ...doc,
              smiles: content.originalSmiles,
              name: content.name,
              cas: content.cas,
              description: content.description,
              storage: content.storage,
              container_description: description,
              area: location.area,
              sub_area: location.sub_area,
              errorKey: registrationError.key,
              errorMessage: registrationError.message
            });
          }
        });
      const dstPath = path.join(cache, `import_errors_${collection.name}`);
      const extraCols = [
        { key: 'errorKey', header: 'Error Key' },
        { key: 'errorMessage', header: 'Error Message' }
      ];
      let filePath = await exportContainerCollection({
        extraCols,
        dstPath,
        data: stagedContainers
      });
      return filePath;
    }
  },
  Subscription: {
    containerRegistered: {
      subscribe: (root, args, { pubsub }) => pubsub.asyncIterator([CONTAINER_REGISTERED])
    },
    registrationQueued: {
      subscribe: (root, args, { pubsub }) => pubsub.asyncIterator([REGISTRATION_QUEUED])
    },
    registrationStarted: {
      subscribe: (root, args, { pubsub }) => pubsub.asyncIterator([REGISTRATION_STARTED])
    },
    registrationFinished: {
      subscribe: (root, args, { pubsub }) => pubsub.asyncIterator([REGISTRATION_FINISHED])
    },
  },
};

export default resolvers;
