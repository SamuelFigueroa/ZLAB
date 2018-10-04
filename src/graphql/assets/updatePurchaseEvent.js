import gql from 'graphql-tag';

const UPDATE_PURCHASE_EVENT = gql`
  mutation updatePurchaseEvent($input: UpdatePurchaseEventInput!) {
    updatePurchaseEvent(input: $input)
  }
`;

export default UPDATE_PURCHASE_EVENT;
