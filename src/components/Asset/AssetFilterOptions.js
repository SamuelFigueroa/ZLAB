import React from 'react';
import PropTypes from 'prop-types';
import GetLocations from '../queries/GetLocations';
import GetUsers from '../queries/GetUsers';
import GetAssetHints from '../queries/GetAssetHints';

const services = ['Install', 'Repair', 'Prev. Maintenance', 'Calibration', 'Decommission'];
const conditions = ['To Be Installed', 'Fully Operational', 'Maintenance Due', 'Needs Repair', 'Decommissioned'];

const AssetFilterOptions = (props) => {
  const { category } = props;
  return (
    <GetUsers>
      { users => (
        <GetLocations>
          { locations => (
            <GetAssetHints category={category}>
              { assetHints => {
                let options;
                if(category == 'Lab Equipment') {
                  options = {
                    'location':
                     locations.reduce( (acc, loc) => acc
                       .concat(loc.area.sub_areas
                         .map(sub_area => ({ label: `${loc.area.name} / ${sub_area.name}`, value: sub_area.id }))), []),
                    'condition': conditions.map(condition => ({ label: condition, value: condition })),
                    'registration_event.user': users.map(user => ({ label: user.name, value: user.login })),
                    'brand': assetHints.brand.map(brand => ({ label: brand, value: brand })),
                    'model': assetHints.model.map(model => ({ label: model, value: model })),
                    'purchasing_info.supplier': assetHints.purchasing_info.supplier.map(supplier => ({ label: supplier, value: supplier })),
                    'grant.grant_number': assetHints.grant.grant_number.map(number => ({ label: number, value: number })),
                    'grant.funding_agency': assetHints.grant.funding_agency.map(agency => ({ label: agency, value: agency })),
                    'grant.project_name': assetHints.grant.project_name.map(project => ({ label: project, value: project })),
                    'users': users.map(user => ({ label: user.name, value: user.id })),
                    'shared': [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
                    'training_required': [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
                    'maintenance_log.service': services.map(service => ({ label: service, value: service })),
                    'maintenance_log.agent': assetHints.maintenance_log.agent.map(agent => ({ label: agent, value: agent })),
                  };
                } else {
                  options = {
                    'registration_event.user': users.map(user => ({ label: user.name, value: user.login })),
                    'shared': [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
                    'purchase_log.supplier': assetHints.purchase_log.supplier.map(supplier => ({ label: supplier, value: supplier })),
                  };
                }
                return props.children(options);
              }}
            </GetAssetHints>
          )}
        </GetLocations>
      )}
    </GetUsers>
  );
};

AssetFilterOptions.propTypes = {
  children: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired
};

export default AssetFilterOptions;
