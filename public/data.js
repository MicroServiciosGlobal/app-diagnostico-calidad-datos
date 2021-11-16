
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
			}
		}
	}
	const formData = new FormData();
	formData.append('file', file);
	formData.append('email', document.getElementById('email').value);
	document.getElementById('file-progress').value = (0);
	axios.post('/upload',  formData, config)
		.then(function (response) {
			let messages =document.getElementById('messages');
			messages.innerHTML = 'Archivo cargado correctamente';
			let json =  response.data;
			 json = new Map(Object.entries(json));

			let html = "";
			// json to array
			// for json
			let count = 0;
			Array.from(json).forEach(element => {

				html += `<div class="item item-success">
					<div class="item-title">
						<i class="fa fa-check"></i>
						<span>${element[0]}</span>
					</div>
					<div class="item-calification">
						<b>${element[1]}/10</b>
					</div>
				</div>`;
			});
			document.querySelector('#respuesta_items').innerHTML = html;
		}
	);
}


function fileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
}
function fileSelectHandler() {
	document.getElementById('valido').classList.add('d-none');
	document.getElementById('invalido').classList.add('d-none');
	document.getElementById('tamanio').classList.add('d-none');
	document.getElementById('email_error').classList.add('d-none');
	let input_file = document.getElementById('file-upload');
	let input_email = document.getElementById('email');
	let files = input_file.files;

	if(input_email.value == '' || input_email.value == null || input_email.value == undefined){
		// validar si es un email
		document.getElementById('email_error').classList.remove('d-none');
		return;
	}else{
	let validar = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if(!validar.test(input_email.value)){
			document.getElementById('email_error').classList.add('d-none');
			return;
		}
	}
	messages.innerHTML = 'Cargando archivo...';
	// Fetch FileList object

	if (files.length === 0) {
		document.getElementById('invalido').classList.remove('d-none');
		return;
	}
	// Cancel event and hover styling
	// Validar la extensión del archivo a subir
	var ext = files[0].name.substring(files[0].name.lastIndexOf('.') + 1).toLowerCase();

		// no puede tener un tamanio mayor a 100mb


	if (ext == "csv") {
		if (files[0].size < 100000000) {
			document.getElementById('valido').classList.remove('d-none');
			document.getElementById('correo_a_enviar').innerHTML = input_email.value;
			sendFile(files[0]);
		} else {
			document.getElementById('tamanio').classList.remove('d-none');
		}
	} else {
		document.getElementById('invalido').classList.remove('d-none');
	}
  }

window.onload = function () {
	var fileDrag = document.getElementById('file-drag');
	var fileSelect = document.getElementById('file-upload');
	let submit = document.getElementById('submit');
	fileDrag.addEventListener('dragover', fileDragHover, false);
	fileDrag.addEventListener('dragleave', fileDragHover, false);
	submit.addEventListener('click', fileSelectHandler, false);
}