import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new font
router.post("/api/font", authenticateToken, async (req, res) => {
  try {
    const { name, isDevelope } = req.body;

    if (!name || !isDevelope) {
      return res.status(400).json({
        success: false,
        message: "Bad request: Name is required",
      });
    }

    const { data: fonts, error: insertError } = await supabase.from("fonts").insert({ name, is_develope: isDevelope }).select("*");

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

// Retrieve all fonts
router.get("/api/fonts", async (req, res) => {
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

// Retrieve font by ID
router.get("/api/font", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: font, error: getError } = await supabase.from("fonts").select("*").eq("font_id", id).single();

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (!font) {
      return res.status(404).json({
        success: false,
        message: `Font with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Font has been retrieved",
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

// Update font by ID
router.put("/api/font", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    const { name } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Bad request: Name is required",
      });
    }

    const { data: font, error: updateError } = await supabase.from("fonts").update({ name }).eq("font_id", id).select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Font has been updated",
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

// Delete font by ID
router.delete("/api/font", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: font, error: deleteError } = await supabase.from("fonts").delete().eq("font_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Font has been deleted",
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

export default router;
