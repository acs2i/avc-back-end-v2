// server.ts
import dotenv from "dotenv"
import express from "express"
import authRoutes from "./routes/authRoutes"
import dbConnect from "./config/dbConnect"
import bodyParser from "body-parser"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// ROUTES
app.get('/', (req: any, res: any) => {
  res.send('Hello, world! test');
});

app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on port ${PORT}`);
});
