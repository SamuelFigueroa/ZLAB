import gql from 'graphql-tag';

const clientResolvers = {
  Mutation: {
    setCurrentUser: (_, args, { cache }) => {
      const { payload } = args;
      const query = gql`
        {
            auth @client {
              user {
                exp
                iat
                login
                name
                email
                admin
              }
              isAuthenticated
          }
        }`;
      const { auth } = cache.readQuery({ query });
      if (Object.keys(payload).length === 0) {
        Object.assign(auth.user,
          {
            exp: null,
            iat: null,
            login: null,
            name: null,
            email: null,
            admin: false
          });
      } else {
        Object.assign(auth.user, payload);
      }
      Object.assign(auth, { isAuthenticated: (Object.keys(payload).length !== 0) });
      const data = { auth };
      cache.writeQuery({ query, data });
      return null;
    },
    setErrors: (_, args, { cache }) => {
      const { errors } = args;
      const query = gql`
        {
            errors @client {
              key
              message
          }
        }`;
      cache.writeQuery({ query, data: { errors }});
      return null;
    }
  }
};

export default clientResolvers;
