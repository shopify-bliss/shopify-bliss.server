import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new color
router.post("/api/color", authenticateToken, async (req, res) => {
  try {
    const { color } = req.body;

    if (!color) {
      return res.status(400).json({
        success: false,
        message: "Bad request: Color is required",
      });
    }

    const { data: newColor, error: insertError } = await supabase.from("colors").insert({ color }).select("*");

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: insertError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color has been added",
      data: newColor,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve all colors
router.get("/api/color", async (req, res) => {
  try {
    const { data: colors, error: getError } = await supabase.from("colors").select("*").order("created_at", { ascending: true });

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Colors have been retrieved",
      data: colors,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve color by ID
router.get("/api/color-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: color, error: getError } = await supabase.from("colors").select("*").eq("color_id", id).single();

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (!color) {
      return res.status(404).json({
        success: false,
        message: `Color with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color has been retrieved",
      data: color,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update color by ID
router.put("/api/color", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    const { color } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    if (!color) {
      return res.status(400).json({
        success: false,
        message: "Bad request: Color is required",
      });
    }

    const { data: updatedColor, error: updateError } = await supabase.from("colors").update({ color }).eq("color_id", id).select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color has been updated",
      data: updatedColor,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete color by ID
router.delete("/api/color", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: deletedColor, error: deleteError } = await supabase.from("colors").delete().eq("color_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color has been deleted",
      data: deletedColor,
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
