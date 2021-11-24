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


module.exports = app; // exportar el app