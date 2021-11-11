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
const getBlobName = (originalName) => {
	const identifier = Math.random().toString().replace(/0\./, '');
	const dir = directory_name;
	return  dir + '/' + identifier + '-' + originalName;
};

app.post('/upload', uploadStrategy, (req, res) => {
	// generar codigo de 20 caracteres
	const codigo = Math.random().toString().replace(/0\./, '').substring(0, 20);
	const blobName = getBlobName(codigo + req.file.originalname.substring(req.file.originalname.lastIndexOf('.')));
	const stream = getStream(req.file.buffer);
	const streamLength = req.file.buffer.length;
	
	blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
		if (!err) {
			res.send({
				message: 'Archivo subido correctamente',
			});
		} else {
			res.status(500).send({ error: error });
		}
	});
});
app.get('/', (req, res) => {
	  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
	  console.log('listening on port 3000');
});

module.exports = app;