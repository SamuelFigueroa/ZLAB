import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';

import GetPrinterHubs from '../queries/GetPrinterHubs';
import GetPrinter from '../queries/GetPrinter';
import GetPrinterFormat from '../queries/GetPrinterFormat';

import HubConnection from './HubConnection';
import HubTabs from './HubTabs';
import FormatEditor from './FormatEditor';

const PrinterRoutes = () => {
  return (
    <GetPrinter>
      {
        getPrinter => (
          <GetPrinterHubs>
            { hubs => hubs.map( hub =>
              <HubConnection
                key={hub.id}
                actions={{
                  getPrinter
                }}
                name={hub.name}
                address={hub.address}
              >
                { hubProps => {
                  const { connection, printers } = hubProps;
                  return (
                    <Fragment>
                      <Route exact path={`/printers/${hub.name}`} render={({ location })=><HubTabs hubProps={hubProps} tabID={location.hash.slice(1)}/>} />
                      <Switch>
                        <Route exact path={`/printers/${hub.name}/formats/new`} render={()=>{
                          return <FormatEditor printers={printers} hubConnection={connection} />;
                        }} />
                        <Route exact path={`/printers/${hub.name}/formats/:id`} render={({ match }) => (
                          <GetPrinterFormat id={match.params.id}>
                            { format =>  <FormatEditor printers={printers} hubConnection={connection} format={format}/> }
                          </GetPrinterFormat>
                        )}/>
                      </Switch>
                    </Fragment>
                  );
                }}
              </HubConnection>
            )}
          </GetPrinterHubs>
        )}
    </GetPrinter>
  );
};

export default PrinterRoutes;
