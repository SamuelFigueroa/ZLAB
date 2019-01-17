import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import Register from './Register';
import AssetRoutes from './Asset/AssetRoutes';
import ChemistryRoutes from './Chemistry/ChemistryRoutes';
import SafetyRoutes from './Safety/SafetyRoutes';
import PrinterRoutes from './Printer/PrinterRoutes';


const PrivateRoutes = ({ auth }) => {
  const { user } = auth;
  return (
    <Fragment>
      <AssetRoutes auth={auth} />
      <ChemistryRoutes auth={auth}/>
      <SafetyRoutes auth={auth} />
      <PrinterRoutes />
      {
        user.admin ? (
          <Route exact path="/register" component={Register} />
        ) : null
      }
    </Fragment>
  );
};
PrivateRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};
export default PrivateRoutes;
