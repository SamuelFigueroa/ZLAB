import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Fade from '@material-ui/core/Fade';

import Table from '../Table';
import Toolbar from '../TableToolbar';
import GetStagedContainers from '../queries/GetStagedContainers';

const collectionPreviewCols = [
  { key: 'molblock', alphanumeric: false, label: 'Structure' },
  { key: 'barcode', alphanumeric: true, label: 'Barcode' },
  { key: 'cas', alphanumeric: true, label: 'CAS No.' },
  { key: 'source', alphanumeric: true, label: 'Source' },
  { key: 'source_id', alphanumeric: true, label: 'Source ID' },
  { key: 'amount', alphanumeric: true, label: 'Amount' },
  { key: 'location', alphanumeric: true, label: 'Location' },
];
class ContainerCollectionPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 100
    };
    this.handlePaginate = this.handlePaginate.bind(this);
  }

  handlePaginate = (onLoadMore) => async (limit, update) => {
    if(limit)
      await onLoadMore(limit);

    this.setState(update);
  }

  render() {
    const { collectionID, collectionSize } = this.props;
    return (
      <GetStagedContainers collectionID={collectionID}>
        { (stagedContainers, onLoadMore, loading) =>
          <Fade in={!loading}>
            <div>
              <Table
                cols={collectionPreviewCols}
                data={stagedContainers.map(container => ({
                  ...container,
                  location: (container.location.area == 'UNASSIGNED') ?
                    'UNASSIGNED' : `${container.location.area} / ${container.location.sub_area}`,
                  source: container.vendor ? container.vendor : container.institution,
                  source_id: container.vendor ? container.catalog_id : (
                    container.category == 'Sample' ?  `${container.researcher} / ${container.eln_id}` :
                      container.researcher
                  ),
                  amount: container.state == 'S' ? `${container.mass} ${container.mass_units}` : (
                    container.state == 'L' ? `${container.volume} ${container.vol_units}` :
                      `${container.volume} ${container.vol_units} / ${container.concentration} ${container.conc_units}`
                  )
                }))}
                toolbar={<Toolbar title="Collection Preview" />}
                onRowClick={()=>null}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                paginationCount={collectionSize}
                onPaginate={this.handlePaginate(onLoadMore)}
              />
            </div>
          </Fade>
        }
      </GetStagedContainers>
    );
  }
}

ContainerCollectionPreview.propTypes = {
  collectionSize: PropTypes.number.isRequired,
  collectionID: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired
};

export default withRouter(ContainerCollectionPreview);
