import express from "express";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/sub-menu", authenticateToken, async (req, res) => {
  try {
    // Cek apakah pengguna memiliki peran admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { menuID, name, defaults } = req.body;

    // Validasi input
    if (!menuID || !name || defaults === undefined) {
      return res.status(400).json({
        success: false,
        message: "menuID, name, and defaults are required.",
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

    // Insert data ke tabel sub_menus
    const { data: subMenu, error: insertError } = await supabase
      .from("sub_menus")
      .insert({
        name,
        menu_id: menuID,
        default: defaults,
      })
      .select("*");

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to add sub-menu.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-menu has been added successfully.",
      data: subMenu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.get("/api/sub-menu", authenticateToken, async (req, res) => {
  try {
    const { data: subMenus, error: getError } = await supabase.from("sub_menus").select(`*, menus (*)`).order("created_at", { ascending: true });

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-menus have been retrieved.",
      data: subMenus,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server",
    });
  }
});

router.get("/api/sub-menu-id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required.",
      });
    }

    const { data: subMenu, error: getError } = await supabase.from("sub_menus").select(`*, menus (*)`).eq("sub_menu_id", id).single();

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-menu has been retrieved.",
      data: subMenu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/api/sub-menu", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    // Cek apakah pengguna memiliki peran admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { name, defaults, menuID } = req.body;

    // Validasi input
    if (!menuID || !name || defaults === undefined) {
      return res.status(400).json({
        success: false,
        message: "menuID, name, and defaults are required.",
      });
    }

    // Perbarui data sub-menu
    const { data: subMenu, error: updateError } = await supabase
      .from("sub_menus")
      .update({
        name,
        menu_id: menuID,
        default: defaults,
      })
      .eq("sub_menu_id", id)
      .select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update sub-menu.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-menu has been updated successfully.",
      data: subMenu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.delete("/api/sub-menu", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    // Cek apakah pengguna memiliki peran admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    // Hapus data sub-menu
    const { data: subMenu, error: deleteError } = await supabase.from("sub_menus").delete().eq("sub_menu_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Failed to delete sub-menu.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-menu has been deleted successfully.",
      data: subMenu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

export default router;