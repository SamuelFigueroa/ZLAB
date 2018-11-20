import React, { Component } from 'react';
import PropTypes from 'prop-types';
import chemical_editor from './chemical_editor';

class StructureEditor extends Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = () => {
    let editor = chemwriter.components['editor'];
    let molBlock = editor.getMolfile();
    return this.props.onChange(molBlock);
  }

  componentDidMount() {
    chemwriter.refresh();
    let editor = chemwriter.components['editor'];
    if(this.props.molblock)
      editor.setMolfile(this.props.molblock);
    editor.addEventListener('document-edited', this.handleChange);
  }

  render() {
    return (
      <div id="editor"
        data-chemwriter-width="500"
        data-chemwriter-height="350"
        data-chemwriter-ui="editor"
      >
      </div>
    );
  }
}

StructureEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  molblock: PropTypes.string.isRequired
};

export default StructureEditor;
