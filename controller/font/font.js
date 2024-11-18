import express from "express";
import moment from "moment/moment.js";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/font", authenticateToken, async (req, res) => {
  try {
    const { name, fontClass, fontClassReverse} = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const {data : font, error: insertError} = await supabase
      .from("font")
      .insert({
        
      })

  } catch (error) {
    
  }
})