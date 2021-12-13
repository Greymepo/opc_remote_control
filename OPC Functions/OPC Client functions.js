import * as node_opcua from "node-opcua"
import { BrowseNextRequest } from "node-opcua";
import fs from 'fs';

function ConnectionException(message) {
	this.message = message;
	this.name = "ConnectionException";
}

function SessionException(message) {
	this.message = message;
	this.name = "SessionException";
}

const opc_basic_datatypes = [
    "Null",
    "Boolean",
    "SByte",
    "Byte",
    "Int16",
    "UInt16",
    "Int32",
    "UInt32",
    "Int64",
    "UInt64",
    "Float",
    "Double",
    "String",
    "DateTime",
    "Guid",
    "ByteString",
    "XmlElement",
    "NodeId",
    "ExpandedNodeId",
    "StatusCode",
    "QualifiedName",
    "LocalizedText",
    "ExtensionObject",
    "DataValue",
    "Variant",
    "DiagnosticInfo"
]

class OPCClient {

	constructor(endpointURL, options) {
		this.endpointURL = endpointURL
		this.options = options
		this.client = null
		this.session = null
		this.subscription = null
	};



	/**
	 * read multiple Nodes at once
	 * params @node: a descriptions of what to read, a desription consists either of
	 * - a NodeId and an attributeId, where the attributeId is defaulted to 'value' if omitted
	 * - an array objects having NodeIds and attributeIds
	 * node = {
			nodeId: some_node_id,
			attributeId: node_opcua.AttributeIds.Value
		};
	 * return: the nodes, either a single node or an array, depending on the functions input
	 */
	async readNodes(nodes, callback = null){
		const maxAge = 0;
		try {
			if (callback == null) return await this.session.read(nodes, maxAge);
			else await this.session.read(nodes, maxAge, callback);
		} catch (e) {
			throw new SessionException(e)
		}
	}

	/**
	 * write multiple Nodes at once
	 * params @node: a descriptions of what to write, a desription consists either of
	 * - a NodeId and an attributeId, where the attributeId is defaulted to 'value' if omitted
	 * - an array objects having NodeIds and attributeIds
	 * node = {
			nodeId: some_node_id,
			attributeId: node_opcua.AttributeIds.Value
		};
	 * return: the nodes, either a single node or an array, depending on the functions input
	 */
	async writeNodes(nodes){
		try {
			console.log("writing!")
			await this.session.write(nodes);
		} catch (e) {
			throw new SessionException(e)
		}
	}

	async browseNode(node, callback = null){
		try {
			if (callback == null) return await this.session.browse(node);
			else await this.session.browse(node, callback);
		} catch (e) {
			throw new SessionException(e)
		}
	}

	async browseNext(continuationPoint, callback = null){
		try {
			if (callback == null) return await this.session.browseNext(continuationPoint, false);
			else await this.session.browseNext(continuationPoint, false, callback);
		} catch (e) {
			throw new SessionException(e)
		}
	}

	async buildOPCSession(){
		this.opcua_client = node_opcua.OPCUAClient.create(this.options);

		//Step 1: connect to OPC Server
		try {
			let applicationName = this.options.applicationName
			this.opcua_client.on("start_reconnection", function() {
				console.log(`... start_reconnection to ${applicationName}`)
			});

			this.opcua_client.on("after_reconnection", function() {
				console.log(`... successfully reconnected to ${applicationName}`)
			});

			this.opcua_client.on("timed_out_request", function() {
				console.log(`... request timed out to ${applicationName}`)
			});


			this.opcua_client.on("backoff", function(nb, delay) {
				console.log("  connection to", applicationName ,"failed for the", nb, " time ... We will retry in ", delay, " ms");
			});

			console.log(`... connecting to ${applicationName}`)
			await this.opcua_client.connect(this.endpointURL);
			console.log(`... connected to ${applicationName}`)
		} catch (e) {
			console.log("establishing connection failed")
			throw new ConnectionException(e)
		}

		//step 2 : create OPC Session after Connection was established
		try {
			console.log("creating session!");
			this.session = await this.opcua_client.createSession();
			console.log("session created!");
			return this.session
		} catch (e) {
			throw new SessionException(e)
		}
	}

	async destroyOPCSession(){
		// close session
		await this.session.close();

		// disconnecting
		await this.opcua_client.disconnect();
		console.log("done !");
	}

	/**
	 * install a subscription for node nodeId
	 */
	async installSubscription(nodeId, callback = () => {}){
		// first, we have to initialize a Subscription Object that handles the overall subscription service
		if (this.subscription == null) {
			await this.#initSubscription();
		}

		// now we set the NodeMonitor for one of the Nodes
		const monitoredItem = await this.#initNodeMonitor(nodeId);

		// if the subscribed value changes, update the subscription monitor
		monitoredItem.on("changed", (dataValue) => {
			callback(dataValue);
		});
	}

	/**
	 * Initialize this clients subscription object, that handles all subscriptions
	 */
	async #initSubscription() {
		// init subscription
		this.subscription = await node_opcua.ClientSubscription.create(this.session, {
			requestedPublishingInterval: 500,
			requestedLifetimeCount:      100,
			requestedMaxKeepAliveCount:   10,
			maxNotificationsPerPublish:  100,
			publishingEnabled: true,
			priority: 10
		});

		// set subscription callbacks
		let self = this
		this.subscription.on("started", function() {
			console.log("subscription started, subscriptionId=", self.subscription.subscriptionId);
		}).on("terminated", function() {
		   console.log("subscription terminated, subscriptionId=", self.subscription.subscriptionId);
		});
	}

	/**
	 * install a Node monitor
	 */
	async #initNodeMonitor(nodeId){

		const itemToMonitor = {
			nodeId: nodeId,
			// attributeId: node_opcua.AttributeIds.Value
		};

		const parameters = {
			samplingInterval: 100,
			discardOldest: true,
			queueSize: 10
		};

		const monitoredItem  = await node_opcua.ClientMonitoredItem.create(
			this.subscription,
			itemToMonitor,
			parameters,
			node_opcua.TimestampsToReturn.Both
		);
		return monitoredItem
	}
}

const options = {
	applicationName: "distribute",
	endpointMustExist: false,
	connectionStrategy: {
		initialDelay: 1000,
		maxRetry: 2
	},
	reconnectOnFailure: true
}

const client = new OPCClient("opc.tcp://192.168.1.10:4840", options)

const nodeRead={
	nodeId: 'ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"',
	// attributeId: node_opcua.AttributeIds.DataType
}

const nodeWrite= {
	nodeId: 'ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"',
	attributeId: node_opcua.AttributeIds.Value,
	value: {
		value: {
			dataType: node_opcua.DataType.Int16,
			value: 2
		}
	}
}

// await client.buildOPCSession();
// // await client.writeNodes(nodeWrite)
// // const plc = await client.browseNode("RootFolder", (err, result) => { console.log(result)} )
// // let plc = await client.browseNode("RootFolder")
// // let plc = await client.browseNode( {nodeId: 'ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"'})
// //  let plc = await client.readNodes(nodeRead)
// //  console.log(plc.value.dataType)
// // console.log(opc_basic_datatypes[plc.value.value])

// let node_tree = {};
// await browseTree(client, { nodeId: 84 }, node_tree)
// fs.writeFile(`../node_trees/${client.options.applicationName}.json`, JSON.stringify(node_tree), (err) => {
//     if (err) {
//         throw err;
//     }
// 	console.log("JSON data is saved.");
// })

// // const n = await client.readNodes(nodeRead, (err, data) => { console.log( data )})
// // await client.installSubscription('ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"', (dataValue) => {
// // 	console.log(dataValue)
// // });

// await client.destroyOPCSession()




async function browseTree(client, node, tree, depth = 100){

	if (depth == 0) return;

	try {
		const nodeClass = await client.readNodes({
			nodeId: node.nodeId,
			attributeId: node_opcua.AttributeIds.NodeClass
		});

		const displayName = await client.readNodes({
			nodeId: node.nodeId,
			attributeId: node_opcua.AttributeIds.DisplayName
		});


		if ( nodeClass.value.value == node_opcua.NodeClass.Object ) {
			tree["displayName"] = displayName.value.value.text

			tree["references"] = []

			const browsedNode = await client.browseNode(node)
			const organzies = await client.browseNext(browsedNode.continuationPoint)
			let references = browsedNode.references.concat(organzies.references)
			let j = 0;
			for (let i = 0; i < references.length; i++){
				tree.references[j] = {}
				await browseTree(client, references[i], tree.references[j], depth - 1)
				if ( Object.keys(tree.references[j]).length === 0){
					tree.references.splice(j, 1);
					j--
				}
				j++
			}
		} else if ( nodeClass.value.value == node_opcua.NodeClass.Variable ) {

			const data = await client.readNodes({
				nodeId: node.nodeId
			});
			tree["displayName"] = displayName.value.value.text
			tree["dataType"] = opc_basic_datatypes[data.value.dataType]
			tree["nodeId"] = node.nodeId
		} else {
			tree = null
		}
	} catch (e) {
		console.log(e)
	}
}

export { OPCClient, browseTree }
