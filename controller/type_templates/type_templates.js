import express from "express";
import moment from "moment/moment.js";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";


const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/type-templates", authenticateToken,async (req, res) => {
  try {
    const { type, icon } = req.body;

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const { data: typeTemplate, error: insertError } = await supabase
      .from("type_templates")
      .insert({
        type: type,
        icon: icon,
        created_at: created_at,
        updated_at: created_at,
      })
      .select("*");

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: insertError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Type has been added",
      data: typeTemplate,
    });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});



export default router;