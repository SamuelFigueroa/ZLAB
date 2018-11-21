import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import { storageDir, cacheDir } from '../../config';
import path from 'path';
import fse from 'fs-extra';
import stringify from 'csv-stringify';
import rdkit from 'node-rdkit';
import Reagent from '../../models/Reagent';
import Counter from '../../models/Counter';
import Document from '../../models/Document';
import Location from '../../models/Location';

import validateReagentFilter from '../../validation/reagent_filter';
import validateAddReagentInput from '../../validation/reagent';
import validateAddReagentContainerInput from '../../validation/reagent_container';
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
    reagents: async (root, args) => {
      const { filter, search } = args;

      let pipeline = [
        {
          $unwind: '$containers'
        },
        {
          $addFields: {
            'containers.u_mass' : {
              $cond: {
                if: { $eq: ['$containers.state', 'S'] },
                then: {
                  $cond: {
                    if: { $eq: [ '$containers.mass_units', 'mg' ] },
                    then: { $multiply: [ '$containers.mass', 1000] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$containers.mass_units', 'g' ] },
                        then: { $multiply: [ '$containers.mass', 1000000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$containers.mass_units', 'kg' ] },
                            then: { $multiply: [ '$containers.mass', 1000000000] },
                            else: '$containers.mass'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'containers.u_volume' : {
              $cond: {
                if: { $or: [ { $eq: ['$containers.state', 'L'] }, { $eq: ['$containers.state', 'G'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$containers.vol_units', 'nL' ] },
                    then: { $multiply: [ '$containers.volume', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$containers.vol_units', 'mL' ] },
                        then: { $multiply: [ '$containers.volume', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$containers.vol_units', 'L' ] },
                            then: { $multiply: [ '$containers.volume', 1000000] },
                            else: '$containers.volume'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'containers.u_concentration' : {
              $cond: {
                if: { $or: [ { $eq: ['$containers.state', 'Soln'] }, { $eq: ['$containers.state', 'Susp'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$containers.conc_units', 'nM' ] },
                    then: { $multiply: [ '$containers.concentration', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$containers.conc_units', 'mM' ] },
                        then: { $multiply: [ '$containers.concentration', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$containers.conc_units', 'M' ] },
                            then: { $multiply: [ '$containers.concentration', 1000000] },
                            else: '$containers.concentration'
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
            localField: 'containers.location.area',
            foreignField: '_id',
            as: 'locArray'
          }
        },
        {
          $addFields: {
            'reagent': '$$ROOT',
            'containers.id': '$containers._id',
            'containers.location.area.id': '$containers.location.area',
            'containers.location.sub_area.id': '$containers.location.sub_area',
            'containers.location.area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc.area.name'
              }
            },
            'containers.location.sub_area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: {
                  $let: {
                    vars: { sub: { $arrayElemAt: [{
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area._id', '$containers.location.sub_area']}
                      }}, 0]}},
                    in: '$$sub.name'
                  }}
              }
            },
          }
        },
        {
          $project: {
            'reagent.containers': 0,
            'reagent.locArray': 0,
            'containers._id': 0,
            'containers.location.area._id': 0,
            'containers.location.sub_area._id': 0,
            'containers.u_mass': 0,
            'containers.u_volume': 0,
            'containers.u_concentration': 0
          }
        },
        {
          $group : { _id : '$containers.content', reagent: { $mergeObjects: '$reagent' }, containers: { $push: '$containers' } }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$reagent', '$$ROOT' ] } }
        },
        {
          $addFields: {
            'id': '$_id',
          }
        },
        {
          $project: { '_id': 0, 'reagent': 0 }
        },
      ];

      let reagents = [];
      if(filter && Object.keys(filter).length) {
        const { errors: inputErrors, isValid } = validateReagentFilter(filter);
        const errors = { errors: inputErrors };
        // Check validation
        if (!isValid) {
          throw new UserInputError('Reagent filtering failed', errors);
        }

        const { containers, ...reagentFilters } = filter;
        let other = reagentFilters;
        let containerLocation;
        let containerOwner;
        let containerAmounts = {};
        let amountFilterConditions;

        if (containers) {
          const { location, owner, mass, mass_units, volume, vol_units, concentration, conc_units, ...containerFilters } = containers;
          if(mass !== undefined) {
            if(mass.max !== undefined) containerAmounts['containers.u_mass.max'] = mass.max * (unit_multipliers[mass_units.max[0]]);
            if(mass.min !== undefined) containerAmounts['containers.u_mass.min'] = mass.min * (unit_multipliers[mass_units.min[0]]);
          }
          if(volume !== undefined) {
            if(volume.max !== undefined) containerAmounts['containers.u_volume.max'] = volume.max * (unit_multipliers[vol_units.max[0]]);
            if(volume.min !== undefined) containerAmounts['containers.u_volume.min'] = volume.min * (unit_multipliers[vol_units.min[0]]);
          }
          if(concentration !== undefined) {
            if(concentration.max !== undefined) containerAmounts['containers.u_concentration.max'] = concentration.max * (unit_multipliers[conc_units.max[0]]);
            if(concentration.min !== undefined) containerAmounts['containers.u_concentration.min'] = concentration.min * (unit_multipliers[conc_units.min[0]]);
          }

          other = { ...reagentFilters };
          if(Object.keys(containerFilters).length)
            other.containers = containerFilters;
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

        let pipelineAmtIndex = 2;

        if (containerLocation)
          filterConditions['$and'].unshift({ 'containers.location.sub_area': { $in: containerLocation.map(locID => mongoose.Types.ObjectId(locID)) } });
        if (containerOwner)
          filterConditions['$and'].unshift({ 'containers.owner':{ $in: containerOwner.map(ownerID => mongoose.Types.ObjectId(ownerID)) } });
        if (filterConditions['$and'].length) {
          pipeline.unshift({ $match:  filterConditions });
          pipelineAmtIndex++;
        }

        if (amountFilterConditions)
          pipeline.splice(pipelineAmtIndex, 0, { $match:  amountFilterConditions });
      }

      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['mass_units', 'vol_units', 'conc_units'];

        if(words) {
          let paths = Object.keys(Reagent.schema.paths).filter(path =>
            ( Reagent.schema.paths[path].instance == 'String' ||
            (
              Reagent.schema.paths[path].instance == 'Array' &&
              Reagent.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Reagent.schema.childSchemas;

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

          paths.push('containers.location.area.name','containers.location.sub_area.name');
          let searchConditions = {
            $and: words.map( word => ({ '$or': paths.map( path => ({ [path]: { $regex: new RegExp(word, 'i') } })) }))
          };
          pipeline.push({ $match: searchConditions });
        } else {
          return reagents;
        }
      }
      reagents = await Reagent.aggregate(pipeline);

      let molReagents = [];
      for (const reagent of reagents) {
        let molReagent = {
          molblock: rdkit.smilesToMolBlock(reagent.smiles),
          ...reagent
        };
        molReagents.push(molReagent);
      }
      return molReagents;
    },
    reagent: async (root, args) => {
      let reagent = await Reagent.findById(args.id);
      if(!reagent) {
        throw new ApolloError('Can\'t find reagent', 'BAD_REQUEST');
      } else {
        let safety;
        let document = await Document.findById(reagent.safety);
        if (document) {
          safety = {
            id: reagent.safety,
            name: document.name,
            size: document.size,
            category: document.category,
            uploaded_by: document.upload_event.user,
            upload_date: document.upload_event.date
          };
        }
        let containers = [];

        let result;

        for (const container of reagent.containers) {
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
              return ret;
            }
          });

          containers.push(c);
        }

        result = reagent.toObject({
          virtuals: true,
          transform: (doc, ret) => {
            ret.safety = safety;
            ret.containers = containers;
            ret.molblock = rdkit.smilesToMolBlock(reagent.smiles);
            return ret;
          }
        });
        return result;
      }
    },
    reagentHints: async (root, args, context, info) => {

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
        let value = await Reagent.distinct(field, { [field]: { $not: /^$/ } });
        nestedAssign(hints, field, value);
      }
      return hints;
    },
  },
  Mutation: {
    addReagent: async (root, args) => {
      const input = args.input;
      const { container, molblock, ...reagent } = input;

      reagent.smiles = rdkit.molBlockToSmiles(molblock);

      const { errors: reagentErrors, isValid } = validateAddReagentInput(reagent);
      const { errors: containerErrors, isValid: isValidContainer } = validateAddReagentContainerInput(container);
      const errors = { errors: { ...reagentErrors, ...containerErrors } };

      // Check validation
      if (!(isValid && isValidContainer)) {
        throw new UserInputError('Reagent registration failed', errors);
      }

      let compound_id = await Counter.getNextSequenceValue('Compound');
      let barcode = await Counter.getNextSequenceValue('Reagent');

      reagent.compound_id = compound_id;
      container.barcode = barcode;

      let newReagent = new Reagent(reagent);
      container.content = newReagent.id;
      newReagent.containers.push(container);

      await newReagent.save();
      return newReagent.id;
    },
    updateReagent: async (root, args) => {
      const input = args.input;
      const { id, molblock, ...update } = input;

      update.smiles = rdkit.molBlockToSmiles(molblock);

      const { errors: inputErrors, isValid } = validateAddReagentInput(update);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Reagent registration failed', errors);
      }

      try {
        await Reagent.findByIdAndUpdate(mongoose.Types.ObjectId(id), update);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
      return id;
    },
    deleteReagent: async (root, args) => {
      let reagent;
      let reagent_document;
      try {
        reagent = await Reagent.findById(args.id);
        if (reagent.safety !== undefined) {
          reagent_document = await Document.findById(reagent.safety, 'name');
          const file_name = `${reagent_document._id.toString()}-${reagent_document.name}`;
          await Document.deleteOne({ '_id': reagent_document._id });
          await fse.unlink(path.join(storage, file_name));
        }
        await Reagent.findByIdAndDelete(args.id);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    addReagentContainer: async (root, args) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddReagentContainerInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Container registration failed', errors);
      }

      let reagent;
      const { reagentID, ...container } = input;

      try {
        reagent = await Reagent.findById(reagentID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!reagent) {
        errors.errors.reagent = 'This reagent has been removed';
        throw new ApolloError('Container registration failed', 'BAD_REQUEST', errors);
      } else {
        let barcode = await Counter.getNextSequenceValue('Reagent');
        container.barcode = barcode;
        container.content = reagentID;
        reagent.containers.push(container);
        await reagent.save();
        const result = true;
        return result;
      }
    },
    updateReagentContainer: async (root, args) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddReagentContainerInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Container registration failed', errors);
      }

      let reagent;
      const { reagentID, containerID, ...container } = input;

      try {
        reagent = await Reagent.findById(reagentID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!reagent) {
        errors.errors.reagent = 'This reagent has been removed';
        throw new ApolloError('Container registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          const update = {};
          Object.keys(container).forEach( field => Object.assign(update, { [`containers.$.${field}`] : container[field]  }));
          await Reagent.updateOne({ _id: reagentID, 'containers._id': containerID },
            { $set: update });
          const result = true;
          return result;
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
      }
    },
    deleteReagentContainer: async (root, args) => {
      const container_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      let reagent = await Reagent.findById(args.reagentID);
      if (reagent.containers.length == args.ids.length) {
        let reagent_document;
        try {
          if (reagent.safety !== undefined) {
            reagent_document = await Document.findById(reagent.safety, 'name');
            const file_name = `${reagent_document._id.toString()}-${reagent_document.name}`;
            await Document.deleteOne({ '_id': reagent_document._id });
            await fse.unlink(path.join(storage, file_name));
          }
          await Reagent.findByIdAndDelete(args.reagentID);
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
        }
        return true;
      }
      try {
        await Reagent.findByIdAndUpdate(args.reagentID,
          { $pull : { 'containers' : { '_id': { $in : container_IDs } } } } );
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    exportReagentData: async (root, args) => {
      const { errors: inputErrors, isValid } = validateFilename(args.input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Data export failed', errors);
      }

      const { filter, search, searchCategories, search2, name } = args.input;

      let pipeline = [
        {
          $unwind: '$containers'
        },
        {
          $addFields: {
            'containers.u_mass' : {
              $cond: {
                if: { $eq: ['$containers.state', 'S'] },
                then: {
                  $cond: {
                    if: { $eq: [ '$containers.mass_units', 'mg' ] },
                    then: { $multiply: [ '$containers.mass', 1000] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$containers.mass_units', 'g' ] },
                        then: { $multiply: [ '$containers.mass', 1000000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$containers.mass_units', 'kg' ] },
                            then: { $multiply: [ '$containers.mass', 1000000000] },
                            else: '$containers.mass'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'containers.u_volume' : {
              $cond: {
                if: { $or: [ { $eq: ['$containers.state', 'L'] }, { $eq: ['$containers.state', 'G'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$containers.vol_units', 'nL' ] },
                    then: { $multiply: [ '$containers.volume', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$containers.vol_units', 'mL' ] },
                        then: { $multiply: [ '$containers.volume', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$containers.vol_units', 'L' ] },
                            then: { $multiply: [ '$containers.volume', 1000000] },
                            else: '$containers.volume'
                          }
                        }
                      }
                    }
                  }
                },
                else: undefined
              }
            },
            'containers.u_concentration' : {
              $cond: {
                if: { $or: [ { $eq: ['$containers.state', 'Soln'] }, { $eq: ['$containers.state', 'Susp'] } ]},
                then: {
                  $cond: {
                    if: { $eq: [ '$containers.conc_units', 'nM' ] },
                    then: { $multiply: [ '$containers.concentration', 0.001] },
                    else: {
                      $cond: {
                        if: { $eq: [ '$containers.conc_units', 'mM' ] },
                        then: { $multiply: [ '$containers.concentration', 1000] },
                        else: {
                          $cond: {
                            if: { $eq: [ '$containers.conc_units', 'M' ] },
                            then: { $multiply: [ '$containers.concentration', 1000000] },
                            else: '$containers.concentration'
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
            localField: 'containers.location.area',
            foreignField: '_id',
            as: 'locArray'
          }
        },
        {
          $addFields: {
            'reagent': '$$ROOT',
            'containers.id': '$containers._id',
            'containers.location.area.id': '$containers.location.area',
            'containers.location.sub_area.id': '$containers.location.sub_area',
            'containers.location.area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc.area.name'
              }
            },
            'containers.location.sub_area.name': {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: {
                  $let: {
                    vars: { sub: { $arrayElemAt: [{
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area._id', '$containers.location.sub_area']}
                      }}, 0]}},
                    in: '$$sub.name'
                  }}
              }
            },
          }
        },
        {
          $project: {
            'reagent.containers': 0,
            'reagent.locArray': 0,
            'containers._id': 0,
            'containers.location.area._id': 0,
            'containers.location.sub_area._id': 0,
            'containers.u_mass': 0,
            'containers.u_volume': 0,
            'containers.u_concentration': 0
          }
        },
        {
          $group : { _id : '$containers.content', reagent: { $mergeObjects: '$reagent' }, containers: { $push: '$containers' } }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ '$reagent', '$$ROOT' ] } }
        },
        {
          $addFields: {
            'id': '$_id',
          }
        },
        {
          $project: { '_id': 0, 'reagent': 0 }
        },
      ];

      let reagents = [];

      if(filter && Object.keys(filter).length) {
        const { containers, ...reagentFilters } = filter;
        let other = reagentFilters;
        let containerLocation;
        let containerOwner;
        let containerAmounts = {};
        let amountFilterConditions;

        if (containers) {
          const { location, owner, mass, mass_units, volume, vol_units, concentration, conc_units, ...containerFilters } = containers;
          if(mass !== undefined) {
            if(mass.max !== undefined) containerAmounts['containers.u_mass.max'] = mass.max * (unit_multipliers[mass_units.max[0]]);
            if(mass.min !== undefined) containerAmounts['containers.u_mass.min'] = mass.min * (unit_multipliers[mass_units.min[0]]);
          }
          if(volume !== undefined) {
            if(volume.max !== undefined) containerAmounts['containers.u_volume.max'] = volume.max * (unit_multipliers[vol_units.max[0]]);
            if(volume.min !== undefined) containerAmounts['containers.u_volume.min'] = volume.min * (unit_multipliers[vol_units.min[0]]);
          }
          if(concentration !== undefined) {
            if(concentration.max !== undefined) containerAmounts['containers.u_concentration.max'] = concentration.max * (unit_multipliers[conc_units.max[0]]);
            if(concentration.min !== undefined) containerAmounts['containers.u_concentration.min'] = concentration.min * (unit_multipliers[conc_units.min[0]]);
          }

          other = { ...reagentFilters };
          if(Object.keys(containerFilters).length)
            other.containers = containerFilters;
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

        let pipelineAmtIndex = 2;

        if (containerLocation)
          filterConditions['$and'].unshift({ 'containers.location.sub_area': { $in: containerLocation.map(locID => mongoose.Types.ObjectId(locID)) } });
        if (containerOwner)
          filterConditions['$and'].unshift({ 'containers.owner':{ $in: containerOwner.map(ownerID => mongoose.Types.ObjectId(ownerID)) } });
        if (filterConditions['$and'].length) {
          pipeline.unshift({ $match:  filterConditions });
          pipelineAmtIndex++;
        }

        if (amountFilterConditions)
          pipeline.splice(pipelineAmtIndex, 0, { $match:  amountFilterConditions });
      }
      if(search) {
        const wordRe = /\w?[\w-]+/gi;
        const words = search.match(wordRe);
        const excludedFields = ['mass_units', 'vol_units', 'conc_units'];

        if(words) {
          let paths = Object.keys(Reagent.schema.paths).filter(path =>
            ( Reagent.schema.paths[path].instance == 'String' ||
            (
              Reagent.schema.paths[path].instance == 'Array' &&
              Reagent.schema.paths[path].caster.instance == 'String'
            ))
            && excludedFields.indexOf(path) == -1
          );

          let childSchemas = Reagent.schema.childSchemas;

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

          paths.push('containers.location.area.name','containers.location.sub_area.name');
          let searchConditions = {
            $and: words.map( word => ({ '$or': paths.map( path => ({ [path]: { $regex: new RegExp(word, 'i') } })) }))
          };
          pipeline.push({ $match: searchConditions });
        } else {
          return reagents;
        }
      }

      reagents = await Reagent.aggregate(pipeline);

      let columns = [];
      let records = [];

      if (reagents.length) {
        for (const reagent of reagents) {
          let record = JSON.flatten(reagent, '.');
          record.id = reagent.id.toString();
          record.attributes = reagent.attributes.join(',');
          record.flags = reagent.flags.join(',');
          record['registration_event.date'] = formatDate(reagent.registration_event.date);
          records.push(record);
        }
      }

      columns = [
        { key: 'smiles', header: 'Structure'},
        { key: 'compound_id', header: 'Compound ID'},
        { key: 'name', header: 'Name'},
        { key: 'attributes', header: 'Attributes'},
        { key: 'flags', header: 'Flags'},
        { key: 'storage', header: 'Storage'},
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
