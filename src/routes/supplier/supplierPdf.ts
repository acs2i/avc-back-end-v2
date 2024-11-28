import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import Mustache from 'mustache';
import dotenv from "dotenv"
dotenv.config();

const router = express.Router();

const QUEUE_FILE_PATH = path.join(__dirname, 'queue.json');

interface QueueItem {
  id: string;
  data: any;
}

let queue: QueueItem[] = [];
let responses: { [key: string]: Response } = {};
const MAX_SLOTS = 100;
let activeSlots = 0;

// Charger la file d'attente depuis le fichier JSON
const loadQueue = () => {
  if (fs.existsSync(QUEUE_FILE_PATH)) {
    const savedQueue = JSON.parse(fs.readFileSync(QUEUE_FILE_PATH, 'utf8'));
    queue = savedQueue.queue || [];
    activeSlots = savedQueue.activeSlots || 0;
  }
};

// Sauvegarder la file d'attente dans le fichier JSON
const saveQueue = () => {
  const state = {
    queue,
    activeSlots
  };
  fs.writeFileSync(QUEUE_FILE_PATH, JSON.stringify(state));
};

// Middleware pour gérer la file d'attente
const queueMiddleware = (req: Request, res: Response, next: Function) => {
  if (activeSlots >= MAX_SLOTS) {
    return res.status(429).json({ error: 'Queue limit reached. Please try again later.' });
  }
  next();
};

// Fonction pour traiter le prochain élément de la file d'attente
const processQueue = async () => {
    if (queue.length > 0) {
      const { id, data } = queue.shift()!;
      saveQueue();
      try {
        const fileName = `new-${Date.now()}.pdf`;
        const filePath = path.join(__dirname, 'public', 'pdfs', fileName);
        if (!fs.existsSync(path.join(__dirname, 'public', 'pdfs'))) {
          fs.mkdirSync(path.join(__dirname, 'public', 'pdfs'), { recursive: true });
        }
        await generatePDF(data, filePath);
        responses[id].status(200).json({ message: 'PDF generated successfully', filePath: `${process.env.FRONTEND_URL}/public/pdfs/${fileName}` });
      } catch (error) {
        console.error('Error generating file:', error);
        responses[id].status(500).json({ error: 'Failed to generate file' });
      } finally {
        delete responses[id];
        activeSlots--;
        saveQueue();
        processQueue();
  
        if (global.gc) {
          global.gc();
        }
      }
    }
  };

// Fonction pour générer un PDF
const generatePDF = async (data: any, filePath: string) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath: process.env.CHROME_BIN || undefined,
      env: {
        ...process.env,
        DISPLAY: undefined,
      }
    });

    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    });

    const templatePath = path.join(__dirname, 'template.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    const renderedHtml = Mustache.render(templateHtml, data);

    // Set content with more robust error handling
    try {
      await page.setContent(renderedHtml, { 
        waitUntil: ['load', 'networkidle0'],
        timeout: 60000 
      });
    } catch (error) {
      console.error('Error setting page content:', error);
      throw new Error('Failed to render HTML content');
    }

    // Generate PDF with specific options
    try {
      await page.pdf({
        path: filePath,
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: {
          top: '10mm',    // Reduced from 20mm
          right: '10mm',  // Reduced from 20mm
          bottom: '10mm', // Reduced from 20mm
          left: '10mm'    // Reduced from 20mm
        }
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF file');
    }

  } catch (error) {
    console.error('Puppeteer error:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
};

// Fonction pour générer un fichier XLSX
const generateXLSX = async (data: any, filePath: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Image', key: 'image', width: 50 }
  ];

  data.products.forEach((product: any) => {
    worksheet.addRow(product);
  });

  await workbook.xlsx.writeFile(filePath);
};

// Point de terminaison API pour générer un PDF
router.post('/generate-pdf', queueMiddleware, (req: Request, res: Response) => {
  const data = req.body;
  const id = Date.now().toString();
  queue.push({ id, data });
  responses[id] = res;
  activeSlots++;
  saveQueue();
  processQueue();
});

// Point de terminaison API pour générer un fichier XLSX
router.post('/generate-xlsx', queueMiddleware, (req: Request, res: Response) => {
  const data = req.body;
  const id = Date.now().toString();
  queue.push({ id, data });
  responses[id] = res;
  activeSlots++;
  saveQueue();
  processQueue();
});

// Charger la file d'attente au démarrage de l'application
loadQueue();

// Enable garbage collection if Node.js is started with the --expose-gc flag
if (typeof gc === 'function') {
  setInterval(gc, 60000);
}

export default router;
