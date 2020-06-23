var os = require('os');
const { exec } = require("child_process");

if (os.platform() === 'linux'){
	console.log("Looks like we're running on Linux, we have to modify the docker-compose.yml to work")
	exec('cd ./lib/graph-node/docker && git checkout docker-compose.yml && bash ./setup.sh');
}
exec('cd ./lib/graph-node/docker && bash ../../../scripts/setupGraph.sh')


