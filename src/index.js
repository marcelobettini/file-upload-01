import express from "express";
import multer from "multer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// CURR_DIR es el directoria actual
const CURR_DIR = dirname(fileURLToPath(import.meta.url)); // Carpeta actual del archivo index.js
const multerUploads = multer(
    {
        dest: join(CURR_DIR, "../uploads"), // Carpeta donde se guardarán los archivos subidos
        limits: { fileSize: 2000000 }, // Limite de tamaño de archivo (2MB)
    });

const app = express();

app.post("/upload-one", multerUploads.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ message: "File uploaded successfully", data: req.file });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});