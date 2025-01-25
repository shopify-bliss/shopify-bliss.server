import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new font design
router.post("/api/font-design", authenticateToken, async (req, res) => {
  try {
    const { font1_id, font2_id, brand_id, group,isDevelope } = req.body;

    const { data: fontDesigns, error: insertError } = await supabase
      .from("font_designs")
      .insert({
        font1_id,
        font2_id,
        brand_id,
        group,
        is_develope: isDevelope
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
      message: "Font design has been added",
      data: fontDesigns,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve all font designs
router.get("/api/font-design", async (req, res) => {
  try {
    const { data: fontDesigns, error: getError } = await supabase
      .from("font_designs")
      .select(
        `
        *,
        font1:fonts!font_designs_font_id_fkey(*),
        font2:fonts!font_designs_font2_id_fkey(*),
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
      message: "Font designs have been retrieved",
      data: fontDesigns,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve font design by ID
router.get("/api/font-design-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: fontDesign, error: getError } = await supabase.from("font_designs").select( `
      *,
      font1:fonts!font_designs_font_id_fkey(*),
      font2:fonts!font_designs_font2_id_fkey(*),
      brands(*)
    `).eq("font_designs_id", id);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (fontDesign.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Font design with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Font design has been retrieved",
      data: fontDesign,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update font design by ID
router.put("/api/font-design", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { font1_id, font2_id, brand_id, group, isDevelope } = req.body;

    const { data: fontDesign, error: updateError } = await supabase
      .from("font_designs")
      .update({
        font1_id,
        font2_id,
        brand_id,
        group,
        is_develope: isDevelope
      })
      .eq("font_designs_id", id)
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
      message: "Font design has been updated",
      data: fontDesign,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete font design by ID
router.delete("/api/font-design", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: fontDesign, error: deleteError } = await supabase.from("font_designs").delete().eq("font_designs_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Font design has been deleted",
      data: fontDesign,
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
