import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
    this.fetchData = this.fetchData.bind(this);
  }

  fetchData = async () => {
    let success = false;
    let data = await this.props.fetchData();
    if (data && (this.state.data.length || data.length)) {
      this.setState({ data });
      success = true;
    }
    return success;
  }

  async componentDidMount() {
    await this.props.onMount();
    await this.fetchData();
    if(this.props.onInitialFetch !== undefined)
      this.props.onInitialFetch();
  }

  render() {
    const { component: Component, toolbar: Toolbar, toolbarProps, tableProps } = this.props;
    const { searchProps } = toolbarProps;
    const { data } = this.state;
    const filteredData = data
      .filter( result => !searchProps.selectedCols.length ||
      searchProps.selectedCols.some( col => {
        const data = result[col].toLowerCase !== undefined ?
          result[col].toLowerCase() :
          result[col].props.label.toLowerCase();
        return data.indexOf(searchProps.value.toLowerCase()) > -1;
      })
      );
    return (
      <Component
        toolbar={
          <Toolbar
            {...toolbarProps}
            refetch={this.fetchData} />
        }
        data={filteredData}
        {...tableProps}
      />
    );
  }
}

DataTable.propTypes = {
  component: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  toolbar: PropTypes.func,
  toolbarProps: PropTypes.object,
  onMount: PropTypes.func.isRequired,
  onInitialFetch: PropTypes.func,
  tableProps: PropTypes.object.isRequired
};

export default DataTable;
