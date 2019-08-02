import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import ContainersTable from './ContainersTable';
import CompoundsTable from './CompoundsTable';

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
  }
});

const tables = [
  {
    id: 'containers',
    label: 'Containers',
    component: null,
  }, {
    id: 'compounds',
    label: 'Compounds',
    component: null
  }
];

class ChemistrySearch extends Component {
  constructor(props) {
    super(props);
    this.linkToChemistryInfo = this.linkToChemistryInfo.bind(this);
  }
  linkToChemistryInfo = (category) => (id) => () => this.props.history.push(`/chemistry/${category}/${id}#profile`);

  render() {
    const { classes, initialized, results } = this.props;

    tables[0].component = (
      <ContainersTable
        cacheID="search_containers"
        onRowClick={this.linkToChemistryInfo('containers')}
        search={this.props.search}
      />
    );
    tables[1].component = (
      <CompoundsTable
        cacheID="search_compounds"
        onRowClick={this.linkToChemistryInfo('compounds')}
        search={this.props.search}
      />
    );

    return (
      <div className={classes.root}>
        {
          <Grid container spacing={8}>
            { !initialized ? (
              <Grid item xs={12}>
                <Typography align="center" variant="h4" gutterBottom>
                  {`Searching for '${this.props.search}'...`}
                </Typography>
              </Grid>
            ) : null }
            { initialized && !results ? (
              <Grid item xs={12}>
                <Typography align="center" variant="h4" gutterBottom>
                  {`Search '${this.props.search}' did not match any documents.`}
                </Typography>
              </Grid>
            ) :  null }
            <Grid item xs={12}>
              <Grid container spacing={8}>
                { initialized && results ? (
                  <Grid item xs={12}>
                    <Typography variant="h5">
                      {`Search results: '${this.props.search}'`}
                    </Typography>
                  </Grid>
                ) : null }
                <Grid item xs={12} style={{ display: (initialized && results) ? 'block' : 'none' }}>
                  {
                    tables.map( table => (
                      <Grid key={table.id} item xs={12}>
                        {table.component}
                      </Grid>
                    ))
                  }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        }
      </div>
    );
  }
}

ChemistrySearch.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
  initialized: PropTypes.bool.isRequired,
  results: PropTypes.bool.isRequired
};

export default withStyles(styles)(withRouter(ChemistrySearch));
