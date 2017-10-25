import gql from 'graphql-tag';

const crossingsQuery = gql`
  query allCrossings {
    allCrossings {
      nodes {
        id
        name
        description
        humanAddress
        latestStatusId
        statusUpdateByLatestStatusUpdateId {
          statusId
          statusReasonId
          statusDurationId
          createdAt
          notes
          userByCreatorId {
            firstName
            lastName
          }
        }
        communityCrossingsByCrossingId {
          nodes {
            communityByCommunityId {
              name
            }
          }
        }
      }
    }
  }
`;

export default crossingsQuery;