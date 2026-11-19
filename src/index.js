import express from "express";
import multer from "multer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { notFoundHandler, globalErrorHandler } from "./middlewares/errorHandler.js"; // Importa el manejador de errores 404 y el global

// CURR_DIR es el directoria actual
const CURR_DIR = dirname(fileURLToPath(import.meta.url)); // Carpeta actual del archivo index.js
const MIMETYPES = ["image/jpeg", "image/png", "image/gif"]; // Tipos de archivos permitidos
const multerUploads = multer(
    {
        dest: join(CURR_DIR, "../uploads"), // Carpeta donde se guardarán los archivos subidos
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



// registramos al final de la cadena los manejadores de errores
app.use(notFoundHandler); // Manejador de errores 404
app.use(globalErrorHandler); // Manejador global de errores
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});