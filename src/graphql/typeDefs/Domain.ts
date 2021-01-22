import { gql } from 'apollo-server-express'

export default gql`
  type Domain {
    id: String! # TODO is this mongo id or colonyaddress-ethdomainid?
    createdAt: GraphQLDateTime!
    colonyAddress: String!
    ethDomainId: Int!
    ethParentDomainId: Int
    name: String!
    parent: Domain
    tasks: [Task!]!
  }
`
