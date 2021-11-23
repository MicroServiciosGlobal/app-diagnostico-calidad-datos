// -----------------------------------------------
// Language: javascript
// Path: app.js
// Description dev: este módulo fue creado para subir archivos al servidor de Azure, y en la ruta de /respuestas se generan los emails correspondientes a la lectura de los archivos la finalizar el procesamiento de los mismos  
// -----------------------------------------------
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();	// importación del archivo .env que contiene la clave del storage de Azure
  }
const express = require('express'); // importación de express para crear el servidor
const path = require('path'); // importación de path para el manejo de rutas absolutas y relativas
const app = express(); // creación del servidor
app.use(express.json()); // permite que el servidor entienda los datos enviados en formato json
app.use(express.urlencoded({ extended: true }));  
app.use(express.static(path.join(__dirname, './public'))); // permite que el servidor entienda los archivos estáticos en la carpeta public

const multer = require('multer'); // importación de multer para el manejo de archivos
const inMemoryStorage = multer.memoryStorage(); // almacenamiento en memoria del archivo
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file'); // almacenamiento en memoria del archivo

const config = require('./config'); // importación del archivo de configuración
const azureStorage = require('azure-storage'); // importación de azure storage para el manejo de archivos en la nube
const blobService = azureStorage.createBlobService();  // creación del servicio de almacenamiento de archivos en la nube
const getStream = require('into-stream'); // importación de into-stream para convertir un array en un stream
const containerName = "minticcontainer3"; // nombre del contenedor en la nube
const directory_name = "data-diagnostico"; // nombre del directorio en la nube

app.post('/upload', uploadStrategy, (req, res) => {
	// generar codigo de 20 caracteres
	const codigo = Math.random().toString().replace(/0\./, '').substring(0, 20); // generar codigo de 20 caracteres
	let blobName = (codigo + req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))); // nombre del archivo en la nube
	const finalBlobName = directory_name + "/" + blobName; // nombre del archivo en la nube
	const stream = getStream(req.file.buffer); // convertir el array en un stream
	const streamLength = req.file.buffer.length; // tamaño del archivo en bytes
	const email = req.body.email; // email del usuario que sube el archivo
	console.log("Nombre: " +blobName); // información del archivo
	blobService.createBlockBlobFromStream(containerName, finalBlobName, stream, streamLength, err => {
		const request = require('request'); // importación de request para consumir la API de resultados
		if (err) { // si hay error
			console.log(err); // imprimir el error
			res.status(500).send(err); // enviar el error
		} else { 
			request.post({ 
				url: 'https://func-bdguidance-score.azurewebsites.net/api/score_dataset', // url de la API
				headers: { // cabeceras
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({ // body
					"name": blobName, // nombre del archivo en la nube
					"email": email // email del usuario que sube el archivo
				})
			}, (err, response, body) => {
				try{
					if (err) {
						console.log("Error-data" + err); // error
						res.status(500).send(err); // error al buscar el archivo en la nube
					} else {
						console.log("Success-data" + body); // success
						console.log("response-data" + response.statusCode); // success
						let json =  JSON.parse(body); // convertir el texto en un json
						if (!Object.entries){ // si no existe la función entries
							Object.entries = function( obj ){
								var ownProps = Object.keys( obj ),
									i = ownProps.length,
									resArray = new Array(i); // preallocate the Array

								while (i--)
									resArray[i] = [ownProps[i], obj[ownProps[i]]];
								return resArray;
							};
						}
						json = new Map(Object.entries(json)); // convertir el json en un map
						let tabla = ""; // variable para la tabla
						let count = 0; // variable para el contador
						Array.from(json).forEach(element => { // recorrer el json
							if (element[0] !== 'Conjunto de datos'  && element[0] !== 'tamaño' && element[0] !== 'email'){
								if (element[0] !== 'N/A'){
									tabla += `<div class="item item-success" style="background-color: white; max-width:600px; width:100%;padding: .5em;border-radius: 10px;display:flex;margin-bottom:1em;">
									<div class="item-title" style="width: 100%;">
											<i class="fa fa-check"></i>
											<span>${element[0]}</span>
										</div>
										<div class="item-calification">
											<b>${element[1]}/10</b>
										</div>
									</div>`; // generar la tabla
								}
							}
						});
						let html = email_html(tabla) // generar el html
						sendEmail(email,html); // enviar el email
						console.log("Volviendo respuesta");
						res.send(body); // enviar el texto del archivo
					}
				}catch(err){
					console.log("Error-data" + err); // error
					res.status(500).send(err); // error al buscar el archivo en la nube
				}
			});
		}
	});
	// buscar archivo en azure storage
	// const blobSvc = azureStorage.createBlobService(); // creación del servicio de almacenamiento de archivos en la nube
	// remplazar extension por .json
	// const blobNameJson = blobName.replace(/\.[^/.]+$/, ".csv"); // nombre del archivo en la nube
	// const directory_name_result = "Result"; // nombre del directorio en la nube de resultados
	// const finalBlobNameJson =directory_name+ "/"+ directory_name_result + "/" + "05422564236769234-628944831700841.json"; // nombre del archivo en la nube de resultados
	// // console.log(finalBlobNameJson);
	// // consumir API de resultados
	// console.log("nombre del archivo: " + blobNameJson); // nombre del archivo en la nube
	// console.log("email: " + email); // email del usuario que sube el archivo
	


	// blobSvc.getBlobToText(containerName, finalBlobNameJson, (err, text) => {
		
	// });
});

app.get('/', (req, res) => {
	  res.sendFile(path.join(__dirname, 'index.html')); // enviar el archivo index.html
});

app.listen( process.env.PORT || 3000, () => {
	  console.log('listening on port 3000'); // escuchar en el puerto 3000
});

function sendEmail(email,html){ // función para enviar el email
	const nodemailer = require("nodemailer"); // importación de nodemailer
	let transporter = nodemailer.createTransport({ // creación del transporte
		host: "smtp.gmail.com", // servidor de correo
		port: 465, // puerto
		secure: true, // seguro
		auth: {
			user: "calidad.datos2021@gmail.com", // usuario
			pass: "calidad2021", // contraseña
		}
	});
	transporter.verify().then(() => { // verificar el servidor
		// console.log("servidor listo para recibir mensajes"); // servidor listo para recibir mensajes
	});
	transporter.sendMail({ // enviar el email
		from: '"Calidad Datos" <calidad.datos2021@gmail.com>', // remitente
		to: email, // destinatario
		subject: "Resultado de la prueba", // asunto
		html: html, // html
	}).then(info => { // enviar el email
		console.log(info); // información del email
	}); 
	
}


function email_html(tabla){ // función para generar el html
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
	`; // html
}

function documentJsonControl(nombre_archivo){
	// Create json file
	let json = {}; // variable para el json
	json[nombre_archivo] = 0; // agregar el nombre del archivo
	json[email] = 0; // agregar el email
}
module.exports = app; // exportar el app