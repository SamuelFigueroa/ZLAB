import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TableToolbar from '../TableToolbar';
import SubstructureSearch from './SubstructureSearch';

class ChemistryTableToolbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { substructureProps, ...other } = this.props;
    return (
      <TableToolbar
        {...other}
        custom={[
          <SubstructureSearch {...substructureProps} refetch={other.refetch} key="substructure"/>,
        ]} />
    );
  }
}

ChemistryTableToolbar.propTypes = {
  substructureProps: PropTypes.object.isRequired
};

export default ChemistryTableToolbar;
