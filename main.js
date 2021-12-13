import { OPCHub } from "./OPC Hub/hub.js";
import { requestProgram } from "./Web Client/client.js";
import fs from 'fs';

const ServiceID = "MPS_System_403_1"
const MachineID = "MPS_System_403_1_DiK_01"
const OPCHUB = new OPCHub;

const Distributing = await OPCHUB.addDevice("Distributing", "opc.tcp://192.168.1.10:4840")
const Joining = await OPCHUB.addDevice("Joining", "opc.tcp://192.168.1.30:4840")
const Sorting = await OPCHUB.addDevice("Sorting", "opc.tcp://192.168.1.40:4840")

const fetchProgram = function(rfid) {
	requestProgram("test", 1).then(
		path => {
			let content = fs.readFileSync(path, { encoding: "UTF-8" })
		}
	)
}

await OPCHUB.devices["Distributing"]["client"].installSubscription('ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"', fetchProgram)
