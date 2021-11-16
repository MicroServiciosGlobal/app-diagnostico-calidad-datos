<!-- Manual tecnico de la app -->

## Introducción  
### Aplicación web Gestión de calidad

## Desarrollo
### Frontend
La aplicación web se desarrolla en React.js, con la librería Axios para la comunicación con el servidor.
Se implementa una interfaz de usuario para el envío de datos mediante un archivo .csv teniendo en cuenta unas caracteristicas especificas para la carga del mismo.
### Backend
La aplicación se desarrolla en Node.js, con la librería Express para el manejo de las peticiones HTTP, Nodemailer para el envío de correos, pm2 para el control de la app de node en producción y azure-storage para el manejo de archivos en el servidor de Azure.

### Configuración del servidor
El servidor se configura con apache2 para las peticiones HTTP, Node Js para la capa de ejecución de la aplicación.

### Configuración de la maquina virtual
Se configura una maquina virtual con las siguientes caractteristicas
CenttOS 7.9
Standard D2s v3 (2 vcpu, 8 GiB de memoria)
Generación de VM : V2



