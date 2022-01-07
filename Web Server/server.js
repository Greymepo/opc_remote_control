import express from 'express'
import bodyParser from 'body-parser';
import { rmSync, writeFile } from "fs";
import { promisify } from 'util';
const writeFilePromise = promisify(writeFile)

const app = express();
app.use(bodyParser.text())
const port = 3000;

app.post('/', (req, res) => {
})

app.post('/queueProgram', async(req, res) => {

	let name = makeid(8) + ".js"
	await writeFilePromise(`service resources/${name}`, req.body);
	let msg = {
		action: "queueProgram",
		content: {
			program: name
		}
	}

	process.send(JSON.stringify(msg));
	// process.on('message', message => {
	// 	res.send(message)
	// });
	res.send("")
})

app.get('/queueSize', async(req, res) => {
	let msg = {
		action: "queueSize",
		content: {}
	}
	process.send(JSON.stringify(msg));
	// process.on('message', message => {
	// 	res.send(message)
	// });
	res.send("");
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

function makeid(length) {
	let result = '';
	let characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
