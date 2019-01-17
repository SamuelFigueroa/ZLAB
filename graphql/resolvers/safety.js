import { ApolloError, UserInputError } from 'apollo-server-express';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import rdkit from 'node-rdkit';
import { storageDir, cacheDir } from '../../config';
import safetyCodes from '../../data/safetyCodes';
import mongoose from 'mongoose';
import path from 'path';
import fse from 'fs-extra';
import stringify from 'csv-stringify';

import SafetyDataSheet from '../../models/SafetyDataSheet';
import Document from '../../models/Document';
import Compound from '../../models/Compound';

import validateFilename from '../../validation/filename';

const cache = path.normalize(cacheDir);
const storage = path.join(path.normalize(storageDir), 'SDS');
const chemicalSafetyUrl = 'https://chemicalsafety.com/sds1/retriever.php';
const chemicalSafetyViewerUrl = 'https://chemicalsafety.com/sds1/sdsviewer.php';
const viewSDSSelector = 'span#sds_links > a';

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

const cacheFile = ({ stream, name }) => {
  const dstPath = path.join(cache, `${name}`);
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
        return resolve({ dstPath });
      })
  );
};

JSON.flatten = (data, delimiter) => {
  const result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      result[prop] = cur;
      // for(var i=0, l=cur.length; i<l; i++)
      //   recurse(cur[i], prop ? prop+'.'+i : ''+i);
      // if (l == 0)
      //   result[prop] = [];
    } else {
      let isEmpty = true;
      Object.keys(cur).forEach(p => {
        isEmpty = false;
        recurse(cur[p], prop ? prop+delimiter+p : p);
      });
      if (isEmpty)
        result[prop] = {};
    }
  };
  recurse(data, '');
  return result;
};

const resolvers = {
  Query: {
    safetyDataSheets: async (root, args) => {
      const { hclass_to_hcodes } = safetyCodes;
      const { filter, search } = args;

      let pipeline = [
        {
          $lookup: {
            from: 'compounds',
            localField: 'compound',
            foreignField: '_id',
            as: 'compoundArray'
          }
        },
        {
          $lookup: {
            from: 'documents',
            localField: 'document',
            foreignField: '_id',
            as: 'documentArray'
          }
        },
        {
          $project: {
            'compound': 0,
            'document': 0,
          }
        },
        {
          $addFields: {
            'compound': {
              $let: {
                vars: { compound: { $arrayElemAt: ['$compoundArray', 0] }},
                in: '$$compound'
              }
            },
            'document': {
              $let: {
                vars: { document: { $arrayElemAt: ['$documentArray', 0] }},
                in: '$$document'
              }
            },
            'id': '$_id'
          }
        },
        {
          $addFields: {
            'compound.id': '$compound._id',
            'document.id': '$document._id'
          }
        },
        {
          $project: {
            '_id': 0,
            'compound._id': 0,
            'document._id': 0,
            'compoundArray': 0,
            'documentArray': 0,
            'compound.containers': 0,
            'compound.transfers': 0,
            'compound.curations': 0,
            'compound.batchCount': 0
          }
        }
      ];

      let safetyDataSheets = [];

      if(filter && Object.keys(filter).length) {
        let filterConditions = { '$and': Object.keys(filter).map(key => {
          if(key == 'h_class') {
            return ({ h_statements: { $in: Array.from(new Set(filter[key].map(h_class=>hclass_to_hcodes[h_class]).reduce((acc, curr)=>acc.concat(curr)))) } });
          }
          return ({ [key]: { $in: filter[key] } });
        }) };
        pipeline.unshift({ $match: filterConditions });
      }

      //Implement general text search here if needed.

      safetyDataSheets = await SafetyDataSheet.aggregate(pipeline);

      for (const sheet of safetyDataSheets) {
        sheet.compound.molblock = rdkit.smilesToMolBlock(sheet.compound.smiles);
      }

      return safetyDataSheets;
    },
    safetyDataSheet: async (root, args) => {
      const { h_statements: hazards, p_statements: precautions } = safetyCodes;
      let result;
      try {
        let sds = await SafetyDataSheet.findById(args.id);
        // let document = await Document.findById(sds.document);
        let compound = await Compound.findById(sds.compound);
        const {
          id,
          smiles,
          compound_id,
          compound_id_aliases,
          name,
          description,
          attributes,
          flags,
          storage,
          cas,
          registration_event
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
          flags,
          storage,
          cas,
          registration_event
        };

        result = sds.toObject({
          virtuals: true,
          transform: (doc, ret) => {
            let h_statements = doc.h_statements.filter(code=>Object.keys(hazards).includes(code));
            let p_statements = doc.p_statements.filter(code=>Object.keys(precautions).includes(code));
            let h_classes = Array.from(new Set(h_statements.map(code=>hazards[code].class)));
            ret.h_classes = h_classes;
            ret.h_statements = h_statements.length ? (
              h_statements.map(code=>({ code, statement: hazards[code].statement, type: hazards[code].type }))
            ) : [];
            ret.p_statements = p_statements.length ? (
              p_statements.map(code=>({
                code,
                type: precautions[code].type,
                statement: precautions[code].statement,
                conditions: Array.from(new Set(Object.keys(precautions[code].conditions).filter(h_class=>h_classes.includes(h_class)).map(h_class=>precautions[code].conditions[h_class])))
               }))
            ) : [];
            ret.compound = content;
            return ret;
          }
        });
      } catch (err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      return result;
    },
    safetyDataSheetHints: async (root, args, context, info) => {

      const { h_statements } = safetyCodes;

      let manufacturer = await SafetyDataSheet.distinct('manufacturer', { manufacturer: { $not: /^$/ } });
      let signal_word = await SafetyDataSheet.distinct('signal_word', { signal_word: { $not: /^$/ } });
      let pictograms = await SafetyDataSheet.distinct('pictograms', { pictograms: { $not: /^$/ } });
      let h_codes = await SafetyDataSheet.distinct('h_statements', { h_statements: { $not: /^$/ } });

      let h_class = Array.from(new Set(h_codes.map(h_code => h_statements[h_code].class)));

      return ({ manufacturer, signal_word, pictograms, h_class });
    },
    searchChemicalSafety: async (root, args) => {
      const errors = { errors: {} };
      let compound;
      try {
        compound = await Compound.findById(args.compoundID);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(!compound) {
        throw new ApolloError('SDS search failed', 'BAD_REQUEST');
      } else {
        let chemicalSafetySearchResults = [];
        if (!compound.cas && !compound.name) {
          errors.errors.compound = 'Compound name or CAS number is required';
          throw new UserInputError('SDS search failed', errors);
        }
        if (compound.cas) {
          let cas_search = await fetch(chemicalSafetyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'search',
              hostName: 'chemicalsafety.com',
              isContains: '0',
              p1: 'MSMSDS.COMMON|',
              p2: 'MSMSDS.MANUFACT|',
              p3: `MSCHEM.CAS|${compound.cas}`
            }),
          });
          let cas_response = await cas_search.json();
          for (const result of cas_response.rows) {
            if (result[4] == '1')
              chemicalSafetySearchResults.push({
                id: result[0].trim(),
                product_name: result[1].trim(),
                manufacturer: result[2].trim(),
                cas: result[3].trim()
              });
          }
        }
        if (compound.name && !chemicalSafetySearchResults.length) {
          let name_search = await fetch(chemicalSafetyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'search',
              hostName: 'chemicalsafety.com',
              isContains: '0',
              p1: `MSMSDS.COMMON|${compound.name}`,
              p2: 'MSMSDS.MANUFACT|',
              p3: 'MSCHEM.CAS|'
            }),
          });
          let name_response = await name_search.json();
          for (const result of name_response.rows) {
            if (result[4] == '1')
              chemicalSafetySearchResults.push({
                id: result[0].trim(),
                product_name: result[1].trim(),
                manufacturer: result[2].trim(),
                cas: result[3].trim()
              });
          }
        }
        // return chemicalSafetySearchResults.sort((a, b) => {
        //   if (a.manufacturer == 'SIGMA ALDRICH' && b.manufacturer == 'SIGMA ALDRICH')
        //     return 0
        //   if (a.manufacturer == 'SIGMA ALDRICH')
        //     return -1;
        //   if (b.manufacturer == 'SIGMA ALDRICH')
        //     return 1;
        //   return 0;
        // });
        return chemicalSafetySearchResults;
      }
    },
  },
  Mutation: {
    previewSafetyDataSheet: async (root, args) => {
      const errors = { errors: {} };
      const { sds_id, product_name } = args;

      let browser = await puppeteer.launch();
      let pdf_url = '';
      //Get valid SDS PDF url
      try {
        const browserContext = browser.defaultBrowserContext();
        const page = await browser.newPage();
        const pageTarget = page.target();
        await page.goto(`${chemicalSafetyViewerUrl}?id=${sds_id}`);
        await page.waitFor(viewSDSSelector);
        await page.click(viewSDSSelector);
        const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
        const newPage = await newTarget.page();
        pdf_url = newTarget.url();
      } catch(err) {
        await browser.close();
        errors.errors[sds_id] = 'Preview not available.';
        throw new UserInputError('Preview failed', errors);
      }
      await browser.close();
      return pdf_url;

    },
    addSafetyDataSheet: async (root, args, context) => {
      const { input } = args;
      const { upload, compound, sds_id, user } = input;
      const errors = { errors: {} };

      let c;
      try {
        c = await Compound.findById(compound);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      if(c.safety) {
        errors.errors.upload = 'Compound already has a registered SDS';
        throw new ApolloError('Compound already has a registered SDS', 'BAD_REQUEST', errors);
      }

      let sds = { compound,
        sds_id: '',
        manufacturer: '',
        signal_word: '',
        pictograms: [],
        p_statements: [],
        h_statements: []
      };

      let document;
      let readableStream;

      try {
        await fse.ensureDir(storage);
      } catch(err) {
        throw new ApolloError('Document upload failed', 'STORAGE_DIR_NOT_FOUND');
      }

      if (upload) {
        const { name, size } = upload;

        const { stream, mimetype, encoding } = await upload.file;

        readableStream = stream;
        document = { name, mimetype, encoding, size, upload_event: { user },
          category: 'Safety'
        };
      } else {
        let product_name;
        let browser;
        let pdf_url;

        //Get SDS details
        try {
          let sds_request = await fetch(chemicalSafetyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'msdsdetail',
              isContains: '',
              p1: parseInt(sds_id),
              p2: '',
              p3: ''
            }),
          });

          let sds_response = await sds_request.json();

          const sds_details = sds_response.rows[0];
          product_name = sds_details[1];
          sds.sds_id = sds_id;
          sds.manufacturer = sds_details[2];
          sds.signal_word = sds_details[12];
          sds.pictograms = sds_details[9].split(',');
          sds.p_statements = sds_details[5].split(',');
          sds.h_statements = sds_details[6].split(',');
        } catch(err) {
          errors.errors.upload = 'Document upload failed';
          throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
        }

        //Get valid SDS PDF url
        try {
          browser = await puppeteer.launch();
          const browserContext = browser.defaultBrowserContext();
          const page = await browser.newPage();
          const pageTarget = page.target();
          await page.goto(`${chemicalSafetyViewerUrl}?id=${sds_id}&name=${product_name}`);
          await page.waitFor(viewSDSSelector);
          await page.click(viewSDSSelector);
          const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
          const newPage = await newTarget.page();
          pdf_url = newTarget.url();
        } catch(err) {
          errors.errors.upload = 'Document upload failed';
          throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
        } finally {
          await browser.close();
        }

        //Get PDF readable stream
        try {
          let pdf_request = await fetch(pdf_url);
          let headers = pdf_request.headers.raw();
          const size = headers['content-length'][0].toString();
          const mimetype = headers['content-type'][0].toString();
          const name = `SDS-${product_name}${ mimetype == 'application/pdf' ? '.pdf' : '' }`;

          readableStream = pdf_request.body;
          document = { name, mimetype, size, upload_event: { user },
            encoding: '7bit',
            category: 'Safety'
          };
        } catch(err) {
          errors.errors.upload = 'Document upload failed';
          throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
        }
      }

      const newDocument = new Document(document);
      const documentID = newDocument.id;
      sds.document = documentID;
      const newSDS = new SafetyDataSheet(sds);
      const sdsID = newSDS.id;

      try {
        await storeFile({ stream: readableStream, id: documentID, name: document.name });
        await Compound.findByIdAndUpdate(compound, { safety: sdsID });
      } catch(err) {
        errors.errors.upload = 'Document upload failed';
        throw new ApolloError('Document upload failed', 'FILE_UPLOAD_ERROR');
      }

      await newDocument.save();
      await newSDS.save();

      return true;
    },
    deleteSafetyDataSheet: async (root, args) => {
      try {
        let sds = await SafetyDataSheet.findById(args.id);
        let document = await Document.findById(sds.document);
        const file_name = `${sds.document}-${document.name}`;
        await Compound.findByIdAndUpdate(sds.compound, { safety: null });
        await Document.findByIdAndDelete(sds.document);
        await fse.unlink(path.join(storage, file_name));
        await SafetyDataSheet.findByIdAndDelete(args.id);
      } catch(err) {
        throw new ApolloError('Database lookup failed', 'BAD_DATABASE_CONNECTION');
      }

      return null;
    },
    exportCompoundSafetyData: async (root, args) => {
      const { input } = args;
      const { errors: inputErrors, isValid } = validateFilename(input);
      const errors = { errors: inputErrors };
      // Check validation
      if (!isValid) {
        throw new UserInputError('Data export failed', errors);
      }

      const { filter, search, searchCategories, search2, name } = input;
      let pipeline = [
        {
          $lookup: {
            from: 'compounds',
            localField: 'compound',
            foreignField: '_id',
            as: 'compoundArray'
          }
        },
        {
          $lookup: {
            from: 'documents',
            localField: 'document',
            foreignField: '_id',
            as: 'documentArray'
          }
        },
        {
          $project: {
            'compound': 0,
            'document': 0,
          }
        },
        {
          $addFields: {
            'compound': {
              $let: {
                vars: { compound: { $arrayElemAt: ['$compoundArray', 0] }},
                in: '$$compound'
              }
            },
            'document': {
              $let: {
                vars: { document: { $arrayElemAt: ['$documentArray', 0] }},
                in: '$$document'
              }
            },
            'id': '$_id'
          }
        },
        {
          $addFields: {
            'compound.id': '$compound._id',
            'document.id': '$document._id'
          }
        },
        {
          $project: {
            '_id': 0,
            'compound._id': 0,
            'document._id': 0,
            'compoundArray': 0,
            'documentArray': 0,
            'compound.containers': 0,
            'compound.transfers': 0,
            'compound.curations': 0,
            'compound.batchCount': 0
          }
        }
      ];

      let safetyDataSheets = [];

      if(filter && Object.keys(filter).length) {
        let filterConditions = { '$and': Object.keys(filter).map(key => {
          if(key == 'h_class') {
            return ({ h_statements: { $in: Array.from(new Set(filter[key].map(h_class=>hclass_to_hcodes[h_class]).reduce((acc, curr)=>acc.concat(curr)))) } });
          }
          return ({ [key]: { $in: filter[key] } });
        }) };
        pipeline.unshift({ $match: filterConditions });
      }

      safetyDataSheets = await SafetyDataSheet.aggregate(pipeline);

      let columns = [];
      let records = [];

      if (safetyDataSheets.length) {
        for (const sheet of safetyDataSheets) {
          let record = JSON.flatten(sheet, '.');
          record.id = sheet.id.toString();
          records.push(record);
        }
      }

      const keys = {
        name: 'compound.name',
        manufacturer: 'manufacturer',
        signal_word: 'signal_word',
        compound_id: 'compound.compound_id'
      };

      columns = [
        { key: 'compound.name', header: 'Name'},
        { key: 'compound.compound_id', header: 'Compound ID'},
        { key: 'manufacturer', header: 'Manufacturer'},
        { key: 'signal_word', header: 'Signal Word'},
        { key: 'pictograms', header: 'Pictograms'},
        { key: 'h_statements', header: 'H-Statements'},
        { key: 'p_statements', header: 'P-Statements'},
        { key: 'id', header: 'ID'},
      ];

      await fse.ensureDir(cache);

      let data = records.slice()
        .filter( result => !searchCategories.length ||
        searchCategories.some( cat =>
          result[keys[cat]].toLowerCase().indexOf(search2.toLowerCase()) > -1));
      try {
        let stream = await stringify( data, {
          header: true,
          columns
        });
        await cacheFile({ stream, name });
      } catch(err) {
        console.log(err);
        throw new ApolloError('Data export failed', 'DATA_EXPORT_ERROR');
      }

      const dstPath = path.join(cache, name);
      try {
        const p = dstPath.split('/');
        const result = p.slice(p.indexOf('public') + 1);
        result.unshift('/');
        return path.join.apply(this, result);
      } catch(err) {
        throw new ApolloError('Document retrieval failed', 'FILE_CACHE_ERROR');
      }
    }
  }
};

export default resolvers;
