import { config } from 'dotenv'
import express from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import { getChallenge, verifyEthSignature } from 'etherpass'
import { getAddress } from 'ethers/utils'
import { createServer } from 'http'

config()

import { createApolloServer, createSubscriptionServer } from './graphql'
import { getTokenForAddress } from './auth'
import { connect } from './db/connect'
import { provider } from './network/provider'
import { isDevelopment } from './env'

const startServer = async () => {
  const { db } = await connect()
  const apolloServer = createApolloServer(db, provider)

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
      typeof req.body.signature !== 'string'
    ) {
      throw new Error('Invalid challenge/signature')
    }
    const address = verifyEthSignature(req.body.challenge, req.body.signature)
    const token = getTokenForAddress(address)
    return res.json({ token, address })
  })

  app.get('/liveness', (req, res) => res.sendStatus(200))

  apolloServer.applyMiddleware({ app })
  const websocketServer = createServer(app)

  websocketServer.listen(port, () => {
    createSubscriptionServer(websocketServer, apolloServer.graphqlPath)
    console.log(`Started on port ${port}`)
    if (isDevelopment) {
      console.log(
        `GraphQL at http://localhost:${port}${apolloServer.graphqlPath}`,
      )
      console.log(
        `Subscriptions at ws://localhost:${port}${apolloServer.graphqlPath}`,
      )
    }
  })
}

startServer()
  .then(() => console.info('Server started successfully'))
  .catch((error) => console.error(error))
