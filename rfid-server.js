import net from  'net';
import fetch from 'node-fetch';
import gql from 'graphql-tag';

import { host, port, rfidPort } from './config';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const INVENTORIZE_CONTAINER = gql`
   mutation inventorizeContainer($barcode: String!) {
    inventorizeContainer(barcode: $barcode)
  }
`;

const INVENTORIZE_EQUIPMENT= gql`
   mutation inventorizeEquipment($barcode: String!) {
    inventorizeEquipment(barcode: $barcode)
  }
`;

export default introspectionQueryResultData => {
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  });
  const cache = new InMemoryCache({ fragmentMatcher });
  const link = new HttpLink({ uri: `http://${host}:${port}/graphql`, fetch });
  const client = new ApolloClient({
    link,
    cache
  });
  const inventorizeContainer = async barcode => await client.mutate({ mutation: INVENTORIZE_CONTAINER, variables: { barcode }});
  const inventorizeEquipment = async barcode => await client.mutate({ mutation: INVENTORIZE_EQUIPMENT, variables: { barcode }});

  const tcpServer = net.createServer();
  tcpServer.on('connection', socket => {
    socket.on('data', data => {
      socket.write(data);
      // console.log('Received data: ' + data);
      inventorizeContainer(Buffer.from(data.toString('utf8'), 'hex').toString('utf8').replace(/\0/g, ''));
      inventorizeEquipment(Buffer.from(data.toString('utf8'), 'hex').toString('utf8').replace(/\0/g, ''));
    });
  });
  // tcpServer.on('error', err => {
  //   console.log(err);
  // });
  tcpServer.listen(rfidPort, host, () => {
    console.log('Server listening to ', tcpServer.address());
  });
};
