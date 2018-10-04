import gql from 'graphql-tag';

const ADD_PURCHASE_EVENT = gql`
  mutation addPurchaseEvent($input: AddPurchaseEventInput!) {
    addPurchaseEvent(input: $input)
  }
`;

export default ADD_PURCHASE_EVENT;
