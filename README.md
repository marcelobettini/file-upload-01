## Etapa 1 · Subimos un archivo

`bash
git checkout etapa-1
`
Creamos el endpoint `POST /upload-one` para subir un solo archivo de hasta 2 MB. Para probarlo, enviamos una solicitud `multipart/form-data` y adjuntamos el archivo en un campo llamado `file`.

Multer guarda el archivo en la carpeta `uploads`. Si la subida sale bien, respondemos con un mensaje de éxito y los datos del archivo. Si enviamos el formulario sin adjuntar un archivo, respondemos con un `400`.

Si miramos en `uploads`, vamos a ver que Multer guardó el archivo con un nombre generado y sin extensión. Para comprobar que es el mismo archivo que subimos, podemos agregarle a mano la extensión original y abrirlo.

En esta etapa podemos subir cualquier tipo de archivo. Por ahora, solo limitamos el tamaño.


## Etapa 2 · Subimos varios archivos

