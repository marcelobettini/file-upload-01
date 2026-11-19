import express from "express";
import multer from "multer";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto"; // Importa el módulo crypto para generar nombres de archivo únicos

import { notFoundHandler, globalErrorHandler } from "./middlewares/errorHandler.js"; // Importa el manejador de errores 404 y el global

// CURR_DIR es el directoria actual
const CURR_DIR = dirname(fileURLToPath(import.meta.url)); // Carpeta actual del archivo index.js
const UPLOADS_DIR = join(CURR_DIR, "../uploads");
const MIMETYPES = ["image/jpeg", "image/png", "image/gif"]; // Tipos de archivos permitidos
const multerUploads = multer(
    {
        storage: multer.diskStorage({
            destination: UPLOADS_DIR, // Carpeta donde se guardarán los archivos subidos
            filename: (req, file, cb) => {
                const uniqueSuffix = randomUUID().slice(0, 8); // Genera un nombre de archivo único
                const extension = extname(file.originalname);
                cb(null, `${file.originalname}-${uniqueSuffix}${extension}`);
            }
        }),
        limits: { fileSize: 2000000 }, // Limite de tamaño de archivo (2MB)
        // el callback es el que filtra, si todo sale bien se llama con null y true, si hay un error se llama con un error y false
        fileFilter: (req, file, cb) => {
            if (MIMETYPES.includes(file.mimetype)) {
                cb(null, true);
            } else {
                const error = new Error("Invalid file type");
                error.status = 415;
                cb(error, false);
            }
        }
    });

const app = express();

app.post("/upload-one", multerUploads.single("file"), (req, res, next) => {
    if (!req.file) {
        const error = new Error("No file uploaded");
        error.status = 400;
        return next(error);
    }
    res.json({ message: "File uploaded successfully", data: req.file });
});

app.post("/upload-multiple", multerUploads.array("files", 3), (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        const error = new Error("No files uploaded");
        error.status = 400;
        return next(error);
    }
    res.json({ message: "Files uploaded successfully", data: req.files });
});

app.get("/downloads/:filename", (req, res, next) => {
    const { filename } = req.params;

    // Enviamos el archivo como adjunto. El segundo argumento es el objeto de opciones.
    // Con root, Express busca el archivo dentro de uploads y valida que la ruta quede ahí.
    res.download(filename, { root: UPLOADS_DIR }, (err) => {
        if (err?.code === "ENOENT") {
            const error = new Error("File not found", { cause: err });
            error.status = 404;
            return next(error);
        }
        if (err) {
            next(err);
        }
    });
});

// registramos al final de la cadena los manejadores de errores
app.use(notFoundHandler); // Manejador de errores 404
app.use(globalErrorHandler); // Manejador global de errores
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
