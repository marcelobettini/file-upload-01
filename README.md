## Etapa 1 · Subimos un archivo

```bash
git checkout etapa-1
```

Creamos el endpoint `POST /upload-one` para subir un solo archivo de hasta 2 MB. Para probarlo, enviamos una solicitud `multipart/form-data` y adjuntamos el archivo en un campo llamado `file`.

Multer guarda el archivo en la carpeta `uploads`. Si la subida sale bien, respondemos con un mensaje de éxito y los datos del archivo. Si enviamos el formulario sin adjuntar un archivo, respondemos con un `400`.

Si miramos en `uploads`, vamos a ver que Multer guardó el archivo con un nombre generado y sin extensión. Para comprobar que es el mismo archivo que subimos, podemos agregarle a mano la extensión original y abrirlo.

En esta etapa podemos subir cualquier tipo de archivo. Por ahora, solo limitamos el tamaño.


## Etapa 2 · Subimos varios archivos

```bash
git checkout etapa-2
```

Agregamos el endpoint `POST /upload-multiple` para subir hasta tres archivos en una misma solicitud. Con `array("files", 3)`, Multer espera que todos lleguen en campos llamados `files` y deja los datos de los archivos en `req.files`. En `POST /upload-one` seguimos usando el campo `file` y leemos los datos de `req.file`.

Las dos rutas usan la misma configuración de Multer. Con `fileFilter` aceptamos imágenes JPEG, PNG y GIF según el tipo MIME informado para cada archivo. Si llega un tipo distinto, pasamos un error con estado `415`. El límite de **2 MB (2.000.000 bytes) se aplica a cada archivo**. Por ejemplo, podemos subir dos imágenes de 1,5 MB en la misma solicitud aunque juntas sumen 3 MB.

Registramos al final un manejador para las rutas que no existen (`404`) y un manejador global de errores. Si el formulario llega sin archivos, la ruta pasa un error `400` con `next(error)`. Multer también le pasa sus errores a Express. En el manejador global traducimos `LIMIT_FILE_SIZE` a `413` y `LIMIT_UNEXPECTED_FILE` a `400`. Para los demás errores usamos el estado que trae el error o respondemos con un `500` genérico si falta.

### Probamos las dos rutas

Con el servidor corriendo en `http://localhost:3000`, armamos una solicitud `POST` en Insomnia, Postman, Thunder Client o un cliente similar. Elegimos un cuerpo `multipart/form-data` y agregamos una fila de tipo **File** por cada archivo. Dejamos que el cliente genere el encabezado `Content-Type`.

**`POST /upload-one`** · Usamos el campo `file`.

| Qué enviamos | Qué esperamos |
| --- | --- |
| Una imagen JPEG, PNG o GIF de hasta 2 MB | `200` con los datos del archivo |
| Un PDF | `415` con `Invalid file type` |
| Una imagen permitida de más de 2 MB | `413` con `File size exceeds the limit of 2MB` |
| Dos imágenes válidas, ambas en campos `file` | `400` con `Send only one file.` |
| Una imagen válida en un campo `files` | `400` con `Use the 'file' field.` |
| Un formulario sin archivos | `400` con `No file uploaded` |

**`POST /upload-multiple`** · Repetimos el campo `files` en cada fila.

| Qué enviamos | Qué esperamos |
| --- | --- |
| De una a tres imágenes válidas de hasta 2 MB cada una | `200` con la lista de archivos |
| Dos imágenes válidas de 1,5 MB cada una | `200`, aunque el total supere los 2 MB |
| Una imagen válida y un PDF | `415` con `Invalid file type` |
| Dos imágenes de tipo permitido, una de más de 2 MB | `413` con `File size exceeds the limit of 2MB` |
| Cuatro imágenes válidas | `400` con `Send up to 3 files.` |
| Una imagen válida en un campo `file` | `400` con `Use the 'files' field.` |
| Un formulario sin archivos | `400` con `No files uploaded` |

Multer usa `LIMIT_UNEXPECTED_FILE` tanto para un campo incorrecto como para un exceso de archivos. En el manejador comparamos el nombre que trae `err.field` con el que espera la ruta. Así podemos indicar qué campo usar o cuántos archivos admite esa ruta.

## Descargamos un archivo

Agregamos `GET /downloads/:filename`. Para probarlo, subimos una imagen, copiamos el valor de `filename` que devuelve la subida y lo usamos en la URL de descarga.

En la ruta usamos `res.download(filename, { root: UPLOADS_DIR }, callback)`. El primer argumento es el nombre con el que guardamos el archivo. Express lo envía como adjunto con el encabezado `Content-Disposition`.

El segundo argumento, `{ root: UPLOADS_DIR }`, es un objeto de opciones. `root` indica desde qué carpeta se resuelve el primer argumento. En nuestro caso, es la misma carpeta `uploads` que usa Multer. Así podemos pasar solo el nombre del archivo y Express verifica que la ruta resultante quede dentro de esa carpeta.

El tercer argumento es el callback de la descarga. Si el archivo no existe, recibimos `ENOENT` y le pasamos a Express un error con estado `404`. El manejador global responde con `File not found`.

