import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = () => ({
  details: {
    alignItems: 'center',
  },
  panel: {
    width: '100%',
  },
  container: {
    overflow: 'visible'
  }
});

class FilterPanel extends PureComponent {
  constructor(props) {
    super(props);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object,
  };

  componentDidUpdate() {
    if(this.context.swipeableViews !== undefined)
      setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  render() {
    const { classes, theme, expanded, enabled, toggleExpansion, toggleFilter, label } = this.props;
    return(
      <ExpansionPanel className={classes.panel} expanded={expanded} CollapseProps={{
        classes: {
          container: expanded && classes.container
        },
        timeout: {
          enter: 0,
          exit: theme.transitions.duration.shortest
        }
      }}>
        <ExpansionPanelSummary onClick={toggleExpansion}
          expandIcon={<ExpandMoreIcon color={enabled ? 'inherit' : 'disabled'}/>}
        >
          <FormControlLabel
            control={
              <Switch
                onClick={toggleFilter}
                checked={enabled}
                value="checked_profile"
              />}
            label={
              <Typography id="label" variant="subheading" color={enabled ? 'primary' : 'textSecondary'}>
                {label}
              </Typography>
            }/>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          {this.props.children}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

FilterPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  toggleExpansion: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(FilterPanel);
