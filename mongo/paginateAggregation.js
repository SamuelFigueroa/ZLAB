import { UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

import validatePaginationInput from '../validation/pagination';

const paginateAggregation = async (model, pipeline, paginationInput) => {

  const { errors: inputErrors, isValid } = validatePaginationInput(paginationInput);
  const errors = { errors: inputErrors };

  // Check validation
  if (!isValid) {
    throw new UserInputError('Pagination failed', errors);
  }

  let paginationStages = [];

  const { first, last, after, before } = paginationInput;
  if (first !== undefined) {
    paginationStages.push({ $sort: { id: -1 } });
    paginationStages.push({ $limit: after !== undefined ? first + 2 : first + 1});
  }

  if (last !== undefined) {
    paginationStages.push({ $sort: { id: 1 } });
    paginationStages.push({ $limit: before !== undefined ? last + 2 : last + 1 });
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

  pipeline = pipeline.concat([
    {
      $facet: {
        totalCount: [{ $count: 'value' }],
        paginationStages
      },
    },
  ]);

  let pipeOut = await model.aggregate(pipeline);
  const { totalCount, paginationStages: aggregationResults } = pipeOut[0];
  const connection = {
    totalCount: totalCount.length && totalCount[0].value,
    edges: [],
  };

  connection.edges = aggregationResults.map(node => {
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

export default paginateAggregation;
