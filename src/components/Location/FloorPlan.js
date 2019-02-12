import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Tooltip from '@material-ui/core/Tooltip';

import isbc2 from '../../img/facilities/isbc2.svg';
import open_lab from '../../img/facilities/open_lab.svg';
import computational from '../../img/facilities/computational.svg';
import tissue_culture from '../../img/facilities/tissue_culture.svg';
import equipment from '../../img/facilities/equipment.svg';
import support1 from '../../img/facilities/support1.svg';
import support2 from '../../img/facilities/support2.svg';
import corridor from '../../img/facilities/corridor.svg';
import chemical_stockroom from '../../img/facilities/chemical_stockroom.svg';

const floorPlans = {
  'isbc2': { alt: 'ISB, Tower C, Level 2', src: isbc2 },
  'open_lab': { alt: 'Open Lab', src: open_lab },
  'computational': { alt: 'Computational Room', src: computational },
  'tissue_culture': { alt: 'Tissue Culture Room', src: tissue_culture },
  'equipment': { alt: 'Linear Equipment Room East', src: equipment },
  'support1': { alt: 'Lab Support 1', src: support1 },
  'support2': { alt: 'Lab Support 2', src: support2 },
  'corridor': { alt: 'Research Corridor', src: corridor },
  'chemical_stockroom': { alt: 'Chemical Stockroom', src: chemical_stockroom },
};

const styles = theme => ({
  areas: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.body2.fontSize,
  }
});

class FloorPlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      top: 0,
      left: 0,
      tooltip: '',
      className: '',
    };

    this.setTooltip = this.setTooltip.bind(this);
  }

  setTooltip = (element, tooltip, className) => {
    element.onmouseover = event => {
      const reference = this.reference.getBoundingClientRect();
      const { currentTarget } = event;
      const rect = currentTarget.getBoundingClientRect();
      const left = `${reference.x + rect.x + rect.width/2 + window.scrollX}px`;
      const top = `${reference.y + rect.y + window.scrollY}px`;
      this.setState({ tooltip, top, left, open: true, className });
    };
    element.onmouseout = () => this.setState({ open: false });
  }

  componentDidMount() {
    const obj = this.reference;
    let svgDoc;
    obj.addEventListener('load', () => {
      svgDoc = obj.contentDocument;
      if(svgDoc.getElementById('safety')) {
        for (const child of svgDoc.getElementById('safety').children) {
          const iconGroup = child.children;
          const tooltip = child.getAttribute('inkscape:label');
          for (const icon of iconGroup) {
            this.setTooltip(icon, tooltip, '');
          }
        }
      }
      if(svgDoc.getElementById('areas')) {
        for (const child of svgDoc.getElementById('areas').children) {
          const tooltip = child.getAttribute('inkscape:label');
          this.setTooltip(child, tooltip, 'areas');
        }
      }
      if(svgDoc.getElementById('layouts')) {
        for (const child of svgDoc.getElementById('layouts').children) {
          child.onclick=()=>this.props.handleAreaClick(child.id);
          const tooltip = child.getAttribute('inkscape:label');
          this.setTooltip(child, tooltip, 'areas');
        }
      }
    }, false);
  }
  render () {
    const { name, classes } = this.props;
    const { open, tooltip, left, top, className } = this.state;
    return (
      <div>
        <Tooltip title={tooltip} classes={{ tooltip: classes[className] }} placement="top" open={open}>
          <div ref={el=>this.anchorEl=el} style={{ position: 'absolute', left, top }}>
          </div>
        </Tooltip>
        <object ref={el=>this.reference=el} className={this.props.className} type="image/svg+xml" data={floorPlans[name].src}>{floorPlans[name].alt}</object>
      </div>
    );
  }
}

FloorPlan.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  handleAreaClick: PropTypes.func.isRequired,
  className:PropTypes.string
};

export default withStyles(styles)(FloorPlan);
