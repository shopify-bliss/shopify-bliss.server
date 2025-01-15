import express from "express";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/menu", authenticateToken, async (req, res) => {
  try {
    const superAdminID = "3de65f44-6341-4b4d-8d9f-c8ca3ea80b80";
    const adminID = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    if (req.user.role_id !== superAdminID && req.user.role_id !== adminID) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { name, url, isDevelope } = req.body;

    if (!name || !url || !isDevelope) {
      return res.status(400).json({
        success: false,
        message: "Name and URL are required",
      });
    }

    const { data: menu, error: insertError } = await supabase
      .from("menus")
      .insert({
        name: name,
        url: url,
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
      message: "Menu has been added",
      data: menu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/menu", async (req, res) => {
  try {
    const { data: menus, error: getError } = await supabase.from("menus").select("*").order("created_at", { ascending: true });

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/menu-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const { data: menu, error: getError } = await supabase.from("menus").select("*").eq("menu_id", id);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (menu.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Menu with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/api/menu", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const superAdminID = "3de65f44-6341-4b4d-8d9f-c8ca3ea80b80";
    const adminID = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    if (req.user.role_id !== superAdminID && req.user.role_id !== adminID) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { name, url, isDevelope } = req.body;

    if (!name || !url || !isDevelope) {
      return res.status(400).json({
        success: false,
        message: "Name, and URL are required",
      });
    }

    const { data: menu, error: updateError } = await supabase
      .from("menus")
      .update({
        name: name,
        url: url,
        is_develope: isDevelope,
      })
      .eq("menu_id", id)
      .select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    if (menu.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Menu with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu has been updated",
      data: menu,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/api/menu", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const superAdminID = "3de65f44-6341-4b4d-8d9f-c8ca3ea80b80";
    const adminID = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    if (req.user.role_id !== superAdminID && req.user.role_id !== adminID) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: menu, error: deleteError } = await supabase.from("menus").delete().eq("menu_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    if (menu.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Menu with id = ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu has been deleted",
      data: menu,
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
