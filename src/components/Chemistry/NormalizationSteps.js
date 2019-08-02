import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Hidden from '@material-ui/core/Hidden';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';

import GetContainerNormalization from '../queries/GetContainerNormalization';
import GetLocationNormalization from '../queries/GetLocationNormalization';
import GetUserNormalization from '../queries/GetUserNormalization';
import RegisterContainerCollection from '../mutations/RegisterContainerCollection';

import ContainerCollectionPreview from './ContainerCollectionPreview';
import ContainerNormalizationTable from './ContainerNormalizationTable';
import LocationNormalizationTable from './LocationNormalizationTable';
import UserNormalizationTable from './UserNormalizationTable';
import OnRegistrationQueued from '../subscriptions/OnRegistrationQueued';

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3
  },
  paper: {
    paddingTop: theme.spacing.unit * 5,
    paddingLeft: theme.spacing.unit * 5,
    paddingRight: theme.spacing.unit * 5,
    paddingBottom: theme.spacing.unit * 3
  },
  stepper: {
    paddingLeft: 0,
    paddingRight: 0
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  footer: {
    paddingTop: theme.spacing.unit * 3
  }
});
const steps = ['Preview and verify data accuracy', 'Normalize container fields', 'Normalize locations', 'Normalize users' ];

const StepComponent = ({ collectionID, activeStep, ...props }) => {
  switch (activeStep) {
  case 0:
    return <ContainerCollectionPreview collectionID={collectionID} {...props} />;
  case 1:
    return (
      <GetContainerNormalization collectionID={collectionID}>
        { (containerNormalization, loading) =>
          <Fade in={!loading}>
            <div>
              <ContainerNormalizationTable data={containerNormalization} {...props} />
            </div>
          </Fade>
        }
      </GetContainerNormalization>
    );
  case 2:
    return (
      <GetLocationNormalization collectionID={collectionID}>
        { (locationNormalization, loading) =>
          <Fade in={!loading}>
            <div>
              <LocationNormalizationTable data={locationNormalization} {...props} />
            </div>
          </Fade>
        }
      </GetLocationNormalization>
    );
  case 3:
    return (
      <GetUserNormalization collectionID={collectionID}>
        { (userNormalization, loading) =>
          <Fade in={!loading}>
            <div>
              <UserNormalizationTable data={userNormalization} {...props} />
            </div>
          </Fade>
        }
      </GetUserNormalization>
    );
  default:
    return null;
  }
};
StepComponent.propTypes = {
  activeStep: PropTypes.number.isRequired,
  collectionID: PropTypes.string.isRequired
};

class NormalizationSteps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      navigate: null,
    };
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNext = () => {
    this.setState(state => ({ activeStep: state.activeStep + 1, navigate: this.handleNext }));
  };

  handleBack = () => {
    if(this.state.activeStep === 0) {
      this.props.history.push('/chemistry/containers/collections');
    } else {
      this.setState(state => ({ activeStep: state.activeStep - 1, navigate: this.handleBack }));
    }
  };

  handleSubmit = ({
    locationNormalization,
    containerNormalization,
    userNormalization
  }, registerContainerCollection) => () => {
    const normalization = {
      id: this.props.collection.id,
      containerFieldsNormalized: containerNormalization.filter(n=>n.registerAs !== null).map(({id, field, __typename, ...n})=>({ field: field.toLowerCase(), ...n })),
      locationsNormalized: locationNormalization.filter(n=>n.registerAs !== null).map(({id, field, __typename, ...n})=>{
        const { __typename:__t1, ...registerAs } = n.registerAs;
        n.registerAs = registerAs;
        const { __typename: __t2, ...unregistered } = n.unregistered;
        n.unregistered = unregistered;
        return n;
      }),
      usersNormalized: userNormalization.filter(n=>n.registerAs !== null).map(({id, field, __typename, ...n})=>n),
    };
    registerContainerCollection(normalization);
  }

  render() {
    const { classes, collection, handleRegistrationQueued } = this.props;
    const { activeStep, navigate } = this.state;
    const collectionID = collection.id;
    return (
      <OnRegistrationQueued collectionID={collectionID} onRegistrationQueued={async ()=>{
        await handleRegistrationQueued();
        this.props.history.push('/chemistry/containers/collections');
      }}>
        { () =>
          <RegisterContainerCollection>
            { (registerContainerCollection, loading) =>
              <GetContainerNormalization collectionID={collectionID}>
                { (containerNormalization, loadingN1) =>
                  <GetLocationNormalization collectionID={collectionID}>
                    { (locationNormalization, loadingN2) =>
                      <GetUserNormalization collectionID={collectionID}>
                        { (userNormalization, loadingN3) =>
                          <div className={classes.root}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                  <Grid container>
                                    <Grid item xs={12}>
                                      <Typography variant="h5" color="primary" gutterBottom>
                                        Field Normalization
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle1" color="textSecondary">
                                        Collection: {collection.name}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Stepper className={classes.stepper} activeStep={activeStep}>
                                        { steps.map(label =>
                                          <Step key={label}>
                                            <StepLabel><Hidden only="xs">{label}</Hidden></StepLabel>
                                          </Step>
                                        )}
                                      </Stepper>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Button
                                        onClick={this.handleBack}
                                        className={classes.button}
                                      >
                                        Back
                                      </Button>
                                      <Button
                                        disabled={
                                          loadingN1||loadingN2||loadingN3||loading
                                        ||(activeStep === 3 && userNormalization.some(u=>u.registerAs===null))}
                                        variant="contained"
                                        color="primary"
                                        onClick={activeStep === steps.length ? this.handleSubmit({
                                          locationNormalization,
                                          containerNormalization,
                                          userNormalization
                                        }, registerContainerCollection) : this.handleNext}
                                        className={classes.button}
                                      >
                                        {activeStep === steps.length ? (loading ? 'Registering...':'Register') : 'Next'}
                                      </Button>
                                    </Grid>
                                    { (activeStep === steps.length) ? (
                                      <Grid item xs={12}>
                                        <Typography className={classes.footer} variant="subtitle1">
                                          Field normalization is complete - Please proceed to register the collection.
                                        </Typography>
                                      </Grid>
                                    ) : null }
                                  </Grid>
                                </Paper>
                              </Grid>
                              <Grid item xs={12}>
                                <StepComponent
                                  activeStep={activeStep}
                                  collectionID={collectionID}
                                  navigate={navigate}
                                  collectionSize={collection.size}
                                />
                              </Grid>
                            </Grid>
                          </div>
                        }
                      </GetUserNormalization>
                    }
                  </GetLocationNormalization>
                }
              </GetContainerNormalization>
            }
          </RegisterContainerCollection>
        }
      </OnRegistrationQueued>
    );
  }
}

NormalizationSteps.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  collection: PropTypes.object.isRequired,
  handleRegistrationQueued: PropTypes.func.isRequired
};

export default withStyles(styles)(withRouter(NormalizationSteps));
