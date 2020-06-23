mkdir -p ./data/ipfs
mkdir -p ./data/postgres
if ! grep 'user: "$UID"' ./docker-compose.yml; then
    sed -i.bak 's/  postgres:/  postgres:\n    user: "$UID"/g' ./docker-compose.yml
fi
