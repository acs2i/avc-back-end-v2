import fs from "fs";
import XLSX, { utils } from "xlsx";
import ExcelJS from "exceljs";
import express, { Request, Response } from "express";
import multer from "multer"; // If you're handling file uploads
import dotenv from "dotenv";
import { Get, Post, PostCsv } from "../../services/fetch";
import { MongoClient, ObjectId } from "mongodb";
import { v4 } from "uuid";
import { fileURLToPath } from "url";
import path from "path";
import { CSV } from "./shared";

const router = express.Router();

router.get(
  CSV + "/export/supplier/:id",
  async (req: Request, res: Response) => {
    try {
      // Appel au premier backend pour exporter le CSV des produits
      const response = await Get("/export/supplier/:id");
      const data = await response.json();

      if (!data.filePath) {
        return res.status(500).json({ error: "File path is missing from first backend response" });
      }

      const filePath = data.filePath;
      console.log("Chemin du fichier récupéré :", filePath);
  
      // Vérification de l'existence du fichier avant téléchargement
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "CSV file not found" });
      }
  
      // Téléchargement du fichier
      res.download(filePath, (err) => {
        if (err) {
          console.error("Erreur de téléchargement du fichier CSV :", err);
          res.status(500).send("Erreur de téléchargement du fichier CSV");
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du CSV :", error); // Ajout de log pour les erreurs
      res.status(500).json({ error: "Erreur lors de la récupération du CSV depuis le premier backend" });
    }
  }
);

export default router;
