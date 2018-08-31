import { ApolloProvider } from 'react-apollo';
import React, {Component, Fragment} from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import client from '../client';
import Layout from './Layout';
import PrivateRoutes from './PrivateRoutes';
import Landing from './Landing';
import Login from './Login';
import SetCurrentUser from './mutations/SetCurrentUser';

class App extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }
  render() {

    return (
      <ApolloProvider client={client}>
        <Router>
          <Fragment>
            <CssBaseline />
            <SetCurrentUser>
              <Layout>
                <Route exact path="/" component={Landing} />
                <Route exact path="/login" component={Login} />
                <PrivateRoutes />
              </Layout>
            </SetCurrentUser>
          </Fragment>
        </Router>
      </ApolloProvider>
    );
  }
}

App.propTypes = {
};

export default App;
