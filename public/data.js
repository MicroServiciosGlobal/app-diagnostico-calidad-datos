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
				messages.innerHTML += '\n esto puede tardar unos minutos...';
			}
		}
	}
	let formulario_carga = document.getElementById('formulario_carga');
	let resultados_server = document.getElementById('resultados_server');
	formulario_carga.classList.add('d-none');
	resultados_server.classList.remove('d-none');
	const formData = new FormData();
	formData.append('file', file);
	document.getElementById('file-progress').value = (0);

	axios.post('/upload',  formData, config)
		.then(function (response) {
			// if sttus is 500
			if(response.status == 500){
				document.getElementById('file-progress').value = (0);
				document.querySelector('#respuesta_items').innerHTML = 'Error en el servidor:' + response.statusText;
			}else if(response.status == 200){
				try {
					let messages =document.getElementById('messages');
					messages.innerHTML = 'Archivo cargado correctamente';
					let json =  response.data;
					json = new Map(Object.entries(json));

					let html = "";
					// json to array
					// for json
					let count = 0;
					Array.from(json).forEach(element => {
						mas_informacion = "";
						if (element[0] !== 'Conjunto de datos'  && element[0] !== 'tamaño' && element[0] !== 'email') {
							// si es un 
								
							if(element[1] !== 'N/A'){

								if(!isNaN(element[1])){
									if(element[1] < 4){
										html += '<div class="item item-danger">';
									}else if(element[1] < 6){
										mas_informacion = '<div class="item-subtitle"><a href="https://app.powerbi.com/view?r=eyJrIjoiYzg1Y2RlOTAtYWVmMC00YmM2LWE1YmUtNGM1MDdhYTkzN2Y3IiwidCI6IjFhMDY3M2M2LTI0ZTEtNDc2ZC1iYjRkLWJhNmE5MWEzYzU4OCIsImMiOjR9&pageName=ReportSection" target="_blank">Más Información</a></div>';
										html += '<div class="item item-warning">';
									}else{
										html += '<div class="item item-success">';
									}
								}else{
									html += '<div class="item item-success">';
								}

								html += `
									<div class="item-title">
										<span>${element[0]}</span>
									</div>
									<div class="item-calification">
									<b>${element[1]}/10</b>
									${mas_informacion}
									</div>
								</div>`;
							}
						}
					});
					document.querySelector('#respuesta_items').innerHTML = html;
				} catch (error) {
					document.getElementById('file-progress').value = (0);
					document.querySelector('#respuesta_items').innerHTML = 'Error en el servidor:' + error;
				}
			}else{
				document.getElementById('file-progress').value = (0);
				document.querySelector('#respuesta_items').innerHTML = 'Error en el servidor:' + response.statusText;
			}
		}
	);
}


function fileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	if (e.type === 'dragover') {
		document.getElementById('file-drag').classList.add('hover');
	}else{
		document.getElementById('file-drag').classList.remove('hover');
	}
	// hover element
	document.getElementById('file-drag').classList.toggle('is-dragover', e.type === 'dragover');
}
function fileDropHandler(e) {
	let nom_archivo = "";
	let input_file = document.getElementById('file-upload');
	if(e.type === 'drop'){
		nom_archivo = e.dataTransfer.files[0].name;
		input_file.files = e.dataTransfer.files;
	}else if(e.type === 'change'){
		nom_archivo = e.target.files[0].name;
	}
	e.stopPropagation();
	e.preventDefault();
	document.getElementById('response_message').innerHTML ='Archivo <b>' + nom_archivo + '</b> cargado correctamente';
	document.getElementById('start').classList.add('d-none');
	document.getElementById('file-drag').classList.remove('hover');
	document.getElementById('response').classList.remove('d-none');
}
function fileSelectHandler() {
	document.getElementById('valido').classList.add('d-none');
	document.getElementById('invalido').classList.add('d-none');
	document.getElementById('tamanio').classList.add('d-none');
	let input_file = document.getElementById('file-upload');
	let files = input_file.files;

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
			sendFile(files[0]);
		} else {
			document.getElementById('tamanio').classList.remove('d-none');
		}
	} else {
		document.getElementById('invalido').classList.remove('d-none');
	}
  }
function reloadFile(){
	let file = document.getElementById('file-upload');
	file.value = '';
	document.getElementById('file-drag').classList.remove('hover');
	document.getElementById('file-drag').classList.remove('is-dragover');
	document.getElementById('valido').classList.add('d-none');
	document.getElementById('invalido').classList.add('d-none');
	document.getElementById('tamanio').classList.add('d-none');
	document.getElementById('start').classList.remove('d-none');
	document.getElementById('file-progress').value = (0);
	document.getElementById('messages').innerHTML = '';
	document.getElementById('response').classList.add('d-none');
}
window.onload = function () {
	var fileDrag = document.getElementById('file-drag');
	var fileSelect = document.getElementById('file-upload');
	let submit = document.getElementById('submit');
	let reload_file = document.getElementById('file-reload-btn');
	let reload_button = document.getElementById('reload-page');
	fileDrag.addEventListener('dragover', fileDragHover, false);
	fileDrag.addEventListener('dragleave', fileDragHover, false);
	fileDrag.addEventListener('drop', fileDropHandler, false);
	fileSelect.addEventListener('change', fileDropHandler, false);
	submit.addEventListener('click', fileSelectHandler, false);
	reload_file.addEventListener('click', reloadFile, false);
	reload_button.addEventListener('click', () =>{
		window.location.reload();
	});
	
}

// git user.name = "Dave Villamor"
// git user.email = "dacovillamor@gmail.com"
// git config --global user.name "Dave Villamor"
// git config --global user.email "dacovillamor@gmail.com"
//	