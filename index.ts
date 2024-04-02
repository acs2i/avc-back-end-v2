// server.ts
const express = require("express")
// const {Request, Response} = require("express")
const app = express();
const PORT = process.env.PORT || 3001;

// ROUTES
app.get('/', (req: any, res: any) => {
  res.send('Hello, world! test');
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
