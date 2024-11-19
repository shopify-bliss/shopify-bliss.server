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
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { name, fontClass, fontClassReverse } = req.body;

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const { data: font, error: insertError } = await supabase
      .from("fonts")
      .insert({
        name: name,
        font_class: fontClass,
        font_class_reverse: fontClassReverse,
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
      message: "Font has been added",
      data: font,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/font", async (req, res) => {
  try {
    const { data: fonts, error: getError } = await supabase.from("fonts").select("*").order("created_at", { ascending: true });

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fonts have been retrieved",
      data: fonts,
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
