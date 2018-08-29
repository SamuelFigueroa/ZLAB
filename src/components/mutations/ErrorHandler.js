import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SET_ERRORS from '../../graphql/setErrors';
import GET_ERRORS from '../../graphql/getErrors';

import { Mutation, Query } from 'react-apollo';

class ErrorHandler extends Component {
  constructor(props) {
    super(props);
    this.state={};
    this.setErrors = React.createRef();
    this.handleError = this.handleError.bind(this);
    this.clearErrors = this.clearErrors.bind(this);
  }

  clearErrors = () => this.setErrors.current.mutate({ variables: { errors: [] } });

  componentDidMount() {
    this.setErrors.current.mutate({ variables: { errors: [] } });
  }

  componentWillUnmount() {
    this.setErrors.current.mutate({ variables: { errors: [] } });
  }

  handleError = errorObj => {
    const errors = [];
    const inputErrors = errorObj.graphQLErrors[0].extensions.exception.errors;
    Object.keys(inputErrors).forEach(key => errors.push({
      __typename: 'Error',
      key,
      message: inputErrors[key]}));
    return this.setErrors.current.mutate({ variables: { errors } });
  }

  render() {
    return(
      <Mutation
        mutation={SET_ERRORS}
        ref={this.setErrors}>
        {() => (
          <Query query={GET_ERRORS}>
            { ({ data }) => {
              const errors = data.errors.reduce((acc, error) => Object.assign(acc, {[error.key]:error.message}), {});
              return this.props.children(this.handleError, errors, this.clearErrors);
            }}
          </Query>
        )}
      </Mutation>
    );
  }
}

ErrorHandler.propTypes = {
  children: PropTypes.func.isRequired
};

export default ErrorHandler;
