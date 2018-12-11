import React from 'react';
import PropTypes from 'prop-types';

import Editor from './Editor';
import SmilesToMolBlock from '../mutations/SmilesToMolBlock';

const StructureEditor = props => (
  <SmilesToMolBlock>
    { smilesToMolBlock => (
      <Editor {...props} smilesToMolBlock={smilesToMolBlock} />
    )}
  </SmilesToMolBlock>
);

StructureEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  molblock: PropTypes.string.isRequired,
  smiles: PropTypes.string
};

export default StructureEditor;
