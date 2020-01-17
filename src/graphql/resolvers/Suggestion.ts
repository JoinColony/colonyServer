import { ApolloContext } from '../apolloTypes'
import { SuggestionResolvers } from '../types'

export const Suggestion: SuggestionResolvers<ApolloContext> = {
  async creator({ creatorAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(creatorAddress)
  },
}
