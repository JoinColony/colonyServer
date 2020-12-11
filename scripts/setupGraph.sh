mkdir -p ./data/ipfs
mkdir -p ./data/postgres
if ! grep 'user: "$UID"' ./docker-compose.yml; then
    sed -i.bak 's/  postgres:/  postgres:\n    user: "$UID"/g' ./docker-compose.yml
    sed -i.bak "s/  graph-node:/  graph-node:\n    extra_hosts:\n      - \"host.docker.internal:$(hostname -I | awk '{print $1}')\"/" ./docker-compose.yml
fi
if ! grep '-h 0.0.0.0' ./../../colonyNetwork/scripts/start-blockchain-client.sh; then
    sed -i.bak 's/ganache-cli/ganache-cli -h 0.0.0.0/g' ./../../colonyNetwork/scripts/start-blockchain-client.sh
fi
