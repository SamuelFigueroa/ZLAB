import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

import validateLocationInput from '../../validation/location';
import addLocation from '../../mongo/location/addLocation';

import Location from '../../models/Location';
import Asset from '../../models/Asset';
import Container from '../../models/Container';

const resolvers = {
  Query: {
    locations: async () => {
      let locations = await Location.aggregate([
        {
          $unwind: '$area.sub_areas'
        },
        {
          $lookup: {
            from: 'containers',
            localField: 'area.sub_areas._id',
            foreignField: 'location.sub_area',
            as: 'containerArray'
          }
        },
        {
          $addFields: {
            'id': '$_id',
            'area.sub_areas.id': '$area.sub_areas._id',
            'area.sub_areas.containerCount': {
              $let: {
                vars: { containerCount: { $size: '$containerArray' }},
                in: '$$containerCount'
              }
            }
          }
        },
        {
          $project: {
            'containerArray': 0,
            'area.sub_areas._id': 0
          }
        },
        {
          $group : { _id : '$_id', area: { $first: '$area' }, 'sub_areas': { $push: '$area.sub_areas' } }
        },
        {
          $project: {
            'id': '$_id',
            'area.name': '$area.name',
            'area.sub_areas': '$sub_areas',
          }
        },
      ]);
      return locations;
    },
  },
  Mutation: {
    addLocation: async (root, args) => {
      const input = args.input;
      await addLocation(input);
      return null;
    },
    updateLocation: async(root, args) => {
      const unassigned = await Location.findOne({ 'area.name': 'UNASSIGNED'});
      const unassigned_area = unassigned.id;

      const { input } = args;
      const { locationID, subAreaID, area, sub_area } = input;
      const { errors: inputErrors, isValid } = validateLocationInput({ area, sub_area });
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Location update failed', errors);
      }

      if(locationID == unassigned_area) {
        errors.errors.area = 'UNASSIGNED area cannot be updated.';
        errors.errors.sub_area = 'UNASSIGNED sub-area cannot be updated.';
        throw new UserInputError('Location update failed', errors);
      }

      let location;

      try {
        location = await Location.findById(locationID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!location) {
        errors.errors.area = 'Couldn\'t find location to update';
        throw new ApolloError('Location update failed', 'BAD_REQUEST', errors);
      }

      if(location.area.name !== area) {
        let areaExists;
        try {
          areaExists = await Location.findOne({ 'area.name': area });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
        if(areaExists) {
          errors.errors.area = 'Area already exists';
          throw new ApolloError('Location update failed', 'BAD_REQUEST', errors);
        }
      }

      let location_subdoc = location.area.sub_areas.find(sub_doc => sub_doc.id == subAreaID);
      if(!location_subdoc) {
        errors.errors.sub_area = 'Couldn\'t find sub-area';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(location_subdoc.name !== sub_area) {
        let subAreaExists = location.area.sub_areas.find(sub_doc => sub_doc.name == sub_area);
        if(subAreaExists) {
          errors.errors.sub_area = 'Sub-area already exists';
          throw new ApolloError('Location update failed', 'BAD_REQUEST', errors);
        }
      }

      await Location.findByIdAndUpdate(locationID, { 'area.name': area });
      await Location.updateOne({ _id: locationID, 'area.sub_areas._id': subAreaID },
        { $set: { 'area.sub_areas.$.name': sub_area } });

      return true;

    },
    deleteLocation: async (root, args) => {
      const unassigned = await Location.findOne({ 'area.name': 'UNASSIGNED'});
      const unassigned_area = unassigned.id;
      const unassigned_sub_area = unassigned.area.sub_areas[0].id;
      const { input } = args;

      const location_IDs = Array.from(new Set(input.filter(loc=>loc.locationID !== unassigned_area).map(loc=>loc.locationID)));
      const locations = {};
      location_IDs.forEach(id=>{
        locations[id]=input.filter(loc=>loc.locationID == id).map(loc=>mongoose.Types.ObjectId(loc.subAreaID));
      });
      for (const id of location_IDs) {
        let location = await Location.findById(id);
        let remove = location.area.sub_areas.length === locations[id].length;
        try {
          await Asset.updateMany(
            {'location.area': mongoose.Types.ObjectId(id), 'location.sub_area': { $in : locations[id] }},
            {'location.area': unassigned_area, 'location.sub_area': unassigned_sub_area}
          );
          await Container.updateMany(
            {'location.area': mongoose.Types.ObjectId(id), 'location.sub_area': { $in : locations[id] }},
            {'location.area': unassigned_area, 'location.sub_area': unassigned_sub_area}
          );
          if(remove) {
            await Location.findByIdAndDelete(id);
          } else {
            await Location.findByIdAndUpdate(id,
              { $pull : { 'area.sub_areas': { '_id': { $in : locations[id] } } } } );
          }
        } catch(err) {
          throw new ApolloError('Location removal failed', 'BAD_REQUEST');
        }
      }
      return true;
    },
  }
};

export default resolvers;
