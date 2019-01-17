import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import { storageDir, cacheDir } from '../../config';
import path from 'path';
import fse from 'fs-extra';
import stringify from 'csv-stringify';
import rdkit from 'node-rdkit';
import Compound from '../../models/Compound';
import Container from '../../models/Container';
import Counter from '../../models/Counter';
import Document from '../../models/Document';
import Location from '../../models/Location';
import Curation from '../../models/Curation';
import SafetyDataSheet from '../../models/SafetyDataSheet';

import validateCompoundFilter from '../../validation/compound_filter';
import validateAddCompoundInput from '../../validation/compound';
import validateAddContainerInput from '../../validation/container';
import validateFilename from '../../validation/filename';
import validateCuration from '../../validation/curation';
import isCas from '../../validation/is-cas';

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

const unit_multipliers = {
  n: 0.001,
  u: 1,
  m: 1000,
  k: 1000000000,
  g: 1000000,
  M: 1000000,
  L: 1000000
};

const resolvers = {

  Query: {
    compounds: async (root, args) => {
      const { filter, search, withSDS } = args;
      let pipeline = [
        {
          $unwind: '$containers'
        },
        {
          $lookup: {
            from: 'containers',
            localField: 'containers',
            foreignField: '_id',
            as: 'containerArray'
          }
        },
        {
          $addFields: {
            'container': {
              $let: {
                vars: { container: { $arrayElemAt: ['$containerArray', 0] }},
                in: '$$container'
              }
            }
          }
        },
        {
          $addFields: {
            'container.content': '$$ROOT',
            'container.u_mass' : {
              $cond: {
                if: { $eq: ['$container.state', 'S'] },
                then: {
                  $cond: {
                    if: { $eq: [ '$container.mass_units', 'mg' ] },
                    then: { $multiply: [ '$container.mass', 1000] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$container.mass_units', 'g' ] },
                        then: { $multiply: [ '$container.mass', 1000000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$container.mass_units', 'kg' ] },
                            then: { $multiply: [ '$container.mass', 1000000000] },
                            else: '$container.mass'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'container.u_volume' : {
              $cond: {
                if: { $or: [ { $eq: ['$container.state', 'L'] }, { $eq: ['$container.state', 'G'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$container.vol_units', 'nL' ] },
                    then: { $multiply: [ '$container.volume', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$container.vol_units', 'mL' ] },
                        then: { $multiply: [ '$container.volume', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$container.vol_units', 'L' ] },
                            then: { $multiply: [ '$container.volume', 1000000] },
                            else: '$container.volume'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'container.u_concentration' : {
              $cond: {
                if: { $or: [ { $eq: ['$container.state', 'Soln'] }, { $eq: ['$container.state', 'Susp'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$container.conc_units', 'nM' ] },
                    then: { $multiply: [ '$container.concentration', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$container.conc_units', 'mM' ] },
                        then: { $multiply: [ '$container.concentration', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$container.conc_units', 'M' ] },
                            then: { $multiply: [ '$container.concentration', 1000000] },
                            else: '$container.concentration'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            }
          }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'container.location.area',
            foreignField: '_id',
            as: 'locArray'
          }
        },
        {
          $addFields: {
            'compound': '$$ROOT',
            'container.content.id': '$container.content._id',
            'container.id': '$container._id',
            'container.location.area.id': '$container.location.area',
            'container.location.sub_area.id': '$container.location.sub_area',
            'container.location.area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc.area.name'
              }
            },
            'container.location.sub_area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: {
                  $let: {
                    vars: { sub: { $arrayElemAt: [{
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area._id', '$container.location.sub_area']}
                      }}, 0]}},
                    in: '$$sub.name'
                  }}
              }
            },
          }
        },
        {
          $project: {
            'compound.containers': 0,
            'compound.containerArray': 0,
            'compound.locArray': 0,
            'container._id': 0,
            'container.location.area._id': 0,
            'container.location.sub_area._id': 0,
            'container.u_mass': 0,
            'container.u_volume': 0,
            'container.u_concentration': 0,
            'container.content._id': 0,
            'container.content.container': 0,
            'container.content.containerArray': 0,
            'container.content.containers': 0,
            'container.content.transfers': 0,
            'container.content.curations': 0,
            'container.content.batchCount': 0
          }
        },
        {
          $group : { _id : '$_id', compound: { $mergeObjects: '$compound' }, containers: { $push: '$container' } }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$compound', '$$ROOT' ] } }
        },
        {
          $addFields: {
            'id': '$_id',
          }
        },
        {
          $project: { '_id': 0, 'compound': 0, 'container': 0 }
        },
      ];

      let compounds = [];
      if(filter && Object.keys(filter).length) {
        const { errors: inputErrors, isValid } = validateCompoundFilter(filter, 'compounds');
        const errors = { errors: inputErrors };
        // Check validation
        if (!isValid) {
          throw new UserInputError('Compound filtering failed', errors);
        }

        const { container, ...compoundFilters } = filter;
        let other = compoundFilters;
        let containerLocation;
        let containerOwner;
        let containerAmounts = {};
        let amountFilterConditions;

        if (container) {
          const { location, owner, mass, mass_units, volume, vol_units, concentration, conc_units, ...containerFilters } = container;
          if(mass !== undefined) {
            if(mass.max !== undefined) containerAmounts['container.u_mass.max'] = mass.max * (unit_multipliers[mass_units.max[0]]);
            if(mass.min !== undefined) containerAmounts['container.u_mass.min'] = mass.min * (unit_multipliers[mass_units.min[0]]);
          }
          if(volume !== undefined) {
            if(volume.max !== undefined) containerAmounts['container.u_volume.max'] = volume.max * (unit_multipliers[vol_units.max[0]]);
            if(volume.min !== undefined) containerAmounts['container.u_volume.min'] = volume.min * (unit_multipliers[vol_units.min[0]]);
          }
          if(concentration !== undefined) {
            if(concentration.max !== undefined) containerAmounts['container.u_concentration.max'] = concentration.max * (unit_multipliers[conc_units.max[0]]);
            if(concentration.min !== undefined) containerAmounts['container.u_concentration.min'] = concentration.min * (unit_multipliers[conc_units.min[0]]);
          }

          other = { ...compoundFilters };
          if(Object.keys(containerFilters).length)
            other.container = containerFilters;
          containerLocation = location;
          containerOwner = owner;
        }

        let flatFilter;
        let filterConditions = {'$and': []};
        if (Object.keys(other).length) {
          flatFilter = JSON.flatten(other, '.');
          filterConditions = {
            $and: getFilterConditions(flatFilter)
          };
        }

        if(Object.keys(containerAmounts).length) {
          amountFilterConditions = {
            $and: getFilterConditions(containerAmounts)
          };
        }

        let pipelineAmtIndex = 4;

        if (containerLocation)
          filterConditions['$and'].unshift({ 'container.location.sub_area': { $in: containerLocation.map(locID => mongoose.Types.ObjectId(locID)) } });
        if (containerOwner)
          filterConditions['$and'].unshift({ 'container.owner':{ $in: containerOwner.map(ownerID => mongoose.Types.ObjectId(ownerID)) } });
        if (filterConditions['$and'].length) {
          // pipeline.unshift({ $match:  filterConditions });
          pipeline.splice(pipelineAmtIndex, 0, { $match:  filterConditions });
          pipelineAmtIndex++;
        }

        if (amountFilterConditions)
          pipeline.splice(pipelineAmtIndex, 0, { $match:  amountFilterConditions });
      }

      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['amount_units'];
        const includedFields = [
          'containers.location.area.name',
          'containers.location.sub_area.name',
          'containers.category',
          'containers.barcode',
          'containers.batch_id',
          'containers.vendor',
          'containers.catalog_id',
          'containers.institution',
          'containers.researcher',
          'containers.eln_id',
          'containers.state',
          'containers.solvent',
          'containers.description',
          'containers.registration_event.user'
        ];

        if(words) {
          let paths = Object.keys(Compound.schema.paths).filter(path =>
            ( Compound.schema.paths[path].instance == 'String' ||
            (
              Compound.schema.paths[path].instance == 'Array' &&
              Compound.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Compound.schema.childSchemas;

          Object.keys(childSchemas).forEach(childSchema => {
            let parent = childSchemas[childSchema].model.path;
            let p = Object.keys(childSchemas[childSchema].model.schema.paths)
              .filter( path =>
                excludedFields.indexOf(path) == -1 &&
                childSchemas[childSchema].model.schema.paths[path].instance == 'String' ||
              (
                childSchemas[childSchema].model.schema.paths[path].instance == 'Array' &&
                childSchemas[childSchema].model.schema.paths[path].caster.instance == 'String'
              ))
              .map( path => `${parent}.${path}`);

            paths = paths.concat(p);
          });

          paths = paths.concat(includedFields);
          let searchConditions = {
            $and: words.map( word => ({ '$or': paths.map( path => ({ [path]: { $regex: new RegExp(word, 'i') } })) }))
          };
          pipeline.push({ $match: searchConditions });
        } else {
          return compounds;
        }
      }
      if(withSDS !== undefined)
        pipeline.unshift({ $match: withSDS ?
          ({ '$and': [{ safety: { $exists: true } }, { safety: { $type : 'objectId' } }] }) :
          ({ '$or': [{ safety: { $exists: false } }, { safety: null }]}) });

      compounds = await Compound.aggregate(pipeline);

      for (const compound of compounds) {
        let molblock = rdkit.smilesToMolBlock(compound.smiles);
        compound.molblock = molblock;
        for (const container of compound.containers)
          container.content.molblock = molblock;
      }

      return compounds;
    },
    compound: async (root, args) => {
      let compound = await Compound.findById(args.id);
      if(!compound) {
        throw new ApolloError('Can\'t find compound', 'BAD_REQUEST');
      } else {
        const {
          id,
          smiles,
          compound_id,
          name,
          description,
          attributes,
          flags,
          storage,
          cas,
          registration_event
        } = compound;

        let molblock = rdkit.smilesToMolBlock(smiles);
        let content = {
          id,
          smiles,
          molblock,
          compound_id,
          name,
          description,
          attributes,
          flags,
          storage,
          cas,
          registration_event
        };
        let containers = [];

        let result;

        for (const containerID of compound.containers) {
          let container = await Container.findById(containerID);
          const { area: areaID, sub_area: subAreaID } = container.location;
          let location = await Location.findById(areaID);
          const area = location.area.name;
          const sub_area = location.area.sub_areas.id(subAreaID).name;

          let c = container.toObject({
            virtuals: true,
            transform: (doc, ret) => {
              ret.location = {};
              ret.location.area = {id: areaID, name: area};
              ret.location.sub_area = {id: subAreaID, name: sub_area};
              ret.content = content;
              return ret;
            }
          });

          containers.push(c);
        }

        result = compound.toObject({
          virtuals: true,
          transform: (doc, ret) => {
            ret.containers = containers;
            ret.molblock = molblock;
            return ret;
          }
        });
        return result;
      }
    },
    compoundHints: async (root, args, context, info) => {

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
        let value = await Compound.distinct(field, { [field]: { $not: /^$/ } });
        nestedAssign(hints, field, value);
      }
      return hints;
    },
  },
  Mutation: {
    exactCompound: async (root, args) => {
      const { molblock, cas } = args;

      let smiles = rdkit.molBlockToSmiles(molblock);
      let isValidCas = true;
      if(cas)
        isValidCas = isCas(cas);

      // Check input validation
      if (cas && !isValidCas) {
        const errors = { errors: { cas: 'Cas No. is invalid' } };
        throw new UserInputError('Compound registration failed', errors);
      }

      // Check if compound has been previously registered
      let registeredCompound;
      if (cas) {
        registeredCompound = await Compound.findOne({ cas });
        if (registeredCompound && smiles && registeredCompound.smiles != smiles) {
          const errors = { errors: { cas: 'Structure in database for this CAS No. does not match structure drawn' } };
          throw new UserInputError('Compound registration failed', errors);
        }
      }
      if (!registeredCompound && smiles)
        registeredCompound = await Compound.findOne({ smiles });
      if (registeredCompound)
        return {id: registeredCompound.id, smiles, cas };
      return { id: null, smiles, cas };
    },
    smilesToMolBlock: async (root, args) => {
      const { smiles } = args;
      return rdkit.smilesToMolBlock(smiles);
    },
    addCompound: async (root, args) => {
      const input = args.input;
      const { container, molblock, ...compound } = input;

      compound.smiles = rdkit.molBlockToSmiles(molblock);

      // Check if compound has been previously registered
      let registeredCompound;
      if (compound.cas) {
        registeredCompound = await Compound.findOne({ cas: compound.cas });
        if (registeredCompound && compound.smiles && registeredCompound.smiles != compound.smiles) {
          const errors = { errors: { cas: 'Structure in database for this CAS No. does not match structure drawn' } };
          throw new UserInputError('Compound registration failed', errors);
        }
      }
      if (!registeredCompound && compound.smiles)
        registeredCompound = await Compound.findOne({ smiles: compound.smiles });

      const { errors: compoundErrors, isValid: isValidCompound } = validateAddCompoundInput(compound);
      const { errors: containerErrors, isValid: isValidContainer } = validateAddContainerInput(container);
      const errors = { errors: containerErrors };
      if (!registeredCompound)
        errors.errors = { ...compoundErrors, ...containerErrors };

      // Check input validation
      if (!((isValidCompound || registeredCompound) && isValidContainer)) {
        throw new UserInputError('Compound registration failed', errors);
      }

      if (container.category == 'Reagent') {
        let barcode = await Counter.getNextSequenceValue('Reagent');
        container.barcode = barcode;
      } else {
        let barcodeExists;
        try {
          barcodeExists = await Container.findOne({ barcode: container.barcode });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(barcodeExists) {
          errors.errors.barcode = 'Barcode already exists';
          throw new UserInputError('Compound registration failed', errors);
        }
      }

      let compound_id;
      let batch_id;

      if (!registeredCompound) {
        compound_id = await Counter.getNextSequenceValue('Compound');
        compound.compound_id = compound_id;
        let newCompound = new Compound(compound);
        await newCompound.save();

        container.content = newCompound.id;
        batch_id = await Compound.getNextBatchId(compound_id);
        container.batch_id = batch_id;
        let newContainer = new Container(container);
        newCompound.containers.push(newContainer.id);
        await newCompound.save();
        await newContainer.save();
        return newCompound.id;
      } else {
        compound_id = registeredCompound.compound_id;
        container.content = registeredCompound.id;
        if (container.category == 'Sample' && container.eln_id) {
          let registeredBatch = await Container.findOne({ content: container.content, eln_id: container.eln_id });
          if (registeredBatch) {
            batch_id = registeredBatch.batch_id;
          } else {
            batch_id = await Compound.getNextBatchId(compound_id);
          }
        } else {
          //Add batch id logic for reagents here. Right now it just auto increments the batch for each container.
          batch_id = await Compound.getNextBatchId(compound_id);
        }
        container.batch_id = batch_id;
        let newContainer = new Container(container);
        registeredCompound.containers.push(newContainer.id);
        await registeredCompound.save();
        await newContainer.save();
        return registeredCompound.id;
      }
    },
    updateCompound: async (root, args) => {
      const { input } = args;
      const { id, ...update } = input;

      let compound;

      try {
        compound = await Compound.findById(mongoose.Types.ObjectId(id));
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if (compound) {
        update.smiles = compound.smiles;
      } else {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      // Check if cas no. is registered to another structure
      let registeredCompound;
      if (update.cas) {
        registeredCompound = await Compound.findOne({ cas: update.cas });
        if (registeredCompound && update.smiles && registeredCompound.smiles != update.smiles) {
          const errors = { errors: { cas: 'Structure in database for this CAS No. does not match structure drawn' } };
          throw new UserInputError('Compound registration failed', errors);
        }
      }

      const { errors: inputErrors, isValid } = validateAddCompoundInput(update);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Compound update failed', errors);
      }

      try {
        await Compound.findByIdAndUpdate(mongoose.Types.ObjectId(id), update);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
      return id;
    },
    curateStructure: async (root, args) => {
      const { input } = args;

      const { batch_id, molblock, author, reason, force } = input;

      let smiles = rdkit.molBlockToSmiles(molblock);
      input.smiles = smiles;

      const { errors: inputErrors, isValid } = validateCuration(input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Structure curation failed', errors);
      }

      // Check if compound has been previously registered
      let registeredCompound = await Compound.findOne({ smiles });

      let containers = await Container.find({ batch_id });
      let containerIDs = containers.map(container => mongoose.Types.ObjectId(container.id));
      let compound = await Compound.findOne({ containers: { $in: containerIDs } });
      let deleteOriginal = compound.containers.length == containers.length;
      let new_batch_id;

      if (registeredCompound) {
        if (registeredCompound.id == compound.id) {
          errors.errors.molblock = 'No changes were made in the structure.';
          throw new UserInputError('Structure curation failed', errors);
        } else {
          if (!force) {
            errors.errors.dialog = 'The structure entered is already registered.';
            throw new UserInputError('Structure curation failed', errors);
          }
          //Updated structure is already registered.
          //Move containers associated to the batch ids from the original compound to the registered compound.
          new_batch_id = await Compound.getNextBatchId(registeredCompound.compound_id);
          await Container.update({ batch_id }, { content: registeredCompound.id, batch_id: new_batch_id }, { multi: true });
          await Compound.findByIdAndUpdate(registeredCompound.id,
            { $push : { containers: { $each : containerIDs } } } );
          await Compound.findByIdAndUpdate(compound.id,
            { $pull : { containers: { $in : containerIDs } } } );
          if (deleteOriginal) {
            //Delete original compound
            let sds;
            let sds_document;
            if (compound.safety !== undefined) {
              sds = await SafetyDataSheet.findById(compound.safety);
              sds_document = await Document.findById(sds.document, 'name');
              const file_name = `${sds.document}-${sds_document.name}`;
              await Document.findByIdAndDelete(sds.document);
              await fse.unlink(path.join(storage, 'SDS', file_name));
              await SafetyDataSheet.findByIdAndDelete(compound.safety);
            }
            await Compound.findByIdAndDelete(compound.id);
          }
        }
      } else {
        //Updated structure is not registered.
        let compound_id = await Counter.getNextSequenceValue('Compound');
        const { name, description, attributes, safety, flags, storage, cas, registration_event } = compound;

        let newCompound = new Compound({
          smiles,
          compound_id,
          name,
          description,
          attributes,
          flags,
          storage,
          cas,
          registration_event
        });
        await newCompound.save();

        new_batch_id = await Compound.getNextBatchId(compound_id);
        await Container.update({ batch_id }, { content: newCompound.id, batch_id: new_batch_id }, { multi: true });
        await Compound.findByIdAndUpdate(newCompound.id,
          { $push : { containers: { $each : containerIDs } } } );
        await Compound.findByIdAndUpdate(compound.id,
          { $pull : { containers: { $in : containerIDs } } } );
        if (deleteOriginal) {
          await Compound.findByIdAndDelete(compound.id);
          if (safety) {
            await Compound.findByIdAndUpdate(newCompound.id, { safety });
            await SafetyDataSheet.findByIdAndUpdate(safety, { compound: newCompound.id });
          }
        }
      }

      let curationEvent = new Curation({
        previous_batch_id: batch_id,
        previous_smiles: compound.smiles,
        new_batch_id,
        new_smiles: smiles,
        author,
        reason
      });

      await curationEvent.save();
      return null;
    },
    deleteCompound: async (root, args) => {
      let compound;
      let sds;
      let sds_document;
      try {
        compound = await Compound.findById(args.id);
        if (compound.safety !== undefined) {
          sds = await SafetyDataSheet.findById(compound.safety);
          sds_document = await Document.findById(sds.document, 'name');
          const file_name = `${sds.document}-${sds_document.name}`;
          await Document.findByIdAndDelete(sds.document);
          await fse.unlink(path.join(storage, 'SDS', file_name));
          await SafetyDataSheet.findByIdAndDelete(compound.safety);
        }
        await Container.deleteMany({ '_id': { $in : compound.containers } });
        await Compound.findByIdAndDelete(args.id);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    deleteCompoundContainers: async (root, args) => {
      const container_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      let compound = await Compound.findById(args.compoundID);
      if (compound.containers.length == args.ids.length) {
        let sds;
        let sds_document;
        try {
          if (compound.safety !== undefined) {
            sds = await SafetyDataSheet.findById(compound.safety);
            sds_document = await Document.findById(sds.document, 'name');
            const file_name = `${sds.document}-${sds_document.name}`;
            await Document.findByIdAndDelete(sds.document);
            await fse.unlink(path.join(storage, 'SDS', file_name));
            await SafetyDataSheet.findByIdAndDelete(compound.safety);
          }
          await Compound.findByIdAndDelete(args.compoundID);
          await Container.deleteMany({ '_id': { $in : container_IDs } });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
        }
        return true;
      }
      try {
        await Compound.findByIdAndUpdate(args.compoundID,
          { $pull : { containers: { $in : container_IDs } } } );
        await Container.deleteMany({ '_id': { $in : container_IDs } });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    exportCompoundData: async (root, args) => {
      const { errors: inputErrors, isValid } = validateFilename(args.input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Data export failed', errors);
      }

      const { filter, search, searchCategories, search2, name, withSDS } = args.input;

      let pipeline = [
        {
          $unwind: '$containers'
        },
        {
          $lookup: {
            from: 'containers',
            localField: 'containers',
            foreignField: '_id',
            as: 'containerArray'
          }
        },
        {
          $addFields: {
            'container': {
              $let: {
                vars: { container: { $arrayElemAt: ['$containerArray', 0] }},
                in: '$$container'
              }
            }
          }
        },
        {
          $addFields: {
            'container.content': '$$ROOT',
            'container.u_mass' : {
              $cond: {
                if: { $eq: ['$container.state', 'S'] },
                then: {
                  $cond: {
                    if: { $eq: [ '$container.mass_units', 'mg' ] },
                    then: { $multiply: [ '$container.mass', 1000] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$container.mass_units', 'g' ] },
                        then: { $multiply: [ '$container.mass', 1000000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$container.mass_units', 'kg' ] },
                            then: { $multiply: [ '$container.mass', 1000000000] },
                            else: '$container.mass'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'container.u_volume' : {
              $cond: {
                if: { $or: [ { $eq: ['$container.state', 'L'] }, { $eq: ['$container.state', 'G'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$container.vol_units', 'nL' ] },
                    then: { $multiply: [ '$container.volume', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$container.vol_units', 'mL' ] },
                        then: { $multiply: [ '$container.volume', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$container.vol_units', 'L' ] },
                            then: { $multiply: [ '$container.volume', 1000000] },
                            else: '$container.volume'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'container.u_concentration' : {
              $cond: {
                if: { $or: [ { $eq: ['$container.state', 'Soln'] }, { $eq: ['$container.state', 'Susp'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$container.conc_units', 'nM' ] },
                    then: { $multiply: [ '$container.concentration', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$container.conc_units', 'mM' ] },
                        then: { $multiply: [ '$container.concentration', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$container.conc_units', 'M' ] },
                            then: { $multiply: [ '$container.concentration', 1000000] },
                            else: '$container.concentration'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            }
          }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'container.location.area',
            foreignField: '_id',
            as: 'locArray'
          }
        },
        {
          $addFields: {
            'compound': '$$ROOT',
            'container.content.id': '$container.content._id',
            'container.id': '$container._id',
            'container.location.area.id': '$container.location.area',
            'container.location.sub_area.id': '$container.location.sub_area',
            'container.location.area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc.area.name'
              }
            },
            'container.location.sub_area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: {
                  $let: {
                    vars: { sub: { $arrayElemAt: [{
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area._id', '$container.location.sub_area']}
                      }}, 0]}},
                    in: '$$sub.name'
                  }}
              }
            },
          }
        },
        {
          $project: {
            'compound.containers': 0,
            'compound.containerArray': 0,
            'compound.locArray': 0,
            'container._id': 0,
            'container.location.area._id': 0,
            'container.location.sub_area._id': 0,
            'container.u_mass': 0,
            'container.u_volume': 0,
            'container.u_concentration': 0,
            'container.content._id': 0,
            'container.content.container': 0,
            'container.content.containerArray': 0,
            'container.content.containers': 0,
            'container.content.transfers': 0,
            'container.content.curations': 0,
            'container.content.batchCount': 0
          }
        },
        {
          $group : { _id : '$_id', compound: { $mergeObjects: '$compound' }, containers: { $push: '$container' } }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$compound', '$$ROOT' ] } }
        },
        {
          $addFields: {
            'id': '$_id',
          }
        },
        {
          $project: { '_id': 0, 'compound': 0, 'container': 0 }
        },
      ];

      let compounds = [];
      if(filter && Object.keys(filter).length) {

        const { container, ...compoundFilters } = filter;
        let other = compoundFilters;
        let containerLocation;
        let containerOwner;
        let containerAmounts = {};
        let amountFilterConditions;

        if (container) {
          const { location, owner, mass, mass_units, volume, vol_units, concentration, conc_units, ...containerFilters } = container;
          if(mass !== undefined) {
            if(mass.max !== undefined) containerAmounts['container.u_mass.max'] = mass.max * (unit_multipliers[mass_units.max[0]]);
            if(mass.min !== undefined) containerAmounts['container.u_mass.min'] = mass.min * (unit_multipliers[mass_units.min[0]]);
          }
          if(volume !== undefined) {
            if(volume.max !== undefined) containerAmounts['container.u_volume.max'] = volume.max * (unit_multipliers[vol_units.max[0]]);
            if(volume.min !== undefined) containerAmounts['container.u_volume.min'] = volume.min * (unit_multipliers[vol_units.min[0]]);
          }
          if(concentration !== undefined) {
            if(concentration.max !== undefined) containerAmounts['container.u_concentration.max'] = concentration.max * (unit_multipliers[conc_units.max[0]]);
            if(concentration.min !== undefined) containerAmounts['container.u_concentration.min'] = concentration.min * (unit_multipliers[conc_units.min[0]]);
          }

          other = { ...compoundFilters };
          if(Object.keys(containerFilters).length)
            other.container = containerFilters;
          containerLocation = location;
          containerOwner = owner;
        }

        let flatFilter;
        let filterConditions = {'$and': []};
        if (Object.keys(other).length) {
          flatFilter = JSON.flatten(other, '.');
          filterConditions = {
            $and: getFilterConditions(flatFilter)
          };
        }

        if(Object.keys(containerAmounts).length) {
          amountFilterConditions = {
            $and: getFilterConditions(containerAmounts)
          };
        }

        let pipelineAmtIndex = 4;

        if (containerLocation)
          filterConditions['$and'].unshift({ 'container.location.sub_area': { $in: containerLocation.map(locID => mongoose.Types.ObjectId(locID)) } });
        if (containerOwner)
          filterConditions['$and'].unshift({ 'container.owner':{ $in: containerOwner.map(ownerID => mongoose.Types.ObjectId(ownerID)) } });
        if (filterConditions['$and'].length) {
          // pipeline.unshift({ $match:  filterConditions });
          pipeline.splice(pipelineAmtIndex, 0, { $match:  filterConditions });
          pipelineAmtIndex++;
        }

        if (amountFilterConditions)
          pipeline.splice(pipelineAmtIndex, 0, { $match:  amountFilterConditions });
      }

      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['amount_units'];
        const includedFields = [
          'containers.location.area.name',
          'containers.location.sub_area.name',
          'containers.category',
          'containers.barcode',
          'containers.batch_id',
          'containers.vendor',
          'containers.catalog_id',
          'containers.institution',
          'containers.researcher',
          'containers.eln_id',
          'containers.state',
          'containers.solvent',
          'containers.description',
          'containers.registration_event.user'
        ];

        if(words) {
          let paths = Object.keys(Compound.schema.paths).filter(path =>
            ( Compound.schema.paths[path].instance == 'String' ||
            (
              Compound.schema.paths[path].instance == 'Array' &&
              Compound.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Compound.schema.childSchemas;

          Object.keys(childSchemas).forEach(childSchema => {
            let parent = childSchemas[childSchema].model.path;
            let p = Object.keys(childSchemas[childSchema].model.schema.paths)
              .filter( path =>
                excludedFields.indexOf(path) == -1 &&
                childSchemas[childSchema].model.schema.paths[path].instance == 'String' ||
              (
                childSchemas[childSchema].model.schema.paths[path].instance == 'Array' &&
                childSchemas[childSchema].model.schema.paths[path].caster.instance == 'String'
              ))
              .map( path => `${parent}.${path}`);

            paths = paths.concat(p);
          });

          paths = paths.concat(includedFields);
          let searchConditions = {
            $and: words.map( word => ({ '$or': paths.map( path => ({ [path]: { $regex: new RegExp(word, 'i') } })) }))
          };
          pipeline.push({ $match: searchConditions });
        } else {
          return compounds;
        }
      }

      if(withSDS !== undefined)
        pipeline.unshift({ $match: withSDS ?
          ({ '$and': [{ safety: { $exists: true } }, { safety: { $type : 'objectId' } }] }) :
          ({ '$or': [{ safety: { $exists: false } }, { safety: null }]}) });
      compounds = await Compound.aggregate(pipeline);

      let columns = [];
      let records = [];

      if (compounds.length) {
        for (const compound of compounds) {
          let record = JSON.flatten(compound, '.');
          record.id = compound.id.toString();
          record.attributes = compound.attributes.join(',');
          record.flags = compound.flags.join(',');
          record['registration_event.date'] = formatDate(compound.registration_event.date);
          records.push(record);
        }
      }

      columns = [
        { key: 'compound_id', header: 'Compound ID'},
        { key: 'name', header: 'Name'},
        { key: 'attributes', header: 'Attributes'},
        { key: 'flags', header: 'Flags'},
        { key: 'storage', header: 'Storage'},
        { key: 'smiles', header: 'SMILES'},
        { key: 'cas', header: 'CAS No.'},
        { key: 'description', header: 'Description'},
        { key: 'registration_event.user', header: 'Registered By'},
        { key: 'registration_event.date', header: 'Registration Date'},
        { key: 'id', header: 'ID'},
      ];

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
  }
};


export default resolvers;
