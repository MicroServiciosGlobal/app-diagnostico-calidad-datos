# Presentación técnica de la herramienta de diagnóstico.
Los conceptos a continuación descritos son única y específicamente para la herramienta de diagnóstico 
## Los detalles de la herramienta se encuentran en el archivo PDF de la carpeta actual


## Descripción general de la Herramienta
La herramienta de diagnóstico se divide en 3 partes fundamentales, el Front End que es la parte visual y de interacción del usuario final, El Back End se encarga de comunicarse con los servidores de almacenamiento y guardar el archivo apropiadamente para su posterior procesamiento, también se encarga de consumir La respuesta final Y enviarla visualmente a través del Front End al usuario final, y por último se encuentra una Azure Function la cual se encarga de leer el archivo en el contenedor de almacenamiento procesarlo(calificarlo) y devolver una respuesta con un formato JSON (estructura de datos estándar para almacenar e intercambiar información entre sistemas de información).

## Desarrollo de la aplicación a nivel tecnológico y de programación


### Frontend:
La aplicación web se desarrolla usando como lenguaje principal React.js, con el componente y/o librería Axios, para la comunicación con el backend de la aplicación encargado de enviar los datos y recibir los resultados del diagnóstico.Tiene tres componentes principales separados en tres archivos index.html, data.js y style.css. 

### Index.html
está encargado de la maquetación de la página, internamente se encuentra el código que muestra los contenedores, el texto y los botones de la misma.Así como la importación de los archivos para el manejo de los datos y estilos visual (data.js y style.css) 
### data.js
Este archivo se encarga de la validación antes de la carga al servidor teniendo como parámetros lo anteriormente mencionado que sean archivos de tipo .CSV y que el tamaño no superé los 100 mb, si uno de estos criterios falla, este devuelve como respuesta al usuario un mensaje de error diciendo la causa para su posterior corrección. Después de validado el archivo utiliza la librería de axios para enviar el archivo al  backend y quedará a la espera de la respuesta para mostrarla posteriormente en la sección de resultados 
style.css
Este archivo cumple la función de darle estilo a la página con los colores, tamaños, padding, margin correspondientes, llevando la imagen corporativa ya establecida de https://www.mintic.gov.co/

### Backend:
La aplicación se desarrolla en Node.js, con las siguientes dependencias:

    "azure-storage": "^2.10.5",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "into-stream": "^3.1.0",
    "multer": "^1.4.3",
    "request": "^2.88.2"

### azure-storage
Es el sdk oficial de Azure para El manejo de peticiones hacia el Data storage 
#### dotenv
Tiene como objetivo el manejo de archivos privados para las cadenas de conexión y claves del sistema y evitar la filtración de datos.
#### Express
Proporciona mecanismos para: Escritura de manejadores de peticiones con diferentes verbos HTTP en diferentes caminos URL (rutas).
#### Into-Stream
Es un manejador de datos de tipo Stream(convierte los datos a tipo stream) para el correcto envío de archivos al BlobStorage

#### Multer
Es un middleware para Express y Node. js que hace que sea fácil manipular este multipart/form-data cuando tus usuarios suben archivos.

#### Request
Esta dependencia es usada para consumir el API de la function en Azure y obtener la respuesta de la calificación.


 #### Adicional
Estas dependencias interactúan entre sí para el envío del archivo y el correcto almacenamiento en el azure storage después se consume la respuesta con la dependencia de Request y se envía al Front ( en la documentación del código se encuentra el funcionamiento de todos los componentes y Cómo interactúan entre sí) 
