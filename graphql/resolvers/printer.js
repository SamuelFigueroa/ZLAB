import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import * as signalR from '@aspnet/signalr';
import ZPLFormatter from '../../src/components/Printer/ZPLFormatter';

import PrinterHub from '../../models/PrinterHub';
import Printer from '../../models/Printer';
import PrinterFormat from '../../models/PrinterFormat';

import validatePrinterHubInput from '../../validation/printer_hub';
import validateAddPrinterInput from '../../validation/printer';
import validatePrinterJobInput from '../../validation/printer_job';
import validatePrinterFormatInput from '../../validation/printer_format';
import validateQuickPrintInput from '../../validation/quick_print';

const resolvers = {
  Query: {
    printers: async() => await Printer.find({}),
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
    printerFormats: async() => await PrinterFormat.find({}),
    printerFormat: async(root, args) => {
      let format = await PrinterFormat.findById(args.id);
      if(!format) {
        throw new ApolloError('Can\'t find format', 'BAD_REQUEST');
      } else {
        return format;
      }
    }
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
    },
    quickPrint: async (root, args) => {
      const { input } = args;
      const { errors: inputErrors, isValid } = validateQuickPrintInput(input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Failed to print.', errors);
      }

      const { formatID, data } = input;

      let format = await PrinterFormat.findById(formatID);
      if(!format) {
        errors.errors.format = 'Can\'t find format.';
        throw new ApolloError('Quick print failed', 'BAD_REQUEST', errors);
      }
      const { defaults, fields, name } = format;
      const { format: formatFn, vars } = ZPLFormatter(defaults, fields, false);
      const variableArray = Object.keys(vars);
      if (variableArray.length > 1) {
        errors.errors.format = 'Invalid format';
        throw new ApolloError('Quick print failed', 'BAD_REQUEST', errors);
      }
      if (variableArray.length == 1) {
        vars[variableArray[0]] = data;
      }

      let onlineHubs = await PrinterHub.find({ online: true });
      if (!(onlineHubs && onlineHubs.length)) {
        errors.errors.printer = 'No online printer hubs were found.';
        throw new ApolloError('Quick print failed', 'BAD_REQUEST', errors);
      }

      let connection;
      let printer;
      for (const hub of onlineHubs) {
        let c = new signalR.HubConnectionBuilder().withUrl(hub.address).build();
        if (c !== null) {
          try {
            await c.start();
            await c.on('PrintersFound',
              async connection_names => {
                for (const connection_name of connection_names) {
                  let p = await Printer.findOne({ connection_name });
                  if(p && p.name == input.printer) {
                    printer = p;
                    connection = c;
                    return;
                  }
                }
              });
            await c.invoke('GetPrinters');
          } catch (err) {
            continue;
          }
        }
      }
      if (connection && printer) {
        const { connection_name } = printer;
        const time_added = new Date();
        const job = {
          name,
          data: formatFn(vars),
          time_added: time_added.toLocaleString()
        };

        try {
          await Printer.updateOne({ connection_name }, { $push: { 'jobs' : {...job, status: 'Queued' } } });
        } catch (err) {
          errors.errors.printer = 'Failed to add printer job.';
          await connection.stop();
          throw new ApolloError('Quick print failed', 'BAD_REQUEST', errors);
        }
        await connection.invoke('RefreshQueue', connection_name);
        let updatedPrinter;
        try {
          updatedPrinter = await Printer.findOne({ connection_name });
        } catch(err) {
          errors.errors.printer = 'Printer job added, but queue failed to start.';
          await connection.stop();
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
        }
        if (updatedPrinter && updatedPrinter.queue == false) {
          await Printer.updateOne({ connection_name }, { $set: { 'queue': true, 'jobs.0.status': 'InProgress'} });
          await connection.invoke('StartQueue', connection_name);
          await connection.stop();
        }
      } else {
        errors.errors.printer = 'Failed to connect to the printer.';
        throw new ApolloError('Quick print failed', 'BAD_REQUEST', errors);
      }
    },
    addPrinterFormat: async (root, args) => {
      const { input } = args;
      const { errors: inputErrors, isValid } = validatePrinterFormatInput(input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Failed to create the format.', errors);
      }

      const { name } = input;

      let printerFormat;
      try {
        printerFormat = await PrinterFormat.findOne({ name });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(printerFormat) {
        errors.errors.name = 'Format name already exists.';
        throw new ApolloError('Format registration failed', 'BAD_REQUEST', errors);
      } else {
        const newFormat = new PrinterFormat(input);
        await newFormat.save();
      }
    },
    updatePrinterFormat: async (root, args) => {
      const { input } = args;
      const { errors: inputErrors, isValid } = validatePrinterFormatInput(input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Failed to create the format.', errors);
      }

      const { name } = input;

      let printerFormat;
      try {
        printerFormat = await PrinterFormat.findOne({ name });
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      const { id, ...update } = input;

      if(printerFormat && printerFormat.id != id) {
        errors.errors.name = 'Format name already exists.';
        throw new ApolloError('Format registration failed', 'BAD_REQUEST', errors);
      } else {
        try {
          await PrinterFormat.findByIdAndUpdate(mongoose.Types.ObjectId(id), update);
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }
      }
      return null;
    },
    deletePrinterFormat: async (root, args) => {
      const format_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await PrinterFormat.deleteMany({ '_id': { $in: format_IDs }});
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
  }
};

export default resolvers;
