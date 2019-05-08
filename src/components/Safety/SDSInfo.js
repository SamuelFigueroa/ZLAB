import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import cyan from '@material-ui/core/colors/cyan';
import pink from '@material-ui/core/colors/pink';
import yellow from '@material-ui/core/colors/yellow';
import amber from '@material-ui/core/colors/amber';
import grey from '@material-ui/core/colors/grey';
import Hidden from '@material-ui/core/Hidden';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Popper from '@material-ui/core/Popper';
import ButtonBase from '@material-ui/core/ButtonBase';

import GetSafetyDataSheet from '../queries/GetSafetyDataSheet';
import GetDocument from '../queries/GetDocument';
import DeleteSafetyDataSheet from '../mutations/DeleteSafetyDataSheet';
import StructureImage from '../Chemistry/StructureImage';
import Pictogram from './Pictogram';

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 2,
  },
  header: {
    paddingBottom: theme.spacing.unit * 3
  },
  sectionTitle: {
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit
  },
  structure: {
    width: theme.spacing.unit * 20,
    height: theme.spacing.unit * 20,
    margin:'auto'
  },
  pictogram: {
    width: theme.spacing.unit * 12,
    height: theme.spacing.unit * 12,
  },
  chip: {
    margin: theme.spacing.unit
  },
  paper: {
    padding: theme.spacing.unit * 4,
    overflow: 'scroll'
  },
  danger: {
    backgroundColor: red[500],
    color: theme.palette.common.white
  },
  warning: {
    backgroundColor: amber[500],
    color: theme.palette.common.white
  },
  physical: {
    backgroundColor: red[500],
    color: theme.palette.common.white
  },
  health: {
    backgroundColor: blue[500],
    color: theme.palette.common.white
  },
  environmental: {
    backgroundColor: green[500],
    color: theme.palette.common.white
  },
  general: {
    backgroundColor: grey[400],
  },
  prevention: {
    backgroundColor: yellow['A400'],
    // color: theme.palette.common.white
  },
  response: {
    backgroundColor: pink['500'],
    color: theme.palette.common.white
  },
  storage: {
    backgroundColor: cyan['A400'],
    // color: theme.palette.common.white
  },
  disposal: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white
  },
  popper: {
    zIndex: 1,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.common.white} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${theme.palette.common.white} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${theme.palette.common.white} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${theme.palette.common.white}`,
      },
    },
  },
  arrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  info: {
    maxWidth: 400,
    overflow: 'auto',
    padding: theme.spacing.unit
  },
  delete: {
    marginTop: theme.spacing.unit * 3,
  }
});

const pictograms = {
  'GHS01': { symbol: 'Exploding bomb', id: 'exploding_bomb' },
  'GHS02': { symbol: 'Flame', id: 'flame' },
  'GHS03': { symbol: 'Flame over circle', id: 'flame_over_circle' },
  'GHS04': { symbol: 'Gas cylinder', id: 'gas_cylinder' },
  'GHS05': { symbol: 'Corrosion', id: 'corrosion' },
  'GHS06': { symbol: 'Skull and crossbones', id: 'skull_and_crossbones' },
  'GHS07': { symbol: 'Exclamation mark', id: 'exclamation_mark' },
  'GHS08': { symbol: 'Health hazard', id: 'health_hazard' },
  'GHS09': { symbol: 'Environment', id: 'environment' }
};

const glossary = {
  product_identifier: 'Name or number used for a hazardous product on a label or in the SDS. It provides a unique means by which the product user can identify the substance or mixture within the particular use setting e.g. transport, consumer or workplace.',
  signal_word: 'Word used to indicate the relative level of severity of hazard and alert the reader to a potential hazard on the label. The GHS uses Danger and Warning as signal words; Danger is mostly used for the more severe hazard categories, while Warning is mostly used for the less severe.',
  pictogram: 'Graphical composition that may include a symbol plus other graphic elements, such as a border, background pattern or colour that is intended to convey specific information.',
  exploding_bomb: 'The exploding bomb symbol is assigned to categories of explosives and self-reacting substances and mixtures.',
  flame: 'The flame symbol is assigned to categories of flammable gases, liquids and solids, aerosols, pyrophoric liquids and solids, organic peroxides, desensitized explosives, self-reacting or self-heating substances and mixtures, and substances and mixtures which, in contact with water, emit flammable gases.',
  flame_over_circle: 'The flame over circle symbol is assigned to categories of oxidizing gases (i.e. any gas which may, generally by providing oxygen, cause or contribute to the combustion of other material more than air does), oxidizing liquids and oxidizing solids which, are not necessarily combustible, but may, generally by yielding oxygen, cause, or contribute to, the combustion of other materials.',
  gas_cylinder: 'The gas cylinder symbol is assigned to categories of gases under pressure.',
  corrosion: 'The corrosion symbol is assigned to categories of metal corrosives, skin corrosives and irritants, and substances that cause serious eye damage/eye irritation.',
  skull_and_crossbones: 'The skull and crossbones symbol is assigned to categories of acutely toxic substances.',
  exclamation_mark: 'The exclamation mark symbol is assigned to categories of skin sensitizers, some acutely toxic substances, skin corrosives and irritants, respiratory tract irritants, substances that cause serious eye damage/eye irritation, drowsiness or dizziness, and those which are hazardous to the ozone layer.',
  health_hazard: 'The health hazard symbol is assigned to categories of respiratory sensitizers, aspiration hazards, germ cell mutagens, carcinogens, substances that are toxic to reproduction, and substances that are toxic to specific target organs following single or repeated exposure.',
  environment: 'The environment symbol is assigned to categories of substances that are acutely (short-term) or chronic (long-term) hazardous to the aquatic environment.',
  hazard_class: 'A hazard class refers to the nature of the physical, health or environmental hazard, e.g. flammable solid, carcinogen, oral acute toxicity.',
  label_element: 'GHS stands for “Globally Harmonized System of Classification and Labelling of Chemicals”. A label element is one type of information that has been harmonized for use in a label, e.g. pictogram, signal word.',
  hazard_statement: 'Statement assigned to a hazard class and category that describes the nature of the hazards of a hazardous product, including, where appropriate, the degree of hazard.',
  precautionary_statement: 'Phrase (and/or pictogram) that describes recommended measures that should be taken to minimize or prevent adverse effects resulting from exposure to a hazardous product, or improper storage or handling of a hazardous product.'
};

class SDSInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      arrowRef: null,
      anchorEl: null,
      key: null
    };
    this.handleArrowRef = this.handleArrowRef.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.linkToDocument = this.linkToDocument.bind(this);
  }

  getInfo = key => event => {
    const { currentTarget } = event;
    this.setState({ key, anchorEl: currentTarget, open: this.state.anchorEl ===  currentTarget ? !this.state.open : true });
  }

  handleArrowRef = node => {
    this.setState({
      arrowRef: node,
    });
  }

  linkToDocument = (getDocument, id, collection) => async () => {
    let docURL = await getDocument(id, collection);
    window.open(docURL, '');
  }

  render() {
    const { classes, id } = this.props;
    const { open, key, arrowRef, anchorEl } = this.state;
    const popperId = open ? 'safety-data-sheet' : null;
    const terms = {
      'Warning': (key)=>(
        <Chip
          key={key}
          className={classes.warning}
          clickable={false}
          label={<Typography variant="button" color="inherit">Warning</Typography>}
        />),
      'Danger': (key)=>(
        <Chip
          key={key}
          className={classes.danger}
          clickable={false}
          label={<Typography variant="button" color="inherit">Danger</Typography>}
        />),
    };
    const info = {
      'product_identifier':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         Product Indentifiers
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary.product_identifier }
        </Typography>
      </Typography>,
      'signal_word':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         Signal word
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          {
            glossary.signal_word.split(new RegExp(`(${Object.keys(terms).join('|')})`, 'g')).map((term,i) => terms[term] === undefined ? term : terms[term](i))
          }
        </Typography>
      </Typography>,
      'pictogram':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         Pictogram
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary.pictogram }
        </Typography>
      </Typography>,
      'hazard_class':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         GHS Hazard Classes
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary.hazard_class }
        </Typography>
      </Typography>,
      'hazard_statement':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         Hazard Statement
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary.hazard_statement }
        </Typography>
        <Grid container alignItems="center" spacing={8}>
          <Grid item>
            <Chip
              className={classes.physical}
              clickable={false}
              label={<Typography variant="button" color="inherit">physical</Typography>}
            />
          </Grid>
          <Grid item>
            <Chip
              className={classes.health}
              clickable={false}
              label={<Typography variant="button" color="inherit">health</Typography>}
            />
          </Grid>
          <Grid item>
            <Chip
              className={classes.environmental}
              clickable={false}
              label={<Typography variant="button" color="inherit">environmental</Typography>}
            />
          </Grid>
        </Grid>
      </Typography>,
      'precautionary_statement':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         Precautionary Statement
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary.precautionary_statement }
        </Typography>
        <Grid container alignItems="center" spacing={8}>
          <Grid item>
            <Chip
              className={classes.general}
              clickable={false}
              label={<Typography variant="button" color="inherit">general</Typography>}
            />
          </Grid>
          <Grid item>
            <Chip
              className={classes.prevention}
              clickable={false}
              label={<Typography variant="button" color="inherit">prevention</Typography>}
            />
          </Grid>
          <Grid item>
            <Chip
              className={classes.response}
              clickable={false}
              label={<Typography variant="button" color="inherit">response</Typography>}
            />
          </Grid>
          <Grid item>
            <Chip
              className={classes.storage}
              clickable={false}
              label={<Typography variant="button" color="inherit">storage</Typography>}
            />
          </Grid>
          <Grid item>
            <Chip
              className={classes.disposal}
              clickable={false}
              label={<Typography variant="button" color="inherit">disposal</Typography>}
            />
          </Grid>
        </Grid>
      </Typography>,
      'label_element':
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
         GHS Label Elements
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary.label_element }
        </Typography>
      </Typography>,
    };

    Object.keys(pictograms).forEach(
      k => info[k] =
      <Typography style={{ lineHeight: '2.5em' }} component="span" variant="title">
        {pictograms[k].symbol}
        <Typography style={{ lineHeight: '2.5em' }} component="span" variant="body1">
          { glossary[pictograms[k].id] }
        </Typography>
      </Typography>
    );

    return (
      <GetDocument>
        { getDocument => (
          <GetSafetyDataSheet id={id}>
            { sds => (
              <div className={classes.root}>
                <Popper
                  id={popperId}
                  open={open}
                  anchorEl={anchorEl}
                  placement="right"
                  disablePortal={false}
                  className={classes.popper}
                  modifiers={{
                    flip: {
                      enabled: true,
                    },
                    preventOverflow: {
                      enabled: true,
                      boundariesElement: 'scrollParent',
                    },
                    arrow: {
                      enabled: true,
                      element: arrowRef,
                    },
                  }}
                >
                  {<span className={classes.arrow} ref={this.handleArrowRef} />}
                  <Paper className={classes.info}>
                    {info[key]}
                  </Paper>
                </Popper>
                <Paper className={classes.paper}>
                  <Grid container spacing={8}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center">
                        <Grid item xs={9}>
                          <Typography variant="headline" color="primary" className={classes.header}>
                            Safety Data Sheet
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Button variant="contained"  component="span" color="primary" onClick={this.linkToDocument(getDocument, sds.document, 'safetyDataSheets')} fullWidth>
                            View Full SDS
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3}>
                              <ButtonBase onClick={this.getInfo('product_identifier')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                                    Product Identifiers
                                  </Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Typography variant="subheading">Name</Typography>
                            </TableCell>
                            <TableCell align="left">
                              { sds.compound.name ?
                                <Typography variant="subheading">{sds.compound.name}</Typography>
                                : <Typography variant="subheading" color="textSecondary"><i>No information available</i></Typography>
                              }
                            </TableCell>
                            <Hidden only={['sm', 'xs']}>
                              <TableCell rowSpan={4} style={{ border: '1px solid rgba(224, 224, 224, 1)'}}>
                                <StructureImage className={classes.structure} molblock={sds.compound.molblock} />
                              </TableCell>
                            </Hidden>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography variant="subheading">CAS No.</Typography>
                            </TableCell>
                            <TableCell align="left">
                              { sds.compound.cas ?
                                <Typography variant="subheading">{sds.compound.cas}</Typography>
                                : <Typography variant="subheading" color="textSecondary"><i>No information available</i></Typography>
                              }
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography variant="subheading">Compound ID</Typography>
                            </TableCell>
                            <TableCell align="left">
                              <Link to={`/chemistry/compounds/${sds.compound.id}#profile`}>
                                <Typography variant="subheading">{sds.compound.compound_id}</Typography>
                              </Link>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography variant="subheading">SDS Supplier</Typography>
                            </TableCell>
                            <TableCell align="left">
                              { sds.manufacturer ?
                                <Typography variant="subheading">{sds.manufacturer}</Typography>
                                : <Typography variant="subheading" color="textSecondary"><i>No information available</i></Typography>
                              }
                            </TableCell>
                          </TableRow>
                          <Hidden only={['md', 'lg']}>
                            <TableRow>
                              <TableCell colSpan={2} style={{ border: '1px solid rgba(224, 224, 224, 1)'}}>
                                <StructureImage className={classes.structure} molblock={sds.compound.molblock} />
                              </TableCell>
                            </TableRow>
                          </Hidden>
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <ButtonBase onClick={this.getInfo('label_element')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                                    GHS Label Elements
                                  </Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <ButtonBase onClick={this.getInfo('signal_word')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="subheading">Signal Word</Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                            <TableCell align="left">
                              { sds.signal_word ?
                                <Chip
                                  className={classes[sds.signal_word.toLowerCase()]}
                                  clickable={false}
                                  label={<Typography variant="button" color="inherit">{sds.signal_word}</Typography>}
                                />
                                : <Typography variant="subheading" color="textSecondary"><i>{ sds.sds_id ? 'No signal word' : 'No information available'}</i></Typography>
                              }
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <ButtonBase onClick={this.getInfo('pictogram')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="subheading">Pictogram(s)</Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                            <TableCell align="left">
                              { sds.pictograms.length ?
                                sds.pictograms.map(p=>(
                                  <ButtonBase key={p} onClick={this.getInfo(p)}>
                                    <Pictogram className={classes.pictogram} code={p} />
                                  </ButtonBase>
                                ))
                                : <Typography variant="subheading" color="textSecondary"><i>{ sds.sds_id ? 'None' : 'No information available'}</i></Typography>
                              }
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <ButtonBase onClick={this.getInfo('hazard_class')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                                    GHS Classification
                                  </Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          { sds.h_classes.length ?
                            sds.h_classes.map(h_class=> (
                              <TableRow key={h_class}>
                                <TableCell>
                                  <Typography variant="subheading">{h_class.replace(/\(chapter \d+.\d+\)/, '').trim()}</Typography>
                                </TableCell>
                              </TableRow>
                            ))
                            : <Typography variant="subheading" color="textSecondary"><i>{ sds.sds_id ? 'None' : 'No information available'}</i></Typography>
                          }
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <ButtonBase onClick={this.getInfo('hazard_statement')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                                    Hazard Statements
                                  </Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <Hidden only={['sm', 'xs']}>
                              <TableCell>
                                <Typography variant="subheading">Code</Typography>
                              </TableCell>
                            </Hidden>
                            <TableCell>
                              <Typography variant="subheading">Statement</Typography>
                            </TableCell>
                          </TableRow>
                          { sds.h_statements.length ?
                            sds.h_statements.map(h_statement => (
                              <TableRow key={h_statement.code}>
                                <Hidden only={['sm', 'xs']}>
                                  <TableCell style={{ padding: 0, paddingLeft: '16px' }}>
                                    <Chip
                                      className={classes[h_statement.type]}
                                      clickable={false}
                                      label={<Typography variant="button" color="inherit">{h_statement.code}</Typography>}
                                    />
                                  </TableCell>
                                </Hidden>
                                <TableCell>
                                  <Typography variant="subheading">{h_statement.statement}</Typography>
                                </TableCell>
                              </TableRow>
                            ))
                            : <Typography variant="subheading" color="textSecondary"><i>{ sds.sds_id ? 'None' : 'No information available'}</i></Typography>
                          }
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3}>
                              <ButtonBase onClick={this.getInfo('precautionary_statement')}>
                                <Tooltip title="Click for info" placement="right">
                                  <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                                    Precautionary Statements
                                  </Typography>
                                </Tooltip>
                              </ButtonBase>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <Hidden only={['sm', 'xs']}>
                              <TableCell>
                                <Typography variant="subheading">Code</Typography>
                              </TableCell>
                            </Hidden>
                            <TableCell>
                              <Typography variant="subheading">Statement</Typography>
                            </TableCell>
                          </TableRow>
                          { sds.p_statements.length ?
                            sds.p_statements.map(p_statement => (
                              <TableRow key={p_statement.code}>
                                <Hidden only={['sm', 'xs']}>
                                  <TableCell style={{ padding: 0, paddingLeft: '16px' }}>
                                    <Chip
                                      className={classes[p_statement.type]}
                                      clickable={false}
                                      style={{ margin: 'auto' }}
                                      label={<Typography variant="button" color="inherit">{p_statement.code}</Typography>}
                                    />
                                  </TableCell>
                                </Hidden>
                                <TableCell>
                                  <Typography variant="subheading">{p_statement.statement}</Typography>
                                  {
                                    p_statement.conditions.map(condition=>(
                                      <Typography key={condition} variant="body2" color="textSecondary">
                                        {condition}
                                      </Typography>
                                    ))
                                  }
                                </TableCell>
                              </TableRow>
                            ))
                            : <Typography variant="subheading" color="textSecondary"><i>{ sds.sds_id ? 'None' : 'No information available'}</i></Typography>
                          }
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12}>
                      <DeleteSafetyDataSheet>
                        { deleteSafetyDataSheet => (
                          <div style={{ textAlign: 'center' }}>
                            <Button variant="contained" onClick={() => deleteSafetyDataSheet(sds.id)} color="secondary" className={classes.delete}>
                              Delete Safety Data Sheet
                            </Button>
                          </div>
                        )}
                      </DeleteSafetyDataSheet>
                    </Grid>
                  </Grid>
                </Paper>
              </div>
            )}
          </GetSafetyDataSheet>
        )}
      </GetDocument>
    );
  }
}

SDSInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default withStyles(styles)(SDSInfo);
