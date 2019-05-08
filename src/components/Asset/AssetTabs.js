import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import EquipmentTable from './EquipmentTable';
import ConsumablesTable from './ConsumablesTable';

import Tabs from '../Tabs';

const tabs = [
  {
    id: 'equipment',
    label: 'Equipment',
    component: null
  }, {
    id: 'consumables',
    label: 'Consumables',
    component: null
  }
];
class AssetTabs extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.category);
    this.state = {
      value: index == -1 ? 0 : index
    };
    this.linkToAssetInfo = this.linkToAssetInfo.bind(this);
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
    if(prevProps.category !== this.props.category) {
      const index = tabs.map(tab => tab.id).indexOf(this.props.category);
      if(index == -1)
      {
        let location = this.props.history.location;
        location.hash = tabs[0].id;
        this.props.history.push(location);
      }
      this.setState({ value:  index == -1 ? 0 : index });
    }
  }

  linkToAssetInfo = (category) => (id) => () => this.props.history.push(`/assets/${category}/${id}#profile`);

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
    tabs[0].component = (
      <EquipmentTable
        cacheID="equipment"
        onRowClick={this.linkToAssetInfo}
        search={null}
      />
    );
    tabs[1].component = (
      <ConsumablesTable
        cacheID="consumables"
        onRowClick={this.linkToAssetInfo}
        search={null}
      />
    );

    return  <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>;

  }
}

AssetTabs.propTypes = {
  history: PropTypes.object.isRequired,
  category: PropTypes.string.isRequired
};

export default withRouter(AssetTabs);
