import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@material-ui/core/Tooltip';
import RadioTable from '../RadioTable';
import DataTable from '../DataTable';
import TableToolbar from '../TableToolbar';
import IconButton from '@material-ui/core/IconButton';
import PreviewIcon from '@material-ui/icons/FindInPage';
import Typography from '@material-ui/core/Typography';

import PreviewSafetyDataSheet from '../mutations/PreviewSafetyDataSheet';
const cols = [
  { key: 'product_name', alphanumeric: true, label: 'Product Name' },
  { key: 'manufacturer', alphanumeric: true, label: 'Manufacturer' },
  { key: 'cas', alphanumeric: true, label: 'CAS No.' },
  { key: 'preview', alphanumeric: false, label: 'Preview' }
];

const searchCategories = cols.filter(c=>c.alphanumeric);

class SDSSearchTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search2: '',
      searchCategories: searchCategories.map(c=>c.key),
      initialized: false,
    };
  }

  render() {
    const { searchChemicalSafety, toolbarProps, onRowClick, selected } = this.props;

    return (
      <div>
        <DataTable
          component={RadioTable}
          tableProps={{
            cols,
            onRowClick,
            selected,
            queryExecuted: this.state.initialized
          }}
          onMount={()=>null}
          onInitialFetch={()=>this.setState({ initialized: true })}
          fetchData={
            async () => {
              let data = await searchChemicalSafety();
              return data !== undefined ?
                data.map(d => ({...d, preview: (
                  <PreviewSafetyDataSheet>
                    { (previewSafetyDataSheet, previewLoading, previewErrors) => (
                      previewErrors[d.id] ? (
                        <Typography variant="body2" color="error">
                          {previewErrors[d.id]}
                        </Typography>
                      ) : (
                        previewLoading ? (
                          <Typography variant="body2" color="textSecondary">
                          Loading preview...
                          </Typography>
                        ) : (
                          <Tooltip title="Preview" placement="right">
                            <IconButton
                              aria-label="Preview"
                              onClick={()=>previewSafetyDataSheet(d.id)}>
                              <PreviewIcon />
                            </IconButton>
                          </Tooltip>
                        ))
                    )}
                  </PreviewSafetyDataSheet>
                )})) : [];
            }}
          toolbar={TableToolbar}
          toolbarProps={{
            title: 'Search Results',
            searchProps: {
              onSubmit: ({ value, selectedCols }) => this.setState({
                search2: value,
                searchCategories: selectedCols
              }),
              initialized: this.state.initialized,
              value: this.state.search2,
              selectedCols: this.state.searchCategories,
              cols: searchCategories
            },
            ...toolbarProps
          }}
        />
      </div>
    );
  }
}

SDSSearchTable.propTypes = {
  onRowClick: PropTypes.func.isRequired,
  toolbarProps: PropTypes.object.isRequired,
  searchChemicalSafety: PropTypes.func.isRequired,
  selected: PropTypes.string,
};

export default SDSSearchTable;
