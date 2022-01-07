(async () => {

	// deactive proprietary control on the PLC
	await Joining.writeNodes({
		nodeId: 'ns=3;s="OPCManualControl"',
		attributeId: node_opcua.AttributeIds.Value,
		value: {
			value: {
				dataType: node_opcua.DataType.Boolean,
				value: true
			}
		}
	})

	// activate and deactivate the actor 6 times with a pause of 5 seconds between each action
	let b = true;
	for (let i = 0; i < 6; i++) {
		await Joining.writeNodes({
			nodeId: 'ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."xSuctionCupDownwards"',
			attributeId: node_opcua.AttributeIds.Value,
			value: {
				value: {
					dataType: node_opcua.DataType.Boolean,
					value: b
				}
			}
		})
		await sleep(5000);
		b = !b;
	}

	// active proprietary control on the PLC
	await Joining.writeNodes({
		nodeId: 'ns=3;s="OPCManualControl"',
		value: {
			value: {
				dataType: node_opcua.DataType.Boolean,
				value: false
			}
		}
	})

	// mark this program as done
	processDone = true
})()
