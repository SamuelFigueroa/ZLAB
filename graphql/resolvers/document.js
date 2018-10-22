import { ApolloError, UserInputError } from 'apollo-server-express';
import { storageDir, cacheDir } from '../../config';
import path from 'path';
import fse from 'fs-extra';
import mongoose from 'mongoose';

import Asset from '../../models/Asset';
import Document from '../../models/Document';

import validateUploadInput from '../../validation/upload';

const cache = path.normalize(cacheDir);
const storage = path.normalize(storageDir);

const storeFile = ({ stream, id, name }) => {
  const dstPath = path.join(storage, `${id}-${name}`);
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fse.unlinkSync(dstPath);
        reject(error);
      })
      .pipe(fse.createWriteStream(dstPath))
      .on('error', error => reject(error))
      .on('finish', () => {
        return resolve({ id, dstPath });
      })
  );
};

const resolvers = {
  Query: {
    document: async (root, args) => {
      let document = await Document.findById(args.id);
      if(!document) {
        throw new ApolloError('Can\'t find document', 'BAD_REQUEST');
      } else {
        try {
          await fse.ensureDir(cache);
          await fse.ensureDir(storage);
        } catch(err) {
          throw new ApolloError('Document retrieval failed', 'DOC_DIRS_NOT_FOUND');
        }
        const { id, name } = document;
        const srcPath = path.join(storage, `${id}-${name}`);
        const dstPath = path.join(cache, `${id}-${name}`);
        try {
          await fse.copyFile(srcPath, dstPath);
          const p = dstPath.split('/');
          const result = p.slice(p.indexOf('public') + 1);
          result.unshift('/');
          return path.join.apply(this, result);
        } catch(err) {
          throw new ApolloError('Document retrieval failed', 'FILE_CACHE_ERROR');
        }
      }
    },
  },
  Mutation: {
    validateUpload: async (root, args) => {
      const { name, size } = args.input;
      const { errors: inputErrors, isValid } = validateUploadInput({ name, size });
      const errors = { errors: inputErrors };

      // Check validation
      if (!isValid) {
        throw new UserInputError('Document upload failed', errors);
      }
      return true;
    },
    addDocument: async (root, args, context) => {
      const { name, size, category, user, model: modelName, field, objID } = args.input;

      try {
        await fse.ensureDir(storage);
      } catch(err) {
        throw new ApolloError('Document upload failed', 'STORAGE_DIR_NOT_FOUND');
      }

      const { stream, mimetype, encoding } = await args.input.file;

      const newDocument = new Document({
        name,
        mimetype,
        encoding,
        size,
        category,
        upload_event: {
          user
        }
      });

      const id = newDocument.id;
      try {
        await storeFile({ stream, id, name });
      } catch(err) {
        throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
      }

      let Model = await context.db_conn.model(modelName);

      let doc;

      try {
        doc = await Model.findById(objID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!doc) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      } else {
        if(field) {
          doc[field].documents.push(id);
        } else {
          doc.documents.push(id);
        }
        await doc.save();
        await newDocument.save();
        return true;
      }
    },
    deleteDocument: async (root, args) => {
      let asset_documents;
      let names;
      const document_IDs = args.ids.map(id => mongoose.Types.ObjectId(id));
      try {
        await Asset.findByIdAndUpdate(args.assetID,
          { $pull : { documents : { $in : document_IDs } } } );
        asset_documents = await Document.find({ '_id': { $in: document_IDs }}, 'name');
        names = asset_documents.map(asset_document => `${asset_document._id.toString()}-${asset_document.name}`);
        await Document.deleteMany({ '_id': { $in: document_IDs }});
        for (const name of names) {
          await fse.unlink(path.join(storage, name));
        }
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }
      return null;
    },
    clearDocuments: async () => {
      try {
        await fse.emptyDir(cache);
        return null;
      } catch(err) {
        throw new ApolloError('Document removal failed', 'FAILED_TO_EMPTY_DIR');
      }
    },
  }
};

export default resolvers;
