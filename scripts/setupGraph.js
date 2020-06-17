var os = require('os');
const { exec } = require("child_process");

if (os.platform() === 'linux'){
	console.log("Looks like we're running on Linux, we have to modify the docker-compose.yml to work")
	exec('cd ./lib/graph-node/docker && git checkout docker-compose.yml && bash ./setup.sh');
}

exec('cd ./lib/colonyNetwork && sed -i "s/ganache-cli --acctKeys=/ganache-cli -h 0\.0\.0\.0 --acctKeys=/g" ./scripts/start-blockchain-client.sh');
console.log("I'm now about to ask for sudo permissions. This is because of docker volume UID/GUI issues. If you wish to do this not inside a script (and I don't blame you) then you can cancel this script now (this is the last thing it does) and run")
console.log("rm -r ./lib/graph-node/docker/data")
console.log("from the root of this repository (i.e. colonyServer)")
exec('sudo rm -r ./lib/graph-node/docker/data');


