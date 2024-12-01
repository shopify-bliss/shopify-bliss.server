import express from "express";
import jwt from "jsonwebtoken";
import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";


const app = express();
configureMiddleware(app);
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {  email } = decoded;

    const { data, error } = await supabase
      .from("users")
      .update({ is_verified: true }) // Field "verified" harus ada pada tabel "users"
      .match({  email });

    // if (error || data.length === 0) {
    //   return res.status(400).json({ message: "Invalid or expired token" });
    // }

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
