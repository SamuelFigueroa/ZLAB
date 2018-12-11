import React, { Component } from 'react';
import PropTypes from 'prop-types';
import chemical_editor from './chemical_editor';

class Editor extends Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = () => {
    let editor = chemwriter.components['editor'];
    let molBlock = editor.getMolfile();
    return this.props.onChange(molBlock);
  }

  async componentDidMount() {
    chemwriter.refresh();
    let editor = chemwriter.components['editor'];
    editor.addEventListener('document-edited', this.handleChange);
    const { smiles, molblock, smilesToMolBlock } = this.props;
    if (smiles) {
      let result = await smilesToMolBlock(smiles);
      editor.setMolfile(result.data.smilesToMolBlock);
    } else {
      if(molblock)
        editor.setMolfile(molblock);
    }
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

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  molblock: PropTypes.string.isRequired,
  smilesToMolBlock: PropTypes.func.isRequired,
  smiles: PropTypes.string
};

export default Editor;
