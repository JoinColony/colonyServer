import { ApolloContext } from '../apolloTypes'
import { PersistentTaskResolvers } from '../types'

export const PersistentTask: PersistentTaskResolvers<ApolloContext> = {
  async submissions({ id }, input, { dataSources: { data } }) {
    return data.getTaskSubmissions(id)
  },
}
