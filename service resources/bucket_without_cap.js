(async () => {


	// ##########################################################################
	// #					Preparation											#
	// ##########################################################################

	// deactive proprietary control on the PLC
	await Distributing.writeNodes(
		[
			{
				nodeId: 'ns=3;s="OPCManualControl"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: true
					}
				}
			},
			{
				nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."Reset"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: true
					}
				}
			}
		]
	)

	// deactive proprietary control on the PLC
	await Joining.writeNodes(
		[
			{
				nodeId: 'ns=3;s="OPCManualControl"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: true
					}
				}
			},
			{
				nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."Reset"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: true
					}
				}
			}
		]
	)

	// deactive proprietary control on the PLC
	await Sorting.writeNodes(
		[
			{
				nodeId: 'ns=3;s="OPCManualControl"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: true
					}
				}
			},
			{
				nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."Reset"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: true
					}
				}
			}
		]
	)

	// ##########################################################################
	// #					Process												#
	// ##########################################################################

	await sleep(1000)

	// extend slide 0
	await Distributing.writeNodes({
		nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xExtendSlide0"',
		attributeId: node_opcua.AttributeIds.Value,
		value: {
			value: {
				dataType: node_opcua.DataType.Boolean,
				value: true
			}
		}
	})

	// wait 2 seconds
	await sleep(2000);

	// retract slide 0
	await Distributing.writeNodes({
		nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xExtendSlide0"',
		attributeId: node_opcua.AttributeIds.Value,
		value: {
			value: {
				dataType: node_opcua.DataType.Boolean,
				value: false
			}
		}
	})

	// print rfid code, when sensed
	await Distributing.installSubscription('ns=3;s="RFID_IN_2"', async function(dataValue){
		console.log(JSON.stringify(dataValue))
	})

	// deactivate Conveyor, if the sensor at the end is activated
	await Distributing.installSubscription('ns=3;s="G1BG3"', async function(dataValue){
		console.log(dataValue)

		await sleep(2000)

		if (!dataValue) {
			// deactivate Conveyor
			await Distributing.writeNodes({
				nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForward"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: false
					}
				}
			})
		}
	})

	// wait 1 seconds
	await sleep(1000);

	// activate Conveyor
	await Distributing.writeNodes({
		nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForward"',
		attributeId: node_opcua.AttributeIds.Value,
		value: {
			value: {
				dataType: node_opcua.DataType.Boolean,
				value: true
			}
		}
	})

	// activate Conveyor
	await Joining.writeNodes({
		nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyerForwardG2"',
		attributeId: node_opcua.AttributeIds.Value,
		value: {
			value: {
				dataType: node_opcua.DataType.Boolean,
				value: true
			}
		}
	})

	// deactivate Conveyor, if the rfid_sensor is activated
	await Joining.installSubscription('ns=3;s="RFID_IN_1"', async function(dataValue){
	 	console.log(JSON.stringify(dataValue))

		 await sleep(1000)
		// deactivate Conveyor
		await Joining.writeNodes({
			nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForwardG2"',
			attributeId: node_opcua.AttributeIds.Value,
			value: {
				value: {
					dataType: node_opcua.DataType.Boolean,
					value: false
				}
			}
		})

		//wait 500 ms
		await sleep(500)

		// retract gate
		await Joining.writeNodes({
			nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xRetractGate"',
			attributeId: node_opcua.AttributeIds.Value,
			value: {
				value: {
					dataType: node_opcua.DataType.Boolean,
					value: true
				}
			}
		})

		await sleep(1000)

		// activate Conveyor
		await Joining.writeNodes({
			nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForwardG2"',
			attributeId: node_opcua.AttributeIds.Value,
			value: {
				value: {
					dataType: node_opcua.DataType.Boolean,
					value: true
				}
			}
		})

		// wait 3 seconds
		await sleep(3000)

		// activate Conveyor
		await Sorting.writeNodes({
			nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForward"',
			attributeId: node_opcua.AttributeIds.Value,
			value: {
				value: {
					dataType: node_opcua.DataType.Boolean,
					value: true
				}
			}
		})

		// deactivate Conveyor, if the rfid_sensor is activated
		await Sorting.installSubscription('ns=3;s="RFID_IN_1"', async function(dataValue){
			console.log(JSON.stringify(dataValue))

			// extend gate & deactivate conveyor
			await Joining.writeNodes([
				{
					nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xRetractGate"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: false
						}
					}
				},
				{
					nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForwardG2"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: false
						}
					}
				}
			])

			// wait 255 ms
			await sleep(200)

			// deactivate Conveyor
			await Sorting.writeNodes({
				nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForward"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: false
					}
				}
			})

			let sensorValues = await Sorting.readNodes(
				[
					{
						nodeId: 'ns=3;s="B1BG1"',
						attributeId: node_opcua.AttributeIds.Value
					},
					{
						nodeId: 'ns=3;s="B1BG2"',
						attributeId: node_opcua.AttributeIds.Value
					},
					{
						nodeId: 'ns=3;s="B1BG3"',
						attributeId: node_opcua.AttributeIds.Value
					}
				]
			)

			await sleep(300)

			if (sensorValues[1].value.value && sensorValues[2].value.value)
				// if we have a silver bucket, activate the first seperator
				await Sorting.writeNodes({
					nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xExtendSeperator1"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: true
						}
					}
				})
			else if (sensorValues[1].value.value && !sensorValues[2].value.value)
				// if we have a black bucket, activate the second seperator
				await Sorting.writeNodes({
					nodeId:  'ns=3;s="FB_OPC_Remote_Control_DB"."xExtendSeperator2"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: true
						}
					}
				})



			// deactivate Conveyor, if the endsensor is changed
			await Sorting.installSubscription('ns=3;s="G1BG3"', async function(dataValue){

				// deactivate Conveyor
				await Sorting.writeNodes([
					{
						nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForward"',
						attributeId: node_opcua.AttributeIds.Value,
						value: {
							value: {
								dataType: node_opcua.DataType.Boolean,
								value: false
							}
						}
					},
					{
						nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xExtendSeperator1"',
						attributeId: node_opcua.AttributeIds.Value,
						value: {
							value: {
								dataType: node_opcua.DataType.Boolean,
								value: false
							}
						}
					},
					{
						nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xExtendSeperator2"',
						attributeId: node_opcua.AttributeIds.Value,
						value: {
							value: {
								dataType: node_opcua.DataType.Boolean,
								value: false
							}
						}
					}]
				)

				// ##########################################################################
				// #					Postprocessing										#
				// ##########################################################################

				// reset PLC
				await Distributing.writeNodes({
					nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."Reset"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: true
						}
					}
				})

				// reset PLC
				await Joining.writeNodes({
					nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."Reset"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: true
						}
					}
				})

				// reset PLC
				await Sorting.writeNodes({
					nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."Reset"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: true
						}
					}
				})

				await sleep(1000)

				// active proprietary control on the PLC
				await Distributing.writeNodes({
					nodeId: 'ns=3;s="OPCManualControl"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: false
						}
					}
				})

				// active proprietary control on the PLC
				await Joining.writeNodes({
					nodeId: 'ns=3;s="OPCManualControl"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: false
						}
					}
				})

				// active proprietary control on the PLC
				await Sorting.writeNodes({
					nodeId: 'ns=3;s="OPCManualControl"',
					attributeId: node_opcua.AttributeIds.Value,
					value: {
						value: {
							dataType: node_opcua.DataType.Boolean,
							value: false
						}
					}
				})

				// mark this program as done
				processDone = true
			})

			// activate Conveyor
			await Sorting.writeNodes({
				nodeId: 'ns=3;s="FB_OPC_Remote_Control_DB"."xConveyorForward"',
				attributeId: node_opcua.AttributeIds.Value,
				value: {
					value: {
						dataType: node_opcua.DataType.Boolean,
						value: false
					}
				}
			})
		})



	 })

})()
