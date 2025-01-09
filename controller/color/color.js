import express from "express";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/color", authenticateToken, async (req, res) => {
  try {
    const { brand, color1, color2, color3 } = req.body;

    const superAdminID = "3de65f44-6341-4b4d-8d9f-c8ca3ea80b80";
    const adminID = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    if (req.user.role_id !== superAdminID && req.user.role_id !== adminID) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    if (!brand || !color1 || !color2 || !color3) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    const { data: color, error: insertError } = await supabase
      .from("colors")
      .insert({
        brand,
        color1,
        color2,
        color3,
      })
      .select("*");

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: "Error inserting color",
      });
    }

    return res.status(200).json({
      success: true,
      data: color,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/color", async (req, res) => {
  try {
    const { data: colors, error } = await supabase.from("colors").select("*").order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching colors",
      });
    }

    return res.status(200).json({
      success: true,
      data: colors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/color-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide an ID",
      });
    }

    const { data: color, error } = await supabase.from("colors").select("*").eq("color_id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching color",
      });
    }

    return res.status(200).json({
      success: true,
      data: color,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/api/color", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide an ID",
      });
    }

    const { data: color, error } = await supabase.from("colors").select("*").eq("color_id", id);

    if (error) {
      return res.status(404).json({
        success: false,
        message: "ID Not Found",
      });
    }

    const { brand, color1, color2, color3 } = req.body;

    if (!brand || !color1 || !color2 || !color3) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    const { data: updatedColor, error: updateError } = await supabase
      .from("colors")
      .update({
        brand,
        color1,
        color2,
        color3,
      })
      .eq("color_id", id)
      .select("*");

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: "Error updating color",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color updated successfully",
      data: updatedColor,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/api/color", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide an ID",
      });
    }

    const { data: color, error } = await supabase.from("colors").select("*").eq("color_id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Color not found",
      });
    }

    const { data: deleteColor, error: deleteError } = await supabase.from("colors").delete().eq("color_id", id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: "Error deleting color",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Color deleted successfully",
      data: deleteColor,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
