import { ApolloError, UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import { secretOrKey } from '../../config';
import jwt from 'jsonwebtoken';

import User from '../../models/User';

import validateRegisterInput from '../../validation/register';
import validateLoginInput from '../../validation/login';

const resolvers = {
  Query: {
    users: async () => {
      let users = await User.find();
      return users;
    },
  },
  Mutation: {
    addUser: async (root, args) => {
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
    login: async (root, args) => {
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
  }
};

export default resolvers;
