import { ApolloError, UserInputError } from 'apollo-server-express';

import PrinterHub from '../../models/PrinterHub';
import Printer from '../../models/Printer';

import validatePrinterHubInput from '../../validation/printer_hub';
import validateAddPrinterInput from '../../validation/printer';
import validatePrinterJobInput from '../../validation/printer_job';

const resolvers = {
  Query: {
    printerHub: async (root, args) => {
      const errors = { errors: {} };
      let hub;

      try {
        hub = await PrinterHub.findOne({ address: args.address });
        if(hub) {
          return hub;
        }
        else {
          errors.errors.Hub = 'Hub not found';
          throw new ApolloError('Hub is not registered', 'BAD_REQUEST', errors);
        }
      } catch(err) {
        if (errors.errors.Hub === undefined)
          errors.errors.HttpRequest = 'Database lookup failed';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
    },
    onlinePrinterHubs: async () => {
      let onlineHubs = await PrinterHub.find({ online: true });
      return onlineHubs;
    },
    printer: async (root, args) => {
      const { connection_name } = args;
      let printer = await Printer.findOne({ connection_name });
      return printer;
    },
    nextPrinterJob: async (root, args) => {
      const { connection_name } = args;
      const errors = { errors: {} };
      let printer;
      try {
        printer = await Printer.findOne({ connection_name, jobs: { $elemMatch: { status: 'InProgress'} } },
          { 'jobs.$': 1 });
        if(printer) {
          return printer.jobs[0];
        }
        else {
          return null;
        }
      } catch(err) {
        errors.errors.HttpRequest = 'Database lookup failed';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }
    },
  },
  Mutation: {
    registerPrinterHub: async (root, args, context) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validatePrinterHubInput(input);
      const errors = { errors: inputErrors };
      const user = context.user === undefined ? null : context.user.login;

      if (user) {
        // Check validation
        if (!isValid) {
          throw new UserInputError('Printer registration failed', errors);
        }

        let hub;

        try {
          hub = await PrinterHub.findOne({ address: input.address });
          if(hub) {
            await PrinterHub.findOneAndUpdate({ address: input.address },
              { name: input.name, online: true, user });
            return ({ response: 'Hub is now online' });
          } else {

            const newHub = new PrinterHub({
              name: input.name,
              address: input.address,
              online: input.online,
              user
            });

            await newHub.save();
            return ({ response: 'Hub has been registered and is now online' });
          }
        } catch(err) {
          errors.errors.database = 'Database lookup failed';
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
      }
      else {
        errors.errors.login = 'User not found';
        throw new ApolloError('Login failed', 'BAD_REQUEST', errors);
      }
    },
    addPrinter: async (root, args) => {
      const input = args.input;
      const { errors: inputErrors, isValid } = validateAddPrinterInput(input);
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Printer registration failed', errors);
      }

      let printer;
      let printer_name;

      try {
        printer = await Printer.findOne({ connection_name: input.connection_name });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(printer) {
        errors.errors.connection_name = 'The printer has already been registered.';
        throw new ApolloError('Printer registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          printer_name = await Printer.findOne({ name: input.name });
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(printer_name) {
          errors.errors.name = 'Name already exists';
          throw new ApolloError('Printer registration failed', 'BAD_REQUEST', errors);
        } else {
          const newPrinter = new Printer({
            name: input.name,
            connection_name: input.connection_name,
            jobs: []
          });

          await newPrinter.save();
          return true;
        }
      }
    },
    addPrinterJob: async (root, args) => {
      const { connection_name, job } = args.input;
      const { errors: inputErrors, isValid } = validatePrinterJobInput(job);

      const errors = { errors: { [connection_name]: inputErrors } };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Failed to create the job.', errors);
      }

      let printer;
      try {
        printer = await Printer.findOne({ connection_name });
      } catch(err) {
        errors.errors[connection_name].add = 'Couldn\'t find printer, check database connection.';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!printer) {
        errors.errors[connection_name].add = 'This printer has been removed from the database.';
        throw new ApolloError('Adding printer job failed', 'BAD_REQUEST', errors);
      } else {
        await Printer.updateOne({ connection_name }, { $push: { 'jobs' : {...job, status: 'Queued' } } });
        return true;
      }
    },
    updatePrinter: async (root, args) => {
      // Update printer checks whether there are jobs in the queue, if true turns queue on,
      // and changes the status of the next job to 'In Progress'
      const { connection_name, queue, reset } = args.input;
      const errors = { errors: { [connection_name]: {} } };
      let printer;

      try {
        printer = await Printer.findOne({ connection_name });
      } catch(err) {
        errors.errors[connection_name].update = 'Couldn\'t find printer, check database connection.';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!printer) {
        errors.errors[connection_name].update = 'This printer has been removed from the database.';
        throw new ApolloError('Update printer job queue failed', 'BAD_REQUEST', errors);
      } else {
        if (printer.jobs.length) {
          if (queue) {
            await Printer.updateOne({ connection_name }, { $set: { 'queue': true, 'jobs.0.status': 'InProgress'} });
            return true;
          } else {
            if (reset) {
              await Printer.updateOne({ connection_name }, { $set: { 'queue': false, 'jobs.0.status': 'Queued'} });
              return true;
            } else {
              await Printer.updateOne({ connection_name }, { $set: { 'queue': false } });
              return true;
            }
          }
        } else {
          errors.errors[connection_name].update = 'There are no jobs in the queue.';
          throw new ApolloError('Update printer job queue failed', 'BAD_REQUEST', errors);
        }
      }
    },
    deletePrinterJob: async (root, args) => {
      // Delete printer job, if dequeue is true, then check if queue is on.
      // If queue is on, check whether there are jobs in the queue.
      // If there are, update the next job to 'In Progress'.
      // If there aren't, turn queue off.

      let printer;
      const { connection_name, jobID, dequeue } = args.input;
      const errors = { errors: { [connection_name]: {} } };

      try {
        printer = await Printer.findOne({ connection_name });
      } catch(err) {
        errors.errors[connection_name].update = 'Couldn\'t find printer, check database connection.';
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!printer) {
        errors.errors[connection_name].update = 'This printer has been removed from the database.';
        throw new ApolloError('Update printer job queue failed', 'BAD_REQUEST', errors);
      } else {
        await printer.jobs.id(jobID).remove();
        await printer.save();
        if (dequeue && printer.queue) {
          if (printer.jobs.length) {
            await Printer.updateOne({ connection_name }, { $set: { 'queue': true, 'jobs.0.status': 'InProgress' } });
            return true;
          } else {
            await Printer.updateOne({ connection_name }, { $set: { 'queue': false } });
            return false;
          }
        }
      }
    }
  }
};

export default resolvers;
