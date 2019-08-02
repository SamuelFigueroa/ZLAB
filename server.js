import { host, port, mongoURI }  from './config';

import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import jwt_decode from 'jwt-decode';

import { ApolloServer, PubSub } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql/schema';
import startRfidServer from './rfid-server';
import startQueueWorker from './queue-worker';

import User from './models/User';

const pubsub = new PubSub();

const app = express();

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.set('view engine', 'pug');
app.get('/', (req, res) => {
  res.render('index');
});
app.use(express.static(path.join(__dirname, 'public')));

app.all( /^\/(?!graphql)(.*)\/?$/i, (req, res) => {
  res.render('index');
});

const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
  introspection: true,
  context: async ({ req, connection }) => {

    let context = { pubsub };
    if (connection)
      return { ...connection.context, pubsub };
    // get the user token from the headers
    const token = req.headers.authorization || '';

    if(token) {

      // try to retrieve a user with the token
      const { login } = jwt_decode(token);

      const getUser = async (login) => {
        let user = await User.findOne({ login }, 'login');
        return user;
      };

      let loggedUser = await getUser(login);

      context.user = loggedUser;

    }
    context.db_conn = mongoose.connection;
    return context;

  },
  // subscriptions: {
  // path: '/subscriptions',
  // onConnect: (connectionParams, webSocket, context) => {
  // ...
  // },
  // onOperation: (message, params, webSocket) => {
  // Manipulate and return the params, e.g.
  // params.context.randomId = uuid.v4();

  // Or specify a schema override
  // if (shouldOverrideSchema()) {
  //   params.schema = newSchema;
  // }

  // return params;
  // },
  // onOperationComplete: webSocket => {
  // ...
  // },
  // onDisconnect: (webSocket, context) => {
  // ...
  // },
  // },
});

server.applyMiddleware({ app }); // app is from an existing express app

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(port, host, () => {
  console.log(`🚀 Server ready at http://${host}:${port}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://${host}:${port}${server.subscriptionsPath}`);
});

fetch(`http://${host}:${port}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    operationName: '',
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
})
  .then(result => result.json())
  .then(result => {
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null,
    );
    result.data.__schema.types = filteredData;
    // Start RFID TCP server
    startRfidServer(result.data);
    startQueueWorker(result.data);
    fs.writeFile(path.join(__dirname, 'src', 'fragmentTypes.json'), JSON.stringify(result.data), err => {
      if (err) {
        console.error('Error writing fragmentTypes file', err);
      }
    });
  });
