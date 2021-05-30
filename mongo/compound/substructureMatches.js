import { UserInputError } from 'apollo-server-express';

import rdkit from 'node-rdkit';
import validatePaginationInput from '../../validation/pagination';
import mongoose from 'mongoose';

const substructureMatches = async (model, pipeline, paginationInput, substructureFilter, getSmiles)  => {

  const { errors: inputErrors, isValid } = validatePaginationInput(paginationInput);
  const errors = { errors: inputErrors };

  // Check validation
  if (!isValid) {
    throw new UserInputError('Pagination failed', errors);
  }

  const { first, last, after, before } = paginationInput;
  let substructureMatchLimit;

  if (first !== undefined) {
    pipeline.push({ $sort: { id: -1 } });
    substructureMatchLimit = after !== undefined ? first + 2 : first + 1;
  }

  if (last !== undefined) {
    pipeline.push({ $sort: { id: 1 } });
    substructureMatchLimit = before !== undefined ? last + 2 : last + 1;
  }

  if (after !== undefined) {
    let afterEdgeCursor = Buffer.from(after, 'base64');
    let afterEdgeID = afterEdgeCursor.toString('ascii');
    pipeline.unshift({ $match: { _id: { $lte: mongoose.Types.ObjectId(afterEdgeID) } } });
  }

  if (before !== undefined) {
    let beforeEdgeCursor = Buffer.from(before, 'base64');
    let beforeEdgeID = beforeEdgeCursor.toString('ascii');
    pipeline.unshift({ $match: { _id: { $gte: mongoose.Types.ObjectId(beforeEdgeID) } } });
  }

  let pipeOut = await model.aggregate(pipeline);
  let matches = [];
  let totalCount = 0;
  for (const result of pipeOut) {
    let hasSubstructMatch = false;
    try {
      hasSubstructMatch = rdkit.hasSubstructMatch(getSmiles(result), substructureFilter.pattern, substructureFilter.removeHs);
    } catch(err) {
      errors.errors = { compounds: { substructure : err.message } };
      throw new UserInputError('Container filtering failed', errors);
    }
    if (!hasSubstructMatch)
      continue;
    if (matches.length < substructureMatchLimit)
      matches.push(result);
    totalCount = totalCount + 1;
  }

  let connection = {
    totalCount,
    edges: []
  };

  connection.edges = matches.map(node => {
    let nodeID = Buffer.from(node.id.toString());
    let cursor = nodeID.toString('base64');
    return { node, cursor };
  });

  let hasNextPage = false;
  let hasPreviousPage = false;

  if (connection.edges.length > 0) {
    if (after !== undefined) {
      // Edges are sorted in _id descending order (from most recent to oldest)
      // If the "after" edge is included in the query results, it should
      // be the first element of the array.
      if (after === connection.edges[0].cursor) {
        hasPreviousPage = true;
        connection.edges = connection.edges.slice(1, connection.edges.length + 1);
      }
    }

    if (first !== undefined) {
      hasNextPage = connection.edges.length > first;
      if (hasNextPage)
        connection.edges = connection.edges.slice(0, -1);
    }

    if (before !== undefined) {
      if (before === connection.edges[0].cursor) {
        hasNextPage = true;
        connection.edges = connection.edges.slice(1, connection.edges.length + 1);
      }
    }

    if (last !== undefined) {
      hasPreviousPage = connection.edges.length > last;
      if (hasPreviousPage)
        connection.edges = connection.edges.slice(0, -1);
      connection.edges = connection.edges.reverse();
    }
  }

  connection.pageInfo = {
    hasPreviousPage,
    hasNextPage,
    startCursor: connection.edges.length ? connection.edges[0].cursor : '',
    endCursor: connection.edges.length ? connection.edges[connection.edges.length - 1].cursor : ''
  };

  return connection;
};


export default substructureMatches;
