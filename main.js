import { OPCHub } from "./OPC Hub/hub.js";
import { requestProgram, uploadProgram } from "./Web Client/client.js";
import fs from 'fs';
import { ServiceExecutor } from "./Service Executor/serviceExecutor.js";
import { fork } from 'child_process'


const ServiceID = "test"
const MachineID = "MPS_System_403_1_DiK_01"

const OPCHUB = new OPCHub(ServiceID, MachineID);

const Distributing = await OPCHUB.addDevice("Distributing", "opc.tcp://192.168.1.10:4840")
// const Joining = await OPCHUB.addDevice("Joining", "opc.tcp://192.168.1.30:4840")
// const Sorting = await OPCHUB.addDevice("Sorting", "opc.tcp://192.168.1.40:4840")


const webserverFile = "./Web Server/server.js"
const parameters = null;
const options = {
	stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
	silent: false
};

// const server = fork(webserverFile, parameters, options);
const server = fork(webserverFile);
const serviceExecutor = new ServiceExecutor(ServiceID, OPCHUB, server);

// uploadProgram(ServiceID, 118, "./service resources/dance_for_115.js");

// await OPCHUB.devices["Distributing"]["client"].installSubscription('ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"', serviceExecutor.fetchCallback())
