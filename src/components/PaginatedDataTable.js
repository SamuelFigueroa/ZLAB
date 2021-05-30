import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PaginatedDataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
      loading: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangePageLimit = this.handleChangePageLimit.bind(this);
  }

  fetchData = async () => {
    let success = false;
    let { data, pageInfo } = await this.props.fetchData();
    if (data && (this.state.data.length || data.length)) {
      const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;
      this.setState({ data, hasNextPage, hasPreviousPage, startCursor, endCursor });
      success = true;
    }
    return success;
  }

  handleChangePage = async page => {
    const { startCursor, endCursor } = this.state;
    const { onChangePage } = this.props;
    this.setState({ loading: true });
    await onChangePage(page, startCursor, endCursor);
    await this.fetchData();
    this.setState({ loading: false });
  }

  handleChangePageLimit = async limit => {
    const { onChangePageLimit } = this.props;
    this.setState({ loading: true });
    await onChangePageLimit(limit);
    await this.fetchData();
    this.setState({ loading: false });
  }

  async componentDidMount() {
    await this.props.onMount();
    await this.fetchData();
    if(this.props.onInitialFetch !== undefined)
      this.props.onInitialFetch();
  }

  render() {
    const { component: Component, toolbar: Toolbar, toolbarProps, tableProps, paginationOptions } = this.props;
    const { page, first, last, paginationCount } = paginationOptions;
    const pageLimit = first || last;
    const { searchProps } = toolbarProps;
    const { data, ...pageInfo } = this.state;
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
        pageInfo={{
          page,
          limit: pageLimit,
          ...pageInfo,
        }}
        handleChangePage={this.handleChangePage}
        handleChangeRowsPerPage={this.handleChangePageLimit}
        paginationCount={paginationCount}
      />
    );
  }
}

PaginatedDataTable.propTypes = {
  component: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  toolbar: PropTypes.func,
  toolbarProps: PropTypes.object,
  onMount: PropTypes.func.isRequired,
  onInitialFetch: PropTypes.func,
  tableProps: PropTypes.object.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageLimit: PropTypes.func.isRequired,
  paginationOptions: PropTypes.object.isRequired,
};

export default PaginatedDataTable;
