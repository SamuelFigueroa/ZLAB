import { host, port, mongoURI }  from './config';

import User from './models/User';

import express from 'express';
import mongoose from 'mongoose';
// import passport from 'passport';
import jwt_decode from 'jwt-decode';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';


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
app.use(express.static('public'));

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
  context: async ({ req }) => {

    const context = {};
    // get the user token from the headers
    const token = req.headers.authorization || '';

    if(token) {

      // try to retrieve a user with the token
      const { login } = jwt_decode(token);

      const getUser = async (login) => {
        let user = await User.findOne({ login }, 'login');
        return {user};
      };

      let loggedUser = await getUser(login);

      context.user = loggedUser;

    }
    context.db_conn = mongoose.connection;
    return context;

  },
});

server.applyMiddleware({ app }); // app is from an existing express app
