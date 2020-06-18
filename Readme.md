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


# The Graph
cd lib/subgraph
npm install
cd ../lib/graph-node
npm install
cd ..
# If it is a fresh install, you do not need to input your sudo password at the end of the next script and can cancel.
# Otherwise you do need to input your password, or run the command it's going to run manually (see the output of the script)
npm run thegraph:reset
npm run thegraph:start
# This brings up a local version of the graph, but also outputs some useful URLs for development so take a look at those.
# In another window
cd lib/subgraph
npm run codegen
npm run create-local
npm run deploy-local
# If you update the graph, you need to run the codegen and the deploy-local step again, and the graph will update
```
