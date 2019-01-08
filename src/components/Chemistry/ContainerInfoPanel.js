import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import PrintIcon from '@material-ui/icons/Print';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import QuickPrintModal from '../Printer/QuickPrintModal';
import GetUsers from '../queries/GetUsers';

const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  input: {
    display: 'none',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '33.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  panelButton: {
    float: 'left'
  },
  panelActions: {
    padding: theme.spacing.unit * 3
  }
});

class ContainerInfoPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state= {
      printModalOpen: false
    };
    this.openPrintModal = this.openPrintModal.bind(this);
    this.handlePrintModalClose = this.handlePrintModalClose.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  handleClose = toggleForm => () => toggleForm();

  openPrintModal = () => this.setState({ printModalOpen: true });
  handlePrintModalClose = () => this.setState({ printModalOpen: false });

  render() {
    const { classes, expanded, theme, toggleDetails, container } = this.props;
    return (
      <GetUsers>
        { users => (
          <div className={classes.root}>
            {
              container ? (
                <QuickPrintModal
                  open={this.state.printModalOpen}
                  onClose={this.handlePrintModalClose}
                  data={container.barcode}
                />
              ): null
            }
            <ExpansionPanel expanded={expanded} CollapseProps={{
              timeout: {
                enter: 0,
                exit: theme.transitions.duration.shortest
              }
            }}>
              <ExpansionPanelSummary onClick={toggleDetails}>
                <div className={classes.column}>
                  <Typography className={classes.heading}>
                    Container Information
                  </Typography>
                </div>
                <div className={classes.column}>
                  <Typography className={classes.secondaryHeading}>
                    View container details
                  </Typography>
                </div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.details}>
                {
                  container ? (
                    <Grid
                      container
                      alignItems="center"
                      spacing={32}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subheading">
                            Barcode: {container.barcode}
                          <Tooltip title="Print barcode" placement="right">
                            <IconButton aria-label="Print" onClick={this.openPrintModal}>
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subheading">
                          Location: {(container.location.area.name == 'UNASSIGNED') ?
                            'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subheading">
                          Category: {container.category}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subheading">
                          Batch ID: {
                            <Link to={`/chemistry/containers/${container.id}`}>{container.batch_id}</Link>
                          }
                        </Typography>
                      </Grid>
                      {
                        container.vendor ? (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                                Vendor: {container.vendor}
                            </Typography>
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                                Institution: {container.institution}
                            </Typography>
                          </Grid>
                        )
                      }
                      {
                        container.catalog_id ? (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                                Catalog No.: {container.catalog_id}
                            </Typography>
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                                Researcher: {container.researcher}
                            </Typography>
                          </Grid>
                        )
                      }
                      {
                        container.eln_id  ? (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                                ELN ID: {container.eln_id}
                            </Typography>
                          </Grid>
                        ) : null
                      }
                      {
                        (container.state == 'S') ? (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                              {`Mass: ${Math.round(container.mass*1000)/1000} ${container.mass_units}`}
                            </Typography>
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                              {`Volume: ${Math.round(container.volume*1000)/1000} ${container.vol_units}`}
                            </Typography>
                          </Grid>
                        )
                      }
                      {
                        (container.state == 'Soln' || container.state == 'Susp') ? (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                              {`Concentration: ${Math.round(container.concentration*1000)/1000} ${container.conc_units}`}
                            </Typography>
                          </Grid>
                        ) : null
                      }
                      {
                        (container.state == 'Soln' || container.state == 'Susp') ? (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subheading">
                                Solvent: {container.solvent}
                            </Typography>
                          </Grid>
                        ) : null
                      }
                      {
                        container.description ? (
                          <Grid item xs={12}>
                            <Typography variant="subheading" gutterBottom>
                                Description:
                            </Typography>
                            <Typography variant="subheading">
                              {container.description}
                            </Typography>
                          </Grid>
                        ) : null
                      }
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subheading">
                            Owner: {users.find(user => user.id == container.owner).name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subheading" color="textSecondary" align="right">
                            Registered by {container.registration_event.user} on {dateTimeToString(container.registration_event.date)}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="display1" align="center">
                      Please click a row on the table.
                    </Typography>
                  )
                }
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        )}
      </GetUsers>
    );
  }
}

ContainerInfoPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  container: PropTypes.object,
  toggleDetails: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(ContainerInfoPanel);
