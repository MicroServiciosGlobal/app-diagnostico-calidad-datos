
function sendFile(file) {
	const config ={
		onUploadProgress: function(progressEvent) {		
			var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
			document.getElementById('file-progress').value = (percentCompleted/100);
			console.log(percentCompleted/100);
			let messages =document.getElementById('messages');
			messages.innerHTML = 'Cargando archivo...' + percentCompleted + '%';
			if(percentCompleted == 100){
				messages.innerHTML = 'Conectando con el servicio de procesamiento...';
				messages.innerHTML = '\n esto puede tardar unos minutos...';
				document.getElementById('file-progress').value = (0);
			}
		}
	}
	const formData = new FormData();
	formData.append('file', file);
	axios.post('/upload',  formData, config)
		.then(function (response) {
			let messages =document.getElementById('messages');
			messages.innerHTML = response.data.message;
		}
	);
}


function fileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.target.className = (e.type == "dragover" ? "hover" : "file-upload");
}
function fileSelectHandler(e) {
	messages.innerHTML = 'Cargando archivo...';
	// Fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// Cancel event and hover styling
	fileDragHover(e);

	sendFile(files[0]);
  }

window.onload = function () {
	var fileDrag = document.getElementById('file-drag');
	var fileSelect = document.getElementById('file-upload');
	fileDrag.addEventListener('dragover', fileDragHover, false);
	fileDrag.addEventListener('dragleave', fileDragHover, false);
	fileDrag.addEventListener('drop', fileSelectHandler, false);
	fileSelect.addEventListener('change', fileSelectHandler, false);

}