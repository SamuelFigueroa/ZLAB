import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link, withRouter } from 'react-router-dom';

import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import Table from '../CheckableTable';
import DeletePrinterFormat from '../mutations/DeletePrinterFormat';
import GetPrinterFormats from '../queries/GetPrinterFormats';

const styles = (theme) => ({
  fab: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2,
    zIndex: 10
  },
});

const printerFormatCols = [
  { id: 'name', numeric: false, label: 'Name' }
];

class PrinterFormats extends PureComponent {
  constructor(props) {
    super(props);
  }
  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  render() {
    const { classes, name } = this.props;

    return (
      <DeletePrinterFormat>
        { deletePrinterFormat => (
          <GetPrinterFormats withFields={false}>
            { printerFormats => (
              <div>
                <Tooltip title="Add Printer Format">
                  <Fab
                    className={classes.fab}
                    color="primary"
                    component={Link}
                    to={`/printers/${name}/formats/new`}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
                <Table
                  cols={printerFormatCols}
                  data={printerFormats}
                  title="Printer Formats"
                  actions={{
                    delete: deletePrinterFormat,
                  }}
                  onRowClick={formatID => () => this.props.history.push(`/printers/${name}/formats/${formatID}`)}
                  editMode={false}
                  editable={false}
                />
              </div>
            )}
          </GetPrinterFormats>
        )}
      </DeletePrinterFormat>
    );
  }
}

PrinterFormats.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(PrinterFormats));
