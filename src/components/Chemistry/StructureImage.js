import React, { Component } from 'react';
import PropTypes from 'prop-types';
import chemical_editor from './chemical_editor';

class StructureImage extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    chemwriter.refresh();
  }

  render() {
    const { molblock, ...rest } = this.props;
    return (
      <div { ...rest}>
        <div id="image"
          data-chemwriter-data={molblock}
          data-chemwriter-ui="image"
        >
        </div>
      </div>
    );
  }
}

StructureImage.propTypes = {
  molblock: PropTypes.string.isRequired,
};

export default StructureImage;
