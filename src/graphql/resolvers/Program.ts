import { ApolloContext } from '../apolloTypes'
import { ProgramResolvers } from '../types'

export const Program: ProgramResolvers<ApolloContext> = {
  async levels({ levelIds }, input, { dataSources: { data } }) {
    return data.getLevelsById(levelIds)
  },
  async submissions({ id }, input, { dataSources: { data } }) {
    return data.getProgramSubmissions(id)
  },
}
