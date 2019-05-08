import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Tabs from '../Tabs';

import ContainersTable from './ContainersTable';
import CompoundsTable from './CompoundsTable';

const tabs = [
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
class ChemistryTabs extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.category);
    this.state = {
      value: index == -1 ? 0 : index
    };
    this.linkToChemistryInfo = this.linkToChemistryInfo.bind(this);
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

  linkToChemistryInfo = (category) => (id) => () => this.props.history.push(`/chemistry/${category}/${id}#profile`);

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
      <ContainersTable
        cacheID="containers"
        onRowClick={this.linkToChemistryInfo('containers')}
        search={null}
      />
    );
    tabs[1].component = (
      <CompoundsTable
        cacheID="compounds"
        onRowClick={this.linkToChemistryInfo('compounds')}
        search={null}
      />
    );

    return  <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>;

  }
}

ChemistryTabs.propTypes = {
  history: PropTypes.object.isRequired,
  category: PropTypes.string.isRequired
};

export default withRouter(ChemistryTabs);
