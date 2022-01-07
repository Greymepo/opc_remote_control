import fetch from 'node-fetch';
import { writeFile, readFileSync } from "fs";
import { promisify } from 'util';
const writeFilePromise = promisify(writeFile)


/**
 * Fetches the program code associated with this machine and rfid code form the db and saves it under [rfid].js
 */
async function requestProgram(deviceId, rfid){
	let params = new URLSearchParams();
	params.append('deviceId', deviceId);
	params.append('rfid', rfid);

	let response = await fetch("https://digitaltwinservice.de/api/Database/GetProgram?" + params.toString(),
	{
		method: "GET",
	})
	response = await response.arrayBuffer();
	await writeFilePromise(`service resources/${rfid}.js`, Buffer.from(response));
	return `service resources/${rfid}.js`
};

async function uploadProgram(deviceId, rfid, path){
	let params = new URLSearchParams();
	params.append('deviceId', deviceId);
	params.append('rfid', rfid);
	let content = readFileSync(path, { encoding: "UTF-8" })
	console.log(JSON.stringify(JSON.stringify(content)))

	let response = await fetch("https://digitaltwinservice.de/api/Database/UploadProgram?deviceId=MPS_System_403_1&rfid=120",
	{
		headers: {
			'X-API-KEY': "2b56f658-b11f-4067-9537-631bf27a30f0",
			'accept': '/',
			"Content-type": "application/json"
		},
		body: `${JSON.stringify(JSON.stringify(content))}`,
		method: "POST"
	});
	console.log(response)
};

// await requestProgram("test", 1);

function registerService(serviceID, machineID){
 // TODO
}


export { requestProgram, registerService, uploadProgram }
