import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";
import moment from "moment-timezone";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/ai-builder", async (req, res) => {
  try {
    const { siteTitle, brandID, fontID, colorID, userID } = req.body;
    const created_at = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const { data: aiBuilder, error: insertError } = await supabase
      .from("ai_builders")
      .insert({
        site_title: siteTitle,
        brand_id: brandID,
        font_id: fontID,
        color_id: colorID,
        user_id: userID,
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
      message: "Ai Builder has been added",
      data: aiBuilder,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/ai-builder", async (req, res) => {
  try {
    const { data: aiBuilder, error: selectError } = await supabase.from("ai_builders").select(`*, brand:brand_id(*), font:font_id(*), color:color_id(*), user:user_id(*)`);

    if (selectError) {
      console.error("Select error:", selectError);
      return res.status(500).json({
        success: false,
        message: selectError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: aiBuilder,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
