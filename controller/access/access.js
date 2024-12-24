import express from "express";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/access-management", authenticateToken, async (req, res) => {
  try {
    const { menuID, role, accessMenu } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    // Validasi apakah menu dengan menuID ada
    const { data: menuExists, error: menuError } = await supabase.from("menus").select("menu_id").eq("menu_id", menuID).single();

    if (menuError) {
      console.error("Menu query error:", menuError);
      return res.status(400).json({
        success: false,
        message: "Menu not Found.",
      });
    }

    const { data: access, error: insertError } = await supabase
      .from("access_management")
      .insert({
        role: role,
        access_menu: accessMenu,
        menu_id: menuID,
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
      message: "Access has been added",
      data: access,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/access-management", authenticateToken, async (req, res) => {
  try {
    const { data: access, error: fetchError } = await supabase.from("access_management").select(`*, menus(*)`);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: access,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/access-management-id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: access, error: fetchError } = await supabase.from("access_management").select(`*, menus(*)`).eq("access_id", id);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({
        success: false,
        message: "ID not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: access,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/api/access-management", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { role, accessMenu, menuID } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    // Validasi apakah menu dengan menuID ada
    const { data: menuExists, error: menuError } = await supabase.from("menus").select("menu_id").eq("menu_id", menuID).single();

    if (menuError) {
      console.error("Menu query error:", menuError);
      return res.status(400).json({
        success: false,
        message: "Menu not Found.",
      });
    }

    const { data: access, error: updateError } = await supabase
      .from("access_management")
      .update({
        role: role,
        access_menu: accessMenu,
        menu_id: menuID,
      })
      .eq("access_id", id)
      .select("*");

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Access has been updated",
      data: access,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/api/access-management", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: access, error: deleteError } = await supabase.from("access_management").delete().eq("access_id", id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: "ID not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Access has been deleted",
      data: access,
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
