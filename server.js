import { host, port, mongoURI }  from './config';

import User from './models/User';

import express from 'express';
import mongoose from 'mongoose';
// import passport from 'passport';
import jwt_decode from 'jwt-decode';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql/schema';
// import resolvers from './graphql/resolvers';
import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';


const app = express();

// passport middleware
// app.use(passport.initialize());

// passport config
// import passportConfig from './config/passport';
// passportConfig(passport);

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
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

//Secure graphql endpoint with passport
// app.post('/graphql', passport.authenticate('jwt', { session: false }));

app.listen(port, host, () => {
  console.info('Express listening on port', port);
});

const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
  introspection: true,
  context: async ({ req }) => {

    const context = {};
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
});

server.applyMiddleware({ app }); // app is from an existing express app

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
    fs.writeFile(path.join(__dirname, 'src', 'fragmentTypes.json'), JSON.stringify(result.data), err => {
      if (err) {
        console.error('Error writing fragmentTypes file', err);
      }
    });
  });
