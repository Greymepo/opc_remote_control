import fs from 'fs';
import { ThreeDOrientation } from 'node-opcua-types';
import { OPCClient, browseTree } from '../OPC Functions/OPC Client functions.js'


export class OPCHub {

	constructor(){
		this.devices = {};
	}

	/**
	 * add a device to the OPC Hub, need a unique ID and an endpoint
	 */
	async addDevice(id, endpoint){
		if (this.devices[id] == null) {
			try {
				console.log("adding device")
				const options = {
					applicationName: id,
					endpointMustExist: false,
					connectionStrategy: {
						initialDelay: 1000,
						maxRetry: 2
					}
				}

				this.devices[id] = {}
				// create OPC Client
				this.devices[id]['client'] = new OPCClient(endpoint, options)

				// connect to Device and build Session
				await this.devices[id]['client'].buildOPCSession();
				await this.readNodeTree(id)
				return id;
			} catch (e) {
				this.devices[id] = null;
				throw e
			}
		} else {
			return id;
		}
	}

	/**
	 * remove a device from this opc hub
	 */
	async removeDevice(id){
		if (this.devices[id] == null) return false
		try {
			this.devices[id]['client'].destroyOPCSession();
			this.devices[id] = null;
			return id
		} catch (e) {
			this.devices[id] = null;
			return false
		}
	}

	async readNodeTree(id) {
		if (false && fs.existsSync(`node_trees/${id}.json`)){
			return true;
		} else {
			let node_tree = {}
			await browseTree(this.devices[id].client, { nodeId: 84 }, node_tree);
			fs.writeFile(`node_trees/${this.devices[id].client.options.applicationName}.json`, JSON.stringify(node_tree, null, "\t"), (err) => {
				if (err) {
					throw err;
				}
				console.log(`JSON data for ${id} is saved.`);
			})
			return true;
		}
	}

}
