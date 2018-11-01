import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Tabs from '../Tabs';
import PrinterFormats from './PrinterFormats';
import PrinterHub from './PrinterHub';

const tabs = [
  {
    id: 'online',
    label: 'Printers',
    component: null
  },{
    id: 'formats',
    label: 'Formats',
    component: null
  }
];

class HubTabs extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.tabID);
    this.state = {
      value: index == -1 ? 0 : index
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
  }

  componentDidMount() {
    let location = this.props.history.location;
    if(!location.hash) {
      location.hash = tabs[this.state.value].id;
      return this.props.history.push(location);
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.tabID !== this.props.tabID) {
      const index = tabs.map(tab => tab.id).indexOf(this.props.tabID);
      if(index == -1)
      {
        let location = this.props.history.location;
        location.hash = tabs[0].id;
        this.props.history.push(location);
      }
      this.setState({ value:  index == -1 ? 0 : index });
    }
  }

  handleChange = (event, value) => {
    this.setState({ value });
    let location = this.props.history.location;
    location.hash = tabs[value].id;
    return this.props.history.push(location);
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
    let location = this.props.history.location;
    location.hash = tabs[index].id;
    return this.props.history.push(location);
  };

  render() {
    tabs[0].component = <PrinterHub {...this.props.hubProps}/>;
    tabs[1].component = <PrinterFormats {...this.props.hubProps}/>;
    return  <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>;

  }
}

HubTabs.propTypes = {
  history: PropTypes.object.isRequired,
  tabID: PropTypes.string.isRequired,
  hubProps:PropTypes.object.isRequired
};

export default withRouter(HubTabs);
