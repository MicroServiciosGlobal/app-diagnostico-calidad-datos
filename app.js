if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
  }
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));

const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');

const config = require('./config');
const azureStorage = require('azure-storage');
const blobService = azureStorage.createBlobService();
const getStream = require('into-stream');
const containerName = "minticcontainer3";
const directory_name = "data-diagnostico";

app.post('/upload', uploadStrategy, (req, res) => {
	// generar codigo de 20 caracteres
	const codigo = Math.random().toString().replace(/0\./, '').substring(0, 20);
	let blobName = (codigo + req.file.originalname.substring(req.file.originalname.lastIndexOf('.')));
	const finalBlobName = directory_name + "/" + blobName;
	const stream = getStream(req.file.buffer);
	const streamLength = req.file.buffer.length;
	
	blobService.createBlockBlobFromStream(containerName, finalBlobName, stream, streamLength, err => {
	});
	// buscar archivo en azure storage
	const blobSvc = azureStorage.createBlobService();
	// remplazar extension por .json
	const blobNameJson = blobName.replace(/\.[^/.]+$/, ".json");
	const directory_name_result = "Result";
	const finalBlobNameJson =directory_name+ "/"+ directory_name_result + "/" + "05422564236769234-628944831700841.json";
	const email = req.body.email;
	console.log(email);
	// console.log(finalBlobNameJson);
	blobSvc.getBlobToText(containerName, finalBlobNameJson, (err, text) => {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		} else {
			let json =  JSON.parse(text);
			// object to array for
			if (!Object.entries){
				Object.entries = function( obj ){
					var ownProps = Object.keys( obj ),
						i = ownProps.length,
						resArray = new Array(i); // preallocate the Array

					while (i--)
						resArray[i] = [ownProps[i], obj[ownProps[i]]];
					return resArray;
				};
			}
			json = new Map(Object.entries(json));
			let tabla = "";
			// json to array
			// for json
			let count = 0;
			Array.from(json).forEach(element => {

				tabla += `<div class="item item-success" style="background-color: white; max-width:600px; width:100%;padding: .5em;border-radius: 10px;display:flex;margin-bottom:1em;">
				<div class="item-title" style="width: 100%;">
						<i class="fa fa-check"></i>
						<span>${element[0]}</span>
					</div>
					<div class="item-calification">
						<b>${element[1]}/10</b>
					</div>
				</div>`;
			});
			console.log(tabla);
			let html = email_html(tabla)
			sendEmail(email,html);
			res.send(text);
		}
	});
});

app.get('/', (req, res) => {
	  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
	  console.log('listening on port 3000');
});

function sendEmail(email,html){
	const nodemailer = require("nodemailer");
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
		user: "calidad.datos2021@gmail.com",
		pass: "calidad2021", // generated ethereal password
		},
	});
	transporter.verify().then(() => {
		console.log("Server is ready to take our messages");
	});
	transporter.sendMail({
		from: '"Calidad Datos" <calidad.datos2021@gmail.com>',
		to: email,
		subject: "Resultado de la prueba",
		html: html,
	}).then(info => {
		console.log(info);
	});
	
}


function email_html(tabla){
	return `
	<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Calidad de datos</title>
</head>
	<div style="background-color:rgb(233,233,233);font-family:'Roboto',sans-serif;width:100%;padding:1.2em;flex-direction: column;align-items: center;">
	<div></div>
	<div class="conteneror" style="background-color: white; max-width:600px; width:100%;padding: .5em;border-radius: 10px;margin-bottom: 1em;">
		<h1 style="text-align:center">Resultados de la prueba de calidad</h1>
	</div>
	<div class="conteneror">
	${tabla}
	</div>
</div>
</html>
	`;
}
module.exports = app;