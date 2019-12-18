# colonyServer

GraphQL-powered metadata server for colonies, with on-chain authentication via the [Colony Network](https://github.com/JoinColony/colonyNetwork).


## Prerequisites

* `mongod` >=3.6
* `solc` >=0.5.8  (we recommend via Docker)


## Setup

```bash
# Set up colonyNetwork submodule
git submodule update --init --recursive
cd lib/colonyNetwork
npm install
npm run provision:token:contracts
cd ../..

# Copy .env.example (make changes where appropriate)
cp .env.example .env

# Set up colonyServer, create the database and start the server
npm install
# If necessary, start mongod:
# npm run db:start
npm run db:setup
npm run dev

# For authentication, compile and migrate colonyNetwork contracts
cd lib/colonyNetwork
npm run start:blockchain:client
npx truffle migrate --reset --compile-all
```
