import express from "express";
import dotenv from "dotenv";
import regitration from "./controller/auth/registration.js";
import verify from "./controller/auth/verifyEmail.js";
import login from "./controller/auth/login.js";


dotenv.config();

const port = 3000;
const app = express();

app.use(express.json());

app.use(regitration);
app.use(verify);
app.use(login);

app.listen(port, () => {
  console.log(`running server on port ${port}`);
});

