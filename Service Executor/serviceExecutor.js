import { OPCClient } from '../OPC Functions/OPC Client functions.js'
import * as node_opcua from "node-opcua"
import { OPCHub } from '../OPC Hub/hub.js';
import { requestProgram } from '../Web Client/client.js';
import fs from 'fs';

let processDone = true;

export class ServiceExecutor{

	constructor(serviceId, opchub, server){
		this.queue = [];
		this.serviceId = serviceId;
		this.opchub = opchub;
		this.#initDevicesAsVariables();
		this.executeServices();

		server.on('message', message => {
			let msg = JSON.parse(message)
			if (msg.action == "queueProgram") {
				let content = fs.readFileSync(`./service resources/${msg.content.program}`, { encoding: "UTF-8" })
				this.pushInQueue(content)
				server.send("program has been queued and waits in place " + this.queue.length)
				console.log(this.queue.length)
			} else if (msg.action == "queueSize")  {
				server.send(this.queue.length.toString)
			}
		});
	}

	pushInQueue(file){
		this.queue.push(file)
	}

	shiftFromQueue(){
		return this.queue.shift();
	}

	#initDevicesAsVariables(){
		Object.keys(this.opchub.devices).forEach((key) => {
			global[key] = this.opchub.devices[key].client;
		})
	}

	/**
	 * executeServices evaluates and executes a queue of programs. The Program Execution is asynchronous, which prevents us from blocking this process.
	 * As Consequence, as we also cannot wait for a eval function, we have to check periodically if the process has finished.
	 * The program counts as finished, when it called the function to set processDone
	 */
	async executeServices(){
		const self = this;

		// declare a local function, accessible only to this function
		async function executeQueue() {
			// set a asynchronous timeout function, that calls itself every few seconds, which results in a loop
			setTimeout(await async function () {
				// start a program if there is one and no other process runs at the moment
				if (self.queue.length > 0 && processDone){
					processDone = false;
					const program = self.shiftFromQueue();
					eval(program)
				}
				await timeout();
			}, 5000);
		}

		// start the function
		await executeQueue();
	}

	fetchCallback(){
		let self = this
		return (rfid) => { self.fetchProgram(rfid) }
	}

	fetchProgram(rfid) {
		const self = this
		requestProgram(this.serviceId, rfid).then(
			path => {
				let content = fs.readFileSync("./service resources/dance_for_115.js", { encoding: "UTF-8" }) //remember to replace path again
				self.pushInQueue(content)

				// let content = fs.readFileSync(path, { encoding: "UTF-8" }) //remember to replace path again
				// self.pushInQueue(content)

				content = fs.readFileSync("./service resources/1.js", { encoding: "UTF-8" })
				self.pushInQueue(content)
			}
		)
	}
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
