import { ApolloError } from 'apollo-server-express';

import { cacheDir } from '../../config';
import path from 'path';
import fse from 'fs-extra';
import stringify from 'csv-stringify';
import { pipeline } from 'stream';
import { promisify } from 'util';

const asyncPipeline = promisify(pipeline);
const cache = path.normalize(cacheDir);

const writeCsvFile = async ({ data, stringifier, destination }) => {
  await asyncPipeline(
    data,
    stringifier,
    destination,
  );
};
const exportContainerCollection = async ({ extraCols, dstPath, data }) => {

  const columns = [
    { key: 'smiles', header: 'SMILES' },
    { key: 'barcode', header: 'Barcode' },
    { key: 'name', header: 'Compound Name' },
    { key: 'cas', header: 'CAS No.' },
    { key: 'category', header: 'Category' },
    { key: 'area', header: 'Area' },
    { key: 'sub_area', header: 'Sub Area' },
    { key: 'vendor', header: 'Vendor' },
    { key: 'catalog_id', header: 'Catalog ID' },
    { key: 'institution', header: 'Institution' },
    { key: 'researcher', header: 'Researcher' },
    { key: 'eln_id', header: 'ELN ID' },
    { key: 'state', header: 'State' },
    { key: 'mass', header: 'Mass' },
    { key: 'mass_units', header: 'Mass Units' },
    { key: 'volume', header: 'Volume' },
    { key: 'vol_units', header: 'Volume Units' },
    { key: 'concentration', header: 'Concentration' },
    { key: 'conc_units', header: 'Conc. Units' },
    { key: 'solvent', header: 'Solvent' },
    { key: 'owner', header: 'Owner' },
    { key: 'description', header: 'Compound Description' },
    { key: 'container_description', header: 'Container Description' },
    { key: 'storage', header: 'Storage Conditions' },
  ].concat(extraCols);

  await fse.ensureDir(cache);

  const stringifier = stringify({
    header: true,
    columns
  });

  stringifier.on('error', () => {
    // Delete the truncated file
    fse.unlinkSync(dstPath);
  });

  try {
    await writeCsvFile({
      data,
      stringifier,
      destination: fse.createWriteStream(dstPath)
    });
  } catch(err) {
    throw new ApolloError('Data export failed', 'DATA_EXPORT_ERROR');
  }
  stringifier.end();

  try {
    const p = dstPath.split('/');
    const result = p.slice(p.indexOf('public') + 1);
    result.unshift('/');
    return path.join.apply(this, result);
  } catch(err) {
    throw new ApolloError('Document retrieval failed', 'FILE_CACHE_ERROR');
  }
};

export default exportContainerCollection;
