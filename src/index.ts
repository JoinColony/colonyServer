import * as express from 'express'
import { json } from 'body-parser'
import { readFileSync } from 'fs'
import * as cors from 'cors'
import { getChallenge, verifyEthSignature } from 'etherpass'

import { server as apolloServer } from './graphql'
import { getTokenForAddress } from './auth'

const app = express()
const port = 3000

app.use(cors())
app.use(json())

app.post('/auth/challenge', (req, res) => {
  console.log(req.body)
  // TODO: validation
  const challenge = getChallenge(req.body.address)
  return res.json({ challenge })
})

app.post('/auth/token', (req, res) => {
  // TODO: validation
  const address = verifyEthSignature(req.body.challenge, req.body.signature)
  const token = getTokenForAddress(address)
  return res.json({ token, address })
})

apolloServer.applyMiddleware({ app })

app.listen(port, () => {
  console.log(`Started on port ${port}`)
  console.log(`GraphQL at http://localhost:${port}${apolloServer.graphqlPath}`)
})
