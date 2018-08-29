import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Zoom from '@material-ui/core/Zoom';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';


import Table from './Table';
import DocumentForm from './DocumentForm';
import GET_ASSET from '../graphql/assets/getAsset';

const styles = (theme) => ({
  fab: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 3,
    zIndex: 10
  },
  fabGreen: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 3,
    zIndex: 10,
    color: theme.palette.common.white,
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
});

const documentCols = [
  { id: 'name', numeric: false, label: 'Name' },
  { id: 'category', numeric: false, label: 'Category' },
  { id: 'size', numeric: false, label: 'Size (KB)'},
  { id: 'uploaded_by', numeric: false, label: 'Uploaded By' },
  { id: 'upload_date', numeric: false, label: 'Date' }
];

class DocumentLog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.toggleEventForm = this.toggleEventForm.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  toggleEventForm = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded } );
  };

  render() {
    const { classes, theme, docs, user, docID, assetHeadline } = this.props;
    const fabs = [
      {
        color: 'primary',
        tooltip: 'Add Document',
        icon: <AddIcon />,
        className: classes.fab
      },
      {
        color: 'inherit',
        tooltip: 'Upload',
        icon: <EditIcon />,
        className: classes.fabGreen
      },
    ];

    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: 0,
    };

    const formatted_docs = docs.map(doc => ({
      ...doc,
      size: String(parseFloat(doc.size) / 1000),
      upload_date: new Date(doc.upload_date).toLocaleDateString('en-US'),
    }));

    return (
      <div>
        {fabs.map((fab, index) => (
          <Zoom
            key={fab.color}
            in={Number(this.state.expanded) === index}
            timeout={transitionDuration}
            mountOnEnter
            unmountOnExit
          >
            <Button variant="fab" className={fab.className} color={fab.color} onClick={this.toggleEventForm}>
              {fab.icon}
            </Button>
          </Zoom>
        ))}
        <Table cols={documentCols} data={formatted_docs} title="Documents" subheading={assetHeadline} onRowClick={() => null}/>
        <DocumentForm expanded={this.state.expanded} user={user} model="assets" query={GET_ASSET} docID={docID} toggleForm={this.toggleEventForm}/>
      </div>

    );
  }
}

DocumentLog.propTypes = {
  classes: PropTypes.object.isRequired,
  docs: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  docID: PropTypes.string.isRequired,
  assetHeadline: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(DocumentLog);
