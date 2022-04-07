import { Client } from 'faunadb'

export default (() => {
  const domain = process.env.FAUNA_DOMAIN || 'db.eu.fauna.com'
  console.log(`Connected to Fauna Domain '${domain}'`)
  return new Client({
    secret: process.env.FAUNA_SECRET || 'no-fauna-secret',
    domain,
  })
})()
