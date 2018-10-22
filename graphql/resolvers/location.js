import { ApolloError, UserInputError } from 'apollo-server-express';

import validateLocationInput from '../../validation/location';

import Location from '../../models/Location';

const resolvers = {
  Query: {
    locations: async () => {
      let locations = await Location.find();
      return locations;
    },
  },
  Mutation: {
    addLocation: async (root, args) => {
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
  }
};

export default resolvers;
