import { ApolloError, UserInputError } from 'apollo-server-express';

import Compound from '../../models/Compound';
import Container from '../../models/Container';
import Counter from '../../models/Counter';

import validateAddCompoundInput from '../../validation/compound';
import validateAddContainerInput from '../../validation/container';

const addCompound = async input => {
  const { container, ...compound } = input;
  // Check if compound has been previously registered
  let registeredCompound;
  if (compound.cas) {
    registeredCompound = await Compound.findOne({ cas: compound.cas });
    if (registeredCompound && compound.smiles && registeredCompound.smiles != compound.smiles) {
      const errors = { errors: { cas: 'Structure in database for this CAS No. does not match structure drawn' } };
      throw new UserInputError('Compound registration failed', errors);
    }
  }
  if (!registeredCompound && compound.smiles)
    registeredCompound = await Compound.findOne({ smiles: compound.smiles });

  const { errors: compoundErrors, isValid: isValidCompound } = validateAddCompoundInput(compound);
  const { errors: containerErrors, isValid: isValidContainer } = validateAddContainerInput(container);
  const errors = { errors: containerErrors };
  if (!registeredCompound)
    errors.errors = { ...compoundErrors, ...containerErrors };
  else {
    if(compound.cas && registeredCompound.cas && (compound.cas !== registeredCompound.cas)) {
      errors.errors.cas = 'CAS number in database for this compound does not match the number entered';
      throw new UserInputError('Compound registration failed', errors);
    }
    if(compound.name && registeredCompound.name && (compound.name !== registeredCompound.name)) {
      errors.errors.name = 'Name in database for this compound does not match the name entered';
      throw new UserInputError('Compound registration failed', errors);
    }
  }

  // Check input validation
  if (!((isValidCompound || registeredCompound) && isValidContainer)) {
    throw new UserInputError('Compound registration failed', errors);
  }

  if (container.category == 'Reagent') {
    let barcode = await Counter.getNextSequenceValue('Reagent');
    container.barcode = barcode;
  } else {
    let barcodeExists;
    try {
      barcodeExists = await Container.findOne({ barcode: container.barcode });
    } catch(err) {
      throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION', errors);
    }

    if(barcodeExists) {
      errors.errors.barcode = 'Barcode already exists';
      throw new UserInputError('Compound registration failed', errors);
    }
  }

  let compound_id;
  let batch_id;

  if (!registeredCompound) {
    compound_id = await Counter.getNextSequenceValue('Compound');
    compound.compound_id = compound_id;
    let newCompound = new Compound(compound);
    await newCompound.save();

    container.content = newCompound.id;
    batch_id = await Compound.getNextBatchId(compound_id);
    container.batch_id = batch_id;
    let newContainer = new Container(container);
    newCompound.containers.push(newContainer.id);
    await newCompound.save();
    await newContainer.save();
    return newCompound.id;
  } else {
    if(compound.cas && !registeredCompound.cas) {
      registeredCompound.cas = compound.cas;
    }
    if(compound.name && !registeredCompound.name) {
      registeredCompound.name = compound.name;
    }
    if(compound.description && !registeredCompound.description) {
      registeredCompound.description = compound.description;
    }
    if(compound.storage && !registeredCompound.storage) {
      registeredCompound.storage = compound.storage;
    }
    if(compound.attributes.length) {
      registeredCompound.attributes = Array.from(new Set(registeredCompound.attributes.concat(compound.attributes)));
    }
    compound_id = registeredCompound.compound_id;
    container.content = registeredCompound.id;
    if (container.category == 'Sample' && container.eln_id) {
      let registeredBatch = await Container.findOne({ content: container.content, eln_id: container.eln_id });
      if (registeredBatch) {
        batch_id = registeredBatch.batch_id;
      } else {
        batch_id = await Compound.getNextBatchId(compound_id);
      }
    } else {
      //Add batch id logic for reagents here. Right now it just auto increments the batch for each container.
      batch_id = await Compound.getNextBatchId(compound_id);
    }
    container.batch_id = batch_id;
    let newContainer = new Container(container);
    registeredCompound.containers.push(newContainer.id);
    await registeredCompound.save();
    await newContainer.save();
    return registeredCompound.id;
  }
};

export default addCompound;
