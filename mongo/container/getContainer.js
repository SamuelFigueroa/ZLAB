import { ApolloError } from 'apollo-server-express';
import rdkit from 'node-rdkit';

import Compound from '../../models/Compound';
import Container from '../../models/Container';
import Location from '../../models/Location';

const getContainer = async containerID => {
  let container = await Container.findById(containerID);
  if(!container) {
    throw new ApolloError('Can\'t find container', 'BAD_REQUEST');
  } else {
    let compound = await Compound.findById(container.content);
    const {
      id,
      smiles,
      compound_id,
      compound_id_aliases,
      name,
      description,
      attributes,
      storage,
      cas,
      registration_event,
      safety
    } = compound;

    let molblock = rdkit.smilesToMolBlock(smiles);
    let content = {
      id,
      smiles,
      molblock,
      compound_id,
      compound_id_aliases,
      name,
      description,
      attributes,
      storage,
      cas,
      registration_event,
      safety
    };

    let result;

    const { area: areaID, sub_area: subAreaID } = container.location;
    let location = await Location.findById(areaID);
    const area = location.area.name;
    const sub_area = location.area.sub_areas.id(subAreaID).name;

    result = container.toObject({
      virtuals: true,
      transform: (doc, ret) => {
        ret.location = {};
        ret.location.area = {id: areaID, name: area};
        ret.location.sub_area = {id: subAreaID, name: sub_area};
        ret.content = content;
        return ret;
      }
    });

    return result;
  }
};

export default getContainer;
