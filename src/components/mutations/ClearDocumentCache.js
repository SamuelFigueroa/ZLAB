import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CLEAR_DOCUMENT_CACHE from '../../graphql/documents/clearDocumentCache';
import { Mutation } from 'react-apollo';

class ClearDocumentCache extends Component {
  constructor(props) {
    super(props);
    this.clearDocumentCache = React.createRef();
  }

  componentDidMount() {
    this.clearDocumentCache.current.mutate({ variables: {} });
  }

  componentWillUnmount() {
    this.clearDocumentCache.current.mutate({ variables: {} });
  }

  render() {

    return(
      <Mutation
        mutation={CLEAR_DOCUMENT_CACHE}
        ref={this.clearDocumentCache}
      >
        { () => this.props.children }
      </Mutation>
    );
  }
}

ClearDocumentCache.propTypes = {
  children: PropTypes.node,
};

export default ClearDocumentCache;
