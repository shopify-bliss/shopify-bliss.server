import express from "express";
import dotenv from "dotenv";


dotenv.config();

const port = 3000;
const app = express();


app.listen(port, () => {
  console.log(`running server on port ${port}`);
});

