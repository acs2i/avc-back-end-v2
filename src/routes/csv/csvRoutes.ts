import fs from 'fs';
import XLSX, { utils } from 'xlsx'
import ExcelJS from 'exceljs';
import express, { Request, Response } from "express";
import multer from 'multer'; // If you're handling file uploads
import dotenv from "dotenv";
import { Post, PostCsv } from '../../services/fetch';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const dataLakeApiKey = process.env.DATA_LAKE_API_KEY
const dbUri = process.env.SERVER_DATA_LAKE_URI_LOCAL;
const avcDbName = process.env.DB_NAME

const router = express.Router()
// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, './uploads'); // Store files in the uploads folder
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ROUTES TO DATALAKE IF WE WERE DOING THAT 
// router.get('/csv', async (req, res) => {
//     try {
//       // Extract the collection name from the query parameters
//       // jake ad more 
//       const { dimension_type } = req.query;

  
//       // Make a request to the backend to get the CSV file
//       const backendResponse = await fetch(dbUri + "/csv?dimension_type="+dimension_type, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'text/csv',
//         },
//       });
  
//       // Check if the backend response is successful
//       if (!backendResponse.ok) {
//         console.error('Error fetching CSV from backend:', backendResponse.statusText);
//         return res.status(backendResponse.status).send('Error fetching CSV');
//       }
  
//       // Get the CSV data as a buffer  
//       // Set headers to indicate that the file is a downloadable attachment
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
  
//       // Send the CSV buffer to the front-end
//       res.send(backendResponse);
//     } catch (error) {
//       console.error('Error proxying CSV request:', error);
//       res.status(500).send('Error proxying CSV request');
//     }
//   });

// // Proxy route to handle the request from the frontend
// router.post('/csv', upload.single('file'), async (req, res) => {
//     try {
//         const formData = new FormData();

//         // Append the file from req.file
//         if (req.file) {
//             const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
//             formData.append('file', fileBlob, req.file.originalname); // Append file with its name        
//         }

//         // Append any additional body data
//         if (req.body) {
//             for (const key in req.body) {
                
//                     formData.append(key, req.body[key]);
                
//             }
//         }

//         // Send the request to the backend
//         const response = await fetch(dbUri + "/csv", {
//             method: "POST",
//             headers: {
//                 "app-id": `${dataLakeApiKey}`, // Custom headers (but do NOT set 'Content-Type', let it be handled automatically)
//             },
//             body: formData // Send the form data which includes the file and additional data
//         });

//         const result = await response.text();
//         console.log(result);
//         return result;
//     } catch (error) {
//         console.error("Error uploading file:", error);
//     }

// });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to fetch data from MongoDB
async function fetchDataFromMongoDB(collectionName: string) {
  const client = new MongoClient(dbUri as string);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbUri);
    const collection = db.collection(collectionName as string);
    
    // Fetch all documents from the collection
    const data = await collection.find({}).toArray();
    
    return data;
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}


async function jsonToCsv(jsonData: any): Promise<ExcelJS.Buffer> {
    // Treat the object id
    for (const data of jsonData) {
      if (data._id) data._id = data._id.toString();
      if (data.creator_id) data.creator_id = data.creator_id.toString();

      // go through the data and for any arrays we need to return it as string it
      // for(const key in data) {
      //   if (Array.isArray(data[key])) {
      //     data[key] = data[key].toString()
      //   }
      // }
    }
  
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');
  
    // Convert JSON data to sheet data
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
  
    // Add JSON data to the sheet, starting from row 3
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cellValue = worksheet[cellRef] ? worksheet[cellRef].v : '';
  
        // Add cell values starting from row 3, can make it larger
        sheet.getCell(R + 5, C + 1).value = cellValue;
      }
    }
  
    return await workbook.csv.writeBuffer();

  }

async function Extract(collectionName: string) {
    try {
  
      const data = await fetchDataFromMongoDB(collectionName);
      
      if (data) {
        return await jsonToCsv(data);
        
      }
    } catch (err) {
      console.error("Extract error: ", err);
    }
  }
  



function validateColumns(data: any[], requiredKeys: any[]): void {
  if (data.length === 0) {
    throw new Error('CSV file is empty');
  }

  const csvKeys = Object.keys(data[0]);

  console.log("CSV KEYS: "  ,csvKeys)

  const missingKeys = requiredKeys.filter(key => !csvKeys.map((k) => k.toLowerCase().trim()).includes(key as string));

  if (missingKeys.length > 0) {
    throw new Error(`Missing required columns: ${missingKeys.join(', ')}`);
  }
}

function determineRequiredKeys(collectionName: string) : string[]{
  let requiredKeys: string[] = []
  switch(collectionName) {
    case "brand": {
      requiredKeys = ["code", "label", "status"]
      break;
    }
    case "client": {
      requiredKeys = ["type"]
      break;
    }
    case "collection": {
      requiredKeys = ["code", "label", "status"]
      break;
    }
    case "dimension_type": {
      requiredKeys = ["dimension"]
      break;
    }
    case "dimension_grid": {
      requiredKeys = ["label", "type" , "dimensions", "status"]
      break;
    }
    case "dimension": {
      requiredKeys = ["code", "label", "type" , "status"]
      break;
    }
    case "dimension_type": {
      requiredKeys = ["dimension"]
      break;
    }
    case "event": {
      requiredKeys = ["code", "label", "type", "date_start", "date_end"]

      break;
    }
    case "draft": {
      requiredKeys = ["reference","name", "short_label", "long_label", "type", "tag_ids", 
        "peau", "tbeu_pb", "tbeu_pmeu", "suppliers","dimension_types", "uvc_ids","brand_ids","collection_ids",
        "imgPath", "status"
      ]
      break;
    }
    case "supplier": {
      requiredKeys = ["code", "company_name" , "siret", "tva", "web_url", "email", "phone", "address_1", "address_2", "address_3" , "city", "postal", "country", "contacts","brand_id","status"]
      break;
    }
    case "tag": {
      requiredKeys = ["code", "name", "level", "tag_grouping_id", "status"]
      break
    }
    case "tag_grouping": {
      requiredKeys = ["name", "level","status"]

      break;
    }
    case "tarif": {
      requiredKeys = ["code","label"]
      break;
    }
    case "uvc": {
      requiredKeys = ["code", "dimensions", "eans", "prices", "status"]
    }
    default: {
      break;
    }
  }
  return requiredKeys;

}

async function ImportCsv(csvFilePath: string, fileExt: string, collectionName: string) {
    let csvData 
    let workbook;
    if (fileExt === '.csv') {
        csvData = fs.readFileSync(csvFilePath, 'utf8');
        workbook = XLSX.read(csvData, { type: 'string' });
    } 
    // else if(fileExt === '.xlsx') {
    else {
        csvData = fs.readFileSync(csvFilePath);
        workbook = XLSX.read(csvData, { type: 'buffer' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("json data:  "  ,jsonData)
    /////////////////////////////////////
    let requiredKeys: string[] = determineRequiredKeys(collectionName)


    try {
      validateColumns(jsonData, requiredKeys);
    } catch (error) {
      console.error('Validation error:', error);
      return; // Exit the function if validation fails
    }

    /////////////////////////////////////

    const documents = jsonData.map((data: any) => {
      //   data["import_type"] = "import";
      //   data["import_id"] = import_id;
      //   data["file_name"] = csvFilePath;
  
      delete data._id;
      if (!data["version"]) data["version"] = 1;
      else data["version"] += 1;

      console.log("DATA: "  ,data)
      // go through each key and make sure a stringified array is turned into a real array
      for(const key in data) {
        if(typeof data[key] === "string" && data[key].startsWith("[") && data[key].endsWith("]")) {
            let content = data[key].slice(1,-1).trim()

            if(content === '') {
              data[key] = []
            } 

            data[key] = content.split(",")
        }
      }


      return data;


    });
  
    const client = new MongoClient(dbUri as string);
    await client.connect();
    try {
      const db = client.db(avcDbName);
      const collection = db.collection(collectionName);
      await collection.insertMany(documents);

    } catch (err) {
      console.error('Error inserting data:', err);
    } finally {
      await client.close();
    }
  }
  

// ImportCsv("./csvReceivedFile.csv");

// Extract("./outputhere.xlsx", "./french-flag.jpg");

router.get("/csv", async (req: Request, res: Response) => {
    try {
      // Extract the data and convert it to CSV format
      const {collection} = req.query;
      const file: ExcelJS.Buffer = await Extract(collection as string) as ExcelJS.Buffer;
  
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
  
      // Send the buffer (CSV) as binary
      res.send(file);
    } catch (error) {
      console.error('Error generating CSV:', error);
      res.status(500).send('Error generating CSV file');
    }
});



router.post("/csv", upload.single('file'), async (req: Request & any , res: Response) => {
    try {

    const {collection} = req.body;

    if(!collection) {
        throw new Error("Collcetion wasn't defined")
    }

    console.log("collection, " , collection)

    // Check if a file was uploaded
    if (!req.file) {
    return res.status(400).send('No file uploaded');
    }

    // Get the uploaded file's path
    const filePath = req.file.path;

    // Get the file extension to check for CSV or Excel file
    const fileExt = path.extname(filePath).toLowerCase();

    if (fileExt === '.csv' || fileExt === '.xlsx') {
    // Use ImportCsv for processing the CSV file
        
    await ImportCsv(filePath, fileExt, collection as string);

    // Respond with success
    return res.status(200).send('File processed and data imported successfully');
    } else {
    return res.status(400).send('Invalid file type. Only CSV and XLSX files are accepted.');
    }
    } catch (err) {
      console.error('Error importing CSV/XLSX file:', err);
      return res.status(500).send('Error importing file');
    }
  });
  

export default router;
