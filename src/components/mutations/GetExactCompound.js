import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorHandler from '../mutations/ErrorHandler';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';

import GET_EXACT_COMPOUND from '../../graphql/compounds/getExactCompound';

import { Mutation } from 'react-apollo';

class GetExactCompound extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={GET_EXACT_COMPOUND}
            onCompleted={ ({ exactCompound }) => {
              const { id, smiles, cas } = exactCompound;
              if(id)
                return this.props.history.push(`/chemistry/compounds/${id}#containers`);
              else {
                return this.props.history.push(`/chemistry/compounds/new?${queryString.stringify({smiles, cas})}`);
              }
            }}
            onError={ errorObj => handleError(errorObj) }
          >
            { exactCompound => {
              const callMutation = (molblock, cas) => exactCompound({
                variables: { molblock, cas },
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

GetExactCompound.propTypes = {
  children: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(GetExactCompound);
