import { config } from 'dotenv'
import express from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import { getChallenge, verifyEthSignature } from 'etherpass'
import { getAddress } from 'ethers/utils'

config()

import { createApolloServer } from './graphql'
import { getTokenForAddress } from './auth'

import { connect } from './db/connect'
import { provider } from './network/provider'


const startServer = async () => {
  const { db } = await connect()
  const apolloServer = await createApolloServer(db, provider)

  const app = express()
  const port = process.env.APOLLO_PORT

  app.use(cors())
  app.use(json())

  app.post('/auth/challenge', (req, res) => {
    const address = getAddress(req.body.address)
    const challenge = getChallenge(address)
    return res.json({ challenge })
  })

  app.post('/auth/token', (req, res) => {
    if (
      typeof req.body.challenge !== 'string' ||
      req.body.signature !== 'string'
    ) {
      throw new Error('Invalid challenge/signature')
    }
    const address = verifyEthSignature(req.body.challenge, req.body.signature)
    const token = getTokenForAddress(address)
    return res.json({ token, address })
  })

  apolloServer.applyMiddleware({ app })

  app.listen(port, () => {
    console.log(`Started on port ${port}`)
    console.log(
      `GraphQL at http://localhost:${port}${apolloServer.graphqlPath}`,
    )
  })
}

startServer()
  .then(() => console.info('Server started successfully'))
  .catch(error => console.error(error))
