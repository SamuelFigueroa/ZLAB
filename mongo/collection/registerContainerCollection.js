import mongoose from 'mongoose';

import StagedContainer from '../../models/StagedContainer';
import Collection from '../../models/Collection';
import Location from '../../models/Location';

import addCompound from '../compound/addCompound';
const CONTAINER_REGISTERED = 'CONTAINER_REGISTERED';
const REGISTRATION_FINISHED = 'REGISTRATION_FINISHED';

const registerContainerCollection = async (collection, pubsub) => {

  const id = collection.id;
  let unregisteredLocations = await StagedContainer.aggregate([
    { $match : { collection_id : mongoose.Types.ObjectId(id) } },
    { $group : { _id : { area: '$location.area', sub_area: '$location.sub_area' } }},
    { $lookup: {
      from: 'locations',
      localField: '_id.area',
      foreignField: 'area.name',
      as: 'locArray'
    }
    },
    { $addFields: {
      'location': {
        $cond: {
          if: { $gt: [ { $size: '$locArray' }, 0 ] },
          then: {
            $let: {
              vars: { loc: { $arrayElemAt: ['$locArray', 0] } },
              in: '$$loc._id'
            },
          },
          else: 0
        }
      },
      'sub_areas': {
        $cond: {
          if: { $gt: [ { $size: '$locArray' }, 0 ] },
          then: {
            $let: {
              vars: { loc: { $arrayElemAt: ['$locArray', 0] } },
              in: { $map: { input: '$$loc.area.sub_areas',
                as: 'subAreas',
                in: '$$subAreas.name' } }
            }
          },
          else: undefined
        }
      }
    }},
    { $facet: {
      'locationsToAdd': [
        { $match: { location: 0 } },
        {
          $group : { _id : '$_id.area', sub_areas: { $push: '$_id.sub_area' } }
        },
        { $project: {
          _id: 0,
          area: {
            name: '$_id',
            sub_areas: {
              $map: {
                input: '$sub_areas',
                as: 'name',
                in: { name: '$$name' }
              }
            }
          }
        }
        }],
      'locationsToUpdate': [
        { $match: { $expr: { $and: [
          { $ne: [ '$location', 0 ] },
          { $not: [ { $in: [ '$_id.sub_area', '$sub_areas' ] } ] }
        ] } } },
        {
          $group : { _id : '$location', sub_areas: { $push: { name: '$_id.sub_area' } } }
        }
      ]
    }},
  ]);
  let locationsToAdd = unregisteredLocations[0].locationsToAdd;
  let locationsToUpdate = unregisteredLocations[0].locationsToUpdate;
  if(locationsToAdd.length)
    await Location.insertMany(locationsToAdd);
  if(locationsToUpdate.length) {
    for (const location of locationsToUpdate)
      await Location.updateOne({ _id: location._id }, { $push: { 'area.sub_areas': { $each: location.sub_areas } } });
  }

  let registered = 0;
  let errored = 0;
  const registerDocument = async doc => {
    const { _id, ...stagedContainer } = doc;
    if(doc.container.owner === null) {
      errored++;
      await StagedContainer.updateOne({ _id }, { registrationError: { key: 'owner', message: 'User not found.' } });
    } else if (doc.container.location.area === null) {
      errored++;
      await StagedContainer.updateOne({ _id }, { registrationError: { key: 'area', message: 'Area not found.' } });
    } else if (doc.container.location.sub_area === null) {
      errored++;
      await StagedContainer.updateOne({ _id }, { registrationError: { key: 'sub_area', message: 'Sub-area not found.' } });
    } else {
      try {
        await addCompound(stagedContainer);
        await StagedContainer.findByIdAndDelete(_id);
        registered++;
      } catch(err) {
        errored++;
        await StagedContainer.updateOne({ _id }, { registrationError: Object.keys(err.errors).map(key=>({ key, message: err.errors[key] }))[0] });
      }
    }
    pubsub.publish(CONTAINER_REGISTERED, { containerRegistered: { registered, errored, collectionID: id } });
    const totalRegistered = registered + errored;
    if(collection.size == totalRegistered) {
      if(errored === 0)
        await Collection.findByIdAndUpdate(id, { $unset: { inProgress: '' }, status: 'Registered' });
      else {
        await Collection.findByIdAndUpdate(id, { $unset: { inProgress: '' }, status: 'Error' });
      }
      pubsub.publish(REGISTRATION_FINISHED, { registrationFinished: id });
    }
  };
  await StagedContainer
    .aggregate([
      { $match : { collection_id : mongoose.Types.ObjectId(id) } },
      { $lookup: {
        from: 'locations',
        localField: 'location.area',
        foreignField: 'area.name',
        as: 'locArray'
      }
      },
      { $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: 'login',
        as: 'ownerArray'
      }
      },
      { $addFields: {
        'registration_event': { user: collection.user },
        'content.registration_event': { user: collection.user },
        'content.attributes': [],
        'content._id': '$_id',
        'owner': {
          $cond: {
            if: { $gt: [ { $size: '$ownerArray' }, 0 ] },
            then: {
              $let: {
                vars: { o: { $arrayElemAt: ['$ownerArray', 0] }},
                in: '$$o._id'
              }
            },
            else: undefined
          }
        },
        'location.area': {
          $cond: {
            if: { $gt: [ { $size: '$locArray' }, 0 ] },
            then: {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] }},
                in: '$$loc._id'
              }
            },
            else: undefined
          }
        },
        'location.sub_area': {
          $cond: {
            if: { $gt: [ { $size: '$locArray' }, 0 ] },
            then: {
              $let: {
                vars: { loc: { $arrayElemAt: ['$locArray', 0] } },
                in: {
                  $let: {
                    vars: { subArray: {
                      $filter: {
                        input: '$$loc.area.sub_areas',
                        as: 'sub_area',
                        cond: { $eq: ['$$sub_area.name', '$location.sub_area'] }
                      }}},
                    in: {
                      $cond: {
                        if: { $gt: [ { $size: '$$subArray' }, 0 ] },
                        then: {
                          $let: {
                            vars: { sub: { $arrayElemAt: ['$$subArray', 0] }},
                            in: '$$sub._id'
                          }
                        },
                        else: undefined
                      }
                    }
                  }}
              }
            },
            else: undefined
          }
        }
      }},
      {
        $project: {
          'collection_id': 0,
          'collection_index': 0,
          '__v': 0,
          'locArray': 0,
          'ownerArray': 0,
          'content.originalSmiles': 0
        }
      },
      {
        $addFields: {
          'container': { container: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [ '$container',  '$content'] } }
      },
      {
        $project: {
          'container.content': 0,
          'container._id': 0
        }
      },
    ])
    .cursor()
    .exec()
    .map(doc => {
      doc.container.owner = doc.container.owner === null ? null : doc.container.owner.toString();
      doc.container.location.area = doc.container.location.area === null ? null : doc.container.location.area.toString();
      doc.container.location.sub_area = doc.container.location.sub_area === null ? null : doc.container.location.sub_area.toString();
      return doc;
    })
    .eachAsync(doc=>registerDocument(doc));

  return null;
};

export default registerContainerCollection;
