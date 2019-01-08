import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import { storageDir, cacheDir } from '../../config';
import path from 'path';
import fse from 'fs-extra';
import stringify from 'csv-stringify';
import rdkit from 'node-rdkit';

import Counter from '../../models/Counter';
import Compound from '../../models/Compound';
import Container from '../../models/Container';
import Location from '../../models/Location';

import validateAddContainerInput from '../../validation/container';
import validateCompoundFilter from '../../validation/compound_filter';
import validateFilename from '../../validation/filename';

const cache = path.normalize(cacheDir);
const storage = path.normalize(storageDir);

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
    containers: async (root, args) => {
      const { filter, search } = args;

      let pipeline = [
        {
          $addFields: {
            'container': { container: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'compounds',
            localField: 'content',
            foreignField: '_id',
            as: 'compoundArray'
          }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$container', { $arrayElemAt: ['$compoundArray', 0] } ] } }
        },
        {
          $addFields: {
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
        //Insert compound filter matches here.
        {
          $addFields: {
            'content': { content: '$$ROOT' }
          }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$container',  '$content'] } }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'location.area',
            foreignField: '_id',
            as: 'locArray'
          },
        },
        {
          $addFields: {
            'id': '$_id',
            'content.id': '$content._id',
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
              }
            },
          }
        },
        {
          $project: {
            '_id': 0,
            'location.area._id': 0,
            'location.sub_area._id': 0,
            'locArray': 0,
            'u_mass': 0,
            'u_volume': 0,
            'u_concentration': 0,
            'content._id': 0,
            'content.container': 0,
            'content.containers': 0,
            'content.transfers': 0,
            'content.curations': 0,
            'content.batchCount': 0
          }
        },
      ];

      let containers = [];
      if(filter && Object.keys(filter).length) {
        const { errors: inputErrors, isValid } = validateCompoundFilter(filter, 'containers');
        const errors = { errors: inputErrors };
        // Check validation
        if (!isValid) {
          throw new UserInputError('Container filtering failed', errors);
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
          pipeline.splice(pipelineAmtIndex, 0, { $match:  filterConditions });
          pipelineAmtIndex++;
        }

        if (amountFilterConditions)
          pipeline.splice(pipelineAmtIndex, 0, { $match:  amountFilterConditions });
      }

      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['mass_units','vol_units','conc_units'];
        const includedFields = [
          'location.area.name',
          'location.sub_area.name',
          'content.smiles',
          'content.compound_id',
          'content.compound_id_aliases',
          'content.name',
          'content.description',
          'content.attributes',
          'content.flags',
          'content.storage',
          'content.cas',
          'content.registration_event.user'
        ];

        if(words) {
          let paths = Object.keys(Container.schema.paths).filter(path =>
            ( Container.schema.paths[path].instance == 'String' ||
            (
              Container.schema.paths[path].instance == 'Array' &&
              Container.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Container.schema.childSchemas;

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
          return containers;
        }
      }

      containers = await Container.aggregate(pipeline);

      for (const container of containers) {
        container.content.molblock = rdkit.smilesToMolBlock(container.content.smiles);
      }

      return containers;

    },
    container: async (root, args) => {
      let container = await Container.findById(args.id);
      if(!container) {
        throw new ApolloError('Can\'t find container', 'BAD_REQUEST');
      } else {
        let compound = await Compound.findById(container.content);
        const {
          id,
          smiles,
          compound_id,
          compound_id_aliases,
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
          compound_id_aliases,
          name,
          description,
          attributes,
          flags,
          storage,
          cas,
          registration_event
        };

        let result;

        const { area: areaID, sub_area: subAreaID } = container.location;
        let location = await Location.findById(areaID);
        const area = location.area.name;
        const sub_area = location.area.sub_areas.id(subAreaID).name;

        result = container.toObject({
          virtuals: true,
          transform: (doc, ret) => {
            ret.location = {};
            ret.location.area = {id: areaID, name: area};
            ret.location.sub_area = {id: subAreaID, name: sub_area};
            ret.content = content;
            return ret;
          }
        });

        return result;
      }
    },
    containerHints: async (root, args, context, info) => {

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
        let value = await Container.distinct(field, { [field]: { $not: /^$/ } });
        nestedAssign(hints, field, value);
      }
      return hints;
    },
  },
  Mutation: {
    addContainer: async (root, args) => {
      const { input: container } = args;

      const { errors: inputErrors, isValid } = validateAddContainerInput(container);
      const errors = { errors: inputErrors };

      // Check input validation
      if (!isValid) {
        throw new UserInputError('Container registration failed', errors);
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
          throw new UserInputError('Container registration failed', errors);
        }
      }

      let compound;
      try {
        compound = await Compound.findById(container.content);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!compound) {
        errors.errors.compound = 'This compound has been deleted.';
        throw new UserInputError('Container registration failed', errors);
      }

      let compound_id = compound.compound_id;
      let batch_id;

      if (container.category == 'Sample' && container.eln_id) {
        let registeredBatch = await Container.findOne({ content: container.content, eln_id: container.eln_id });
        if (registeredBatch) {
          batch_id = registeredBatch.batch_id;
        } else {
          batch_id = await Compound.getNextBatchId(compound_id);
        }
      } else {
        //Add batch id logic for reagents here. Right now it just auto increments the batch for each
        batch_id = await Compound.getNextBatchId(compound_id);
      }
      container.batch_id = batch_id;
      let newContainer = new Container(container);
      compound.containers.push(newContainer.id);
      await compound.save();
      await newContainer.save();
      return true;
    },
    updateContainer: async (root, args) => {
      const { input } = args;
      const { id, ...update } = input;

      const { errors: inputErrors, isValid } = validateAddContainerInput(update);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Container update failed', errors);
      }

      try {
        await Container.findByIdAndUpdate(mongoose.Types.ObjectId(id), update);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
      return id;
    },
    deleteContainer: async (root, args) => {
      const container_ID = mongoose.Types.ObjectId(args.id);
      let container = await Container.findById(args.id);
      let compound = await Compound.findById(container.content);
      if (compound.containers.length == 1) {
        let compound_document;
        try {
          if (compound.safety !== undefined) {
            compound_document = await Document.findById(compound.safety, 'name');
            const file_name = `${compound_document._id.toString()}-${compound_document.name}`;
            await Document.deleteOne({ '_id': compound_document._id });
            await fse.unlink(path.join(storage, file_name));
          }
          await Compound.findByIdAndDelete(container.content);
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
        }
      } else {
        try {
          await Compound.findByIdAndUpdate(container.content,
            { $pull : { containers: container_ID } } );
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
        }
      }
      try {
        await Container.findByIdAndDelete(args.id);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    exportContainerData: async (root, args) => {
      const { errors: inputErrors, isValid } = validateFilename(args.input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Data export failed', errors);
      }

      const { filter, search, searchCategories, search2, name } = args.input;

      let pipeline = [
        {
          $addFields: {
            'container': { container: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'compounds',
            localField: 'content',
            foreignField: '_id',
            as: 'compoundArray'
          }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$container', { $arrayElemAt: ['$compoundArray', 0] } ] } }
        },
        {
          $addFields: {
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
        //Insert compound filter matches here.
        {
          $addFields: {
            'content': { content: '$$ROOT' }
          }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$container',  '$content'] } }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'location.area',
            foreignField: '_id',
            as: 'locArray'
          },
        },
        {
          $addFields: {
            'id': '$_id',
            'content.id': '$content._id',
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
              }
            },
          }
        },
        {
          $project: {
            '_id': 0,
            'location.area._id': 0,
            'location.sub_area._id': 0,
            'locArray': 0,
            'u_mass': 0,
            'u_volume': 0,
            'u_concentration': 0,
            'content._id': 0,
            'content.container': 0,
            'content.containers': 0,
            'content.transfers': 0,
            'content.curations': 0,
            'content.batchCount': 0
          }
        },
      ];

      let containers = [];
      if(filter && Object.keys(filter).length) {
        const { errors: inputErrors, isValid } = validateCompoundFilter(filter);
        const errors = { errors: inputErrors };
        // Check validation
        if (!isValid) {
          throw new UserInputError('Container filtering failed', errors);
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
        const excludedFields = ['mass_units','vol_units','conc_units'];
        const includedFields = [
          'location.area.name',
          'location.sub_area.name',
          'content.smiles',
          'content.compound_id',
          'content.compound_id_aliases',
          'content.name',
          'content.description',
          'content.attributes',
          'content.flags',
          'content.storage',
          'content.cas',
          'content.registration_event.user'
        ];

        if(words) {
          let paths = Object.keys(Container.schema.paths).filter(path =>
            ( Container.schema.paths[path].instance == 'String' ||
            (
              Container.schema.paths[path].instance == 'Array' &&
              Container.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Container.schema.childSchemas;

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
          return containers;
        }
      }

      containers = await Container.aggregate(pipeline);

      let columns = [];
      let records = [];

      if (containers.length) {
        for (const container of containers) {
          let record = JSON.flatten(container, '.');
          record.id = container.id.toString();
          record.location = (container.location.area.name == 'UNASSIGNED') ?
            'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`;
          record.source = container.vendor ? container.vendor : container.institution,
          record.source_id = container.vendor ? container.catalog_id : (
            container.category == 'Sample' ?  `${container.researcher} / ${container.eln_id}` :
              container.researcher
          );
          record.amount = container.state == 'S' ? `${container.mass} ${container.mass_units}` : (
            container.state == 'L' ? `${container.volume} ${container.vol_units}` :
              `${container.volume} ${container.vol_units} / ${container.concentration} ${container.conc_units}`
          );
          record['registration_event.date'] = formatDate(container.registration_event.date);
          records.push(record);
        }
      }

      columns = [
        { key: 'barcode', header: 'Barcode'},
        { key: 'batch_id', header: 'Batch ID'},
        { key: 'location', header: 'Location'},
        { key: 'category', header: 'Category'},

        { key: 'content.name', header: 'Compound Name'},
        { key: 'content.cas', header: 'CAS No.'},

        { key: 'source', header: 'Source'},
        { key: 'catalog_id', header: 'Catalog ID'},
        { key: 'researcher', header: 'Researcher'},
        { key: 'eln_id', header: 'ELN ID'},
        { key: 'state', header: 'State'},
        { key: 'mass', header: 'Mass'},
        { key: 'mass_units', header: 'Mass Units'},
        { key: 'volume', header: 'Volume'},
        { key: 'vol_units', header: 'Volume Units'},
        { key: 'concentration', header: 'Concentration'},
        { key: 'conc_units', header: 'Conc. Units'},
        { key: 'solvent', header: 'Solvent'},

        { key: 'description', header: 'Description'},
        { key: 'content.smiles', header: 'SMILES'},
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
