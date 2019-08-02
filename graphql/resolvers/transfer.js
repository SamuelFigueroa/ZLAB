import { ApolloError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';
import rdkit from 'node-rdkit';

import Transfer from '../../models/Transfer';
import Container from '../../models/Container';
import Compound from '../../models/Compound';

import validateTransferInput from '../../validation/transfer';

const unit_multipliers = {
  n: 0.001,
  u: 1,
  m: 1000,
  k: 1000000000,
  g: 1000000,
  M: 1000000,
  L: 1000000
};

const normalizeMass = microGrams => {
  if(microGrams >= 1000000000)
    return { mass: microGrams/1000000000, mass_units: 'kg' };
  if(microGrams >= 1000000)
    return { mass: microGrams/1000000, mass_units: 'g' };
  if(microGrams >= 1000)
    return { mass: microGrams/1000, mass_units: 'mg' };
  return { mass: microGrams, mass_units: 'ug' };
};

const normalizeVolume = microLiters => {
  if(microLiters >= 1000000)
    return { volume: microLiters/1000000, vol_units: 'L' };
  if(microLiters >= 1000)
    return { volume: microLiters/1000, vol_units: 'mL' };
  if(microLiters >= 1)
    return { volume: microLiters, vol_units: 'uL' };
  return { volume: microLiters * 1000, vol_units: 'nL' };
};

const normalizeConcentration = microMolar => {
  if(microMolar >= 1000000)
    return { concentration: microMolar/1000000, conc_units: 'M' };
  if(microMolar >= 1000)
    return { concentration: microMolar/1000, conc_units: 'mM' };
  if(microMolar >= 1)
    return { concentration: microMolar, conc_units: 'uM' };
  return { concentration: microMolar * 1000, conc_units: 'nM' };
};

const resolvers = {
  Query: {
    transfers: async (root, args) => {
      const { container } = args;
      const id = mongoose.Types.ObjectId(container);

      let pipeline = [
        {
          $match: { $or: [ { source: id }, { destination: id } ] }
        },
        {
          $sort: { timestamp: 1 }
        }
      ];
      let transfers = await Transfer.aggregate(pipeline);
      return transfers;
    },
    transfer: async (root, args) => {
      const { id } = args;
      let transfer;
      try {
        transfer = await Transfer.findById(id);
      } catch (err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      if(!transfer) {
        throw new ApolloError('Can\'t find transfer', 'BAD_REQUEST');
      }
      return transfer;
    }
  },
  Mutation: {
    transferMass: async (root, args) => {
      const { input } = args;

      input.kind = 'mass';
      const { errors: inputErrors, isValid } = validateTransferInput(input);
      const errors = { errors: inputErrors };
      if (!isValid) {
        throw new UserInputError('Transfer failed', errors);
      }

      let source = await Container.findOne({ barcode: input.source });
      if (!source) {
        errors.errors.source = 'Container is not registered';
        throw new UserInputError('Transfer failed', errors);
      }
      if (source.state != 'S') {
        errors.errors.source = 'Container\'s contents are not a solid.';
        throw new UserInputError('Transfer failed', errors);
      }

      const { src_init_mg, src_fin_mg, dst_init_mg, dst_fin_mg } = input;

      let transferAmt = dst_fin_mg - dst_init_mg;
      let deductedAmt = src_init_mg - src_fin_mg;

      if (transferAmt > deductedAmt * 1.05) {
        errors.errors.dst_fin_mg = 'Invalid transfer amount';
        errors.errors.src_fin_mg = 'Invalid transfer amount';
        throw new UserInputError('Transfer failed', errors);
      }

      if (deductedAmt * 1000 > source.mass * unit_multipliers[source.mass_units[0]] * 1.05) {
        errors.errors.dst_fin_mg = 'Invalid transfer amount';
        errors.errors.src_fin_mg = 'Invalid transfer amount';
        throw new UserInputError('Transfer failed', errors);
      }

      let destination = await Container.findOne({ barcode: input.destination });
      //Check if destination container is already registered.
      if (destination) {
        if (destination.state != 'S') {
          errors.errors.destination = 'Container\'s contents are not a solid';
          throw new UserInputError('Transfer failed', errors);
        }
        if (source.content.toString() != destination.content.toString()) {
          errors.errors.destination = 'Container is registered with other contents';
          throw new UserInputError('Transfer failed', errors);
        }

        let dst_mass_update = normalizeMass(transferAmt * 1000 + destination.mass * unit_multipliers[destination.mass_units[0]]);

        await Container.findByIdAndUpdate(destination.id, { mass: dst_mass_update.mass, mass_units: dst_mass_update.mass_units });
      } else {
        let compound;
        try {
          compound = await Compound.findById(source.content);
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(!compound) {
          errors.errors.source = 'Compound in container has been deleted';
          throw new UserInputError('Transfer failed', errors);
        }
        let dst_mass_update = normalizeMass(transferAmt * 1000);

        let dst_container = source.toObject({
          virtuals: false,
          transform: (doc, ret) => {
            delete ret._id;
            ret.registration_event = { user: doc.registration_event.user };
            ret.barcode = input.destination;
            ret.mass = dst_mass_update.mass;
            ret.mass_units = dst_mass_update.mass_units;
            ret.description = '';
            return ret;
          }
        });

        destination = new Container(dst_container);
        compound.containers.push(destination.id);
        await compound.save();
        await destination.save();
      }

      if (deductedAmt * 1000 > source.mass * unit_multipliers[source.mass_units[0]]) {
        await Container.findByIdAndUpdate(source.id, { mass: 0 });
      } else {
        let src_mass_update = normalizeMass(source.mass * unit_multipliers[source.mass_units[0]] - deductedAmt * 1000);
        await Container.findByIdAndUpdate(source.id, { mass: src_mass_update.mass, mass_units: src_mass_update.mass_units });
      }

      let amount = normalizeMass(transferAmt * 1000);
      let transfer = new Transfer({
        source: source.id,
        destination: destination.id,
        kind: 'mass',
        amount: amount.mass,
        amount_units: amount.mass_units,
        solvent: ''
      });
      await transfer.save();

      return true;
    },
    transferVolume: async (root, args) => {
      const { input } = args;

      input.kind = 'volume';
      const { errors: inputErrors, isValid } = validateTransferInput(input);
      const errors = { errors: inputErrors };
      if (!isValid) {
        throw new UserInputError('Transfer failed', errors);
      }

      let source = await Container.findOne({ barcode: input.source });
      if (!source) {
        errors.errors.source = 'Container is not registered';
        throw new UserInputError('Transfer failed', errors);
      }
      if (source.state == 'S') {
        errors.errors.source = 'Container\'s contents are solid.';
        throw new UserInputError('Transfer failed', errors);
      }

      const { volume, vol_units } = input;
      let u_volume = volume * unit_multipliers[vol_units[0]];

      if (u_volume > source.volume * unit_multipliers[source.vol_units[0]]) {
        errors.errors.volume = 'Not enough volume in container';
        throw new UserInputError('Transfer failed', errors);
      }

      let destination = await Container.findOne({ barcode: input.destination });

      //Check if destination container is already registered.
      if (destination) {
        if (destination.state != source.state) {
          errors.errors.destination = 'Container\'s contents are not in the same physical state.';
          throw new UserInputError('Transfer failed', errors);
        }

        if ((source.state == 'Soln' || source.state == 'Susp') && (source.solvent != destination.solvent)) {
          errors.errors.destination = 'Containers have different solvents';
          throw new UserInputError('Transfer failed', errors);
        }

        if (source.content.toString() != destination.content.toString()) {
          errors.errors.destination = 'Container is registered with other contents';
          throw new UserInputError('Transfer failed', errors);
        }

        let dst_volume_update = normalizeVolume(u_volume + destination.volume * unit_multipliers[destination.vol_units[0]]);

        if (source.state == 'L') {
          await Container.findByIdAndUpdate(destination.id, { volume: dst_volume_update.volume, vol_units: dst_volume_update.vol_units });
        } else {
          // let dst_concentration_update = normalizeConcentration((
          //   source.concentration * unit_multipliers[source.conc_units[0]] * u_volume
          //   + destination.concentration * unit_multipliers[destination.conc_units[0]] * destination.volume * unit_multipliers[destination.vol_units[0]]
          // ) / (u_volume + destination.volume * unit_multipliers[destination.vol_units[0]]));

          let dst_concentration_update = normalizeConcentration((
            source.concentration * (unit_multipliers[source.conc_units[0]]/1000) * volume * (unit_multipliers[vol_units[0]]/1000)
            + destination.concentration * (unit_multipliers[destination.conc_units[0]]/1000) * destination.volume * (unit_multipliers[destination.vol_units[0]]/1000)
          ) / (volume * (unit_multipliers[vol_units[0]]/1000000) + destination.volume * (unit_multipliers[destination.vol_units[0]]/1000000)));
          await Container.findByIdAndUpdate(destination.id,
            {
              volume: dst_volume_update.volume, vol_units: dst_volume_update.vol_units,
              concentration: dst_concentration_update.concentration, conc_units: dst_concentration_update.conc_units
            });
        }
      } else {
        let compound;
        try {
          compound = await Compound.findById(source.content);
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(!compound) {
          errors.errors.source = 'Compound in container has been deleted';
          throw new UserInputError('Transfer failed', errors);
        }
        let dst_volume_update = normalizeVolume(u_volume);

        let dst_container = source.toObject({
          virtuals: false,
          transform: (doc, ret) => {
            delete ret._id;
            ret.registration_event = { user: doc.registration_event.user };
            ret.barcode = input.destination;
            ret.volume = dst_volume_update.volume;
            ret.vol_units = dst_volume_update.vol_units;
            ret.description = '';
            return ret;
          }
        });

        destination = new Container(dst_container);
        compound.containers.push(destination.id);
        await compound.save();
        await destination.save();
      }

      let src_volume_update = normalizeVolume(source.volume * unit_multipliers[source.vol_units[0]] - u_volume);

      await Container.findByIdAndUpdate(source.id, { volume: src_volume_update.volume, vol_units: src_volume_update.vol_units});
      let amount = normalizeVolume(u_volume);
      let transfer = new Transfer({
        source: source.id,
        destination: destination.id,
        kind: 'volume',
        amount: amount.volume,
        amount_units: amount.vol_units,
        solvent: ''
      });
      await transfer.save();

      return true;
    },
    dry: async (root, args) => {
      const { input } = args;

      input.kind = 'drying';
      const { errors: inputErrors, isValid } = validateTransferInput(input);
      const errors = { errors: inputErrors };
      if (!isValid) {
        throw new UserInputError('Transfer failed', errors);
      }

      const { container: barcode } = input;

      let container = await Container.findOne({ barcode });
      if (!container) {
        errors.errors.container = 'Container is not registered';
        throw new UserInputError('Transfer failed', errors);
      }

      if (container.state != 'Soln' && container.state != 'Susp') {
        errors.errors.container = 'Container does not contain any solvent';
        throw new UserInputError('Transfer failed', errors);
      }

      let compound;
      try {
        compound = await Compound.findById(container.content);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
      }

      if(!compound) {
        errors.errors.container = 'Compound in container has been deleted';
        throw new UserInputError('Transfer failed', errors);
      }

      if(!compound.smiles) {
        errors.errors.container = 'Compound structure is required to calculate mass';
        throw new UserInputError('Transfer failed', errors);
      }

      const molWt = rdkit.molWtFromSmiles(compound.smiles);
      let microMoles = container.volume * (unit_multipliers[container.vol_units[0]]/1000) * container.concentration * (unit_multipliers[container.conc_units[0]]/1000);
      let mass_update = normalizeMass(microMoles * molWt);

      await Container.findByIdAndUpdate(
        container.id,
        {
          volume: null,
          vol_units: null,
          concentration: null,
          conc_units: null,
          solvent: '',
          mass: mass_update.mass,
          mass_units: mass_update.mass_units,
          state: 'S'
        }
      );

      let transfer = new Transfer({
        source: container.id,
        destination: null,
        kind: 'drying',
        amount: null,
        amount_units: null,
        solvent: ''
      });

      await transfer.save();

      return true;
    },
    resuspend: async (root, args) => {
      const { input } = args;

      input.kind = 'resuspension';
      const { errors: inputErrors, isValid } = validateTransferInput(input);
      const errors = { errors: inputErrors };
      if (!isValid) {
        throw new UserInputError('Transfer failed', errors);
      }

      const { container: barcode, concentration, conc_units, solvent } = input;

      let container = await Container.findOne({ barcode });
      if (!container) {
        errors.errors.container = 'Container is not registered';
        throw new UserInputError('Transfer failed', errors);
      }

      if (container.state != 'S' && container.state != 'Soln' && container.state != 'Susp') {
        errors.errors.container = 'Contents cannot be resuspended.';
        throw new UserInputError('Transfer failed', errors);
      }

      let concentration_update = normalizeConcentration(concentration * unit_multipliers[conc_units[0]]);
      let volume_update;
      let volume_added;

      if (container.state == 'S') {
        let compound;
        try {
          compound = await Compound.findById(container.content);
        } catch(err) {
          throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
        }

        if(!compound) {
          errors.errors.container = 'Compound in container has been deleted';
          throw new UserInputError('Transfer failed', errors);
        }

        if(!compound.smiles) {
          errors.errors.container = 'Compound structure is required to calculate volume';
          throw new UserInputError('Transfer failed', errors);
        }

        const molWt = rdkit.molWtFromSmiles(compound.smiles);
        let microMoles = container.mass * unit_multipliers[container.mass_units[0]]/molWt;
        volume_update = normalizeVolume(microMoles / (concentration * unit_multipliers[conc_units[0]]/1000000));
        volume_added = volume_update;

      } else {
        if (!(concentration * unit_multipliers[conc_units[0]] < container.concentration * unit_multipliers[container.conc_units[0]])) {
          errors.errors.concentration = 'Value must be less than container\'s current concentration';
          throw new UserInputError('Transfer failed', errors);
        }

        if (solvent != container.solvent) {
          errors.errors.solvent = 'Container currently has a different solvent';
          throw new UserInputError('Transfer failed', errors);
        }

        volume_update = normalizeVolume(
          (container.concentration * unit_multipliers[container.conc_units[0]] * container.volume * unit_multipliers[container.vol_units[0]]) /
          (concentration * unit_multipliers[conc_units[0]])
        );

        volume_added = normalizeVolume((volume_update.volume * unit_multipliers[volume_update.vol_units[0]]) - (container.volume * unit_multipliers[container.vol_units[0]]));
      }

      await Container.findByIdAndUpdate(
        container.id,
        {
          volume: volume_update.volume,
          vol_units: volume_update.vol_units,
          concentration: concentration_update.concentration,
          conc_units: concentration_update.conc_units,
          solvent,
          mass: null,
          mass_units: null,
          state: container.state == 'S' ? 'Soln' : container.state
        }
      );

      let transfer = new Transfer({
        source: null,
        destination: container.id,
        kind: 'resuspension',
        amount: volume_added.volume,
        amount_units: volume_added.vol_units,
        solvent
      });

      await transfer.save();

      return true;
    },
  }
};

export default resolvers;
