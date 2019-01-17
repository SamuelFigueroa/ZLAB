import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_DOCUMENT from '../../graphql/documents/getDocument';

import { Query } from 'react-apollo';

class GetDocument extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_DOCUMENT} skip={true}>
        { ({ client }) => {
          const callQuery = async (id, collection) => {
            const { data } = await client.query({
              query: GET_DOCUMENT,
              variables: { id, collection }
            });
            return data.document;
          };
          return this.props.children(callQuery);
        }}
      </Query>
    );
  }
}

GetDocument.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetDocument;
