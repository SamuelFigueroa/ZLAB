import { ApolloError, UserInputError } from 'apollo-server-express';

import Counter from '../../models/Counter';
import validateCounterInput from '../../validation/counter';

const resolvers = {
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
        });

        await newCounter.save();
        return null;
      }
    },
  }
};

export default resolvers;
