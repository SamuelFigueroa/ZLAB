import { ApolloError, UserInputError } from 'apollo-server-express';

import Counter from '../../models/Counter';
import validateCounterInput from '../../validation/counter';

const resolvers = {
  Query: {
    counters: async () => {
      let counters = await Counter.find();
      return counters;
    }
  },
  Mutation: {
    addCounter: async (root, args) => {
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
          numDigits: input.numDigits
        });

        await newCounter.save();
        return null;
      }
    },
    updateCounter: async (root, args) => {
      const { name, numDigits } = args;
      try {
        await Counter.update({ name }, { numDigits });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    deleteCounter: async (root, args) => {
      try {
        await Counter.findByIdAndDelete(args.id);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    }
  }
};

export default resolvers;
