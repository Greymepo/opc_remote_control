import fetch from 'node-fetch';
import { writeFile } from "fs";
import { promisify } from 'util';
const writeFilePromise = promisify(writeFile)


/**
 * Fetches the program code associated with this machine and rfid code form the db and saves it under [rfid].js
 */
async function requestProgram(deviceId, rfid){
	let params = new URLSearchParams();
	params.append('deviceId', deviceId);
	params.append('rfid', rfid);

	// const res = await fetch("https://digitaltwinservice.de/api/Database/GetProgram?" + params.toString(),
	// {
	// 	method: "GET",
	// })
	// .then(resp => resp.arrayBuffer())
	// .then(blob => {
	// 	writeFilePromise(`service resources/${rfid}.js`, Buffer.from(blob))
	// });

	let response = await fetch("https://digitaltwinservice.de/api/Database/GetProgram?" + params.toString(),
	{
		method: "GET",
	})
	response = await response.arrayBuffer();
	await writeFilePromise(`service resources/${rfid}.js`, Buffer.from(response));
	return `service resources/${rfid}.js`
};

// await requestProgram("test", 1);

function registerService(serviceID, machineID){
 // TODO
}

export { requestProgram, registerService }
