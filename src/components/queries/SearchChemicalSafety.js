import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import SEARCH_CHEMICAL_SAFETY from '../../graphql/safety/searchChemicalSafety';

import { Query } from 'react-apollo';
import ErrorHandler from '../mutations/ErrorHandler';

class SearchChemicalSafety extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={SEARCH_CHEMICAL_SAFETY}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async compoundID => {
                try {
                  const { data, loading, error } = await client.query({
                    query: SEARCH_CHEMICAL_SAFETY,
                    variables: { compoundID },
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { searchChemicalSafety } = data;
                  return searchChemicalSafety;
                } catch(errorObj) {
                  await handleError(errorObj);
                }
              };
              return this.props.children(callQuery, errors, clearErrors);
            }}
          </Query>
        )}
      </ErrorHandler>
    );
  }
}

SearchChemicalSafety.propTypes = {
  children: PropTypes.func.isRequired,
 };

export default SearchChemicalSafety;
