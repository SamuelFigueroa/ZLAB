import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

class TabContainer extends PureComponent {
  constructor(props) {
    super(props);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidMount() {
    window.addEventListener('resize', () => this.context.swipeableViews.slideUpdateHeight());
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.context.swipeableViews.slideUpdateHeight());
  }

  render() {
    const { children, dir } = this.props;

    return (
      <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
        {children}
      </Typography>
    );
  }
}

TabContainer.propTypes = {
  children: PropTypes.node,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 1100
  }
});

class SwipeableTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme, tabs } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >{
              tabs.map(tab => <Tab label={tab.label} key={tab.id}/>)
            }
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
          animateHeight={true}
        >{
            tabs.map(tab => (
              <TabContainer dir={theme.direction} key={tab.id}>
                {tab.component}
              </TabContainer>
            ))
          }
        </SwipeableViews>
      </div>
    );
  }
}

SwipeableTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  tabs: PropTypes.array.isRequired,
};

export default withStyles(styles, { withTheme: true })(SwipeableTabs);
