import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new color design
router.post("/api/color-design", authenticateToken, async (req, res) => {
  try {
    const { color1_id, color2_id, color3_id, brand_id, isDevelope } = req.body;

    const { data: colorDesigns, error: insertError } = await supabase
      .from("color_designs")
      .insert({
        color1_id,
        color2_id,
        color3_id,
        brand_id,
        is_develope: isDevelope,
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
      message: "Color design has been added",
      data: colorDesigns,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve all color designs
router.get("/api/color-design", authenticateToken, async (req, res) => {
  try {
    const { data: colorDesigns, error: getError } = await supabase
      .from("color_designs")
      .select(
        `
        *,
        color1:colors!color_designs_color1_id_fkey(*),
        color2:colors!color_designs_color2_id_fkey(*),
        color3:colors!color_designs_color3_id_fkey(*),
        brands(*)
      `
      )
      .order("created_at", { ascending: true });

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color designs have been retrieved",
      data: colorDesigns,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve color design by ID
router.get("/api/color-design-id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: colorDesign, error: getError } = await supabase
      .from("color_designs")
      .select(
        `
      *,
      color1:colors!color_designs_color1_id_fkey(*),
      color2:colors!color_designs_color2_id_fkey(*),
      color3:colors!color_designs_color3_id_fkey(*),
      brands(*)
    `
      )
      .eq("color_design_id", id);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (colorDesign.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Color design with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color design has been retrieved",
      data: colorDesign,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update color design by ID
router.put("/api/color-design", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { color1_id, color2_id, color3_id, brand_id } = req.body;

    const { data: colorDesign, error: updateError } = await supabase
      .from("color_designs")
      .update({
        color1_id,
        color2_id,
        color3_id,
        brand_id,
      })
      .eq("color_design_id", id)
      .select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color design has been updated",
      data: colorDesign,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete color design by ID
router.delete("/api/color-design", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: colorDesign, error: deleteError } = await supabase.from("color_designs").delete().eq("color_design_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color design has been deleted",
      data: colorDesign,
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
