import express from "express";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/auth/role", authenticateToken, async (req, res) => {
  try {
    const { roleName, icon } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: existingRole, error: fetchError } = await supabase.from("roles").select("role_name").eq("role_name", roleName);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    if (existingRole.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Role already exists",
      });
    }

    const { data: role, error: insertError } = await supabase
      .from("roles")
      .insert({
        role_name: roleName,
        icon: icon,
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
      message: "Role has been added",
      data: role,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/auth/role", authenticateToken, async (req, res) => {
  try {
    const { data: roles, error: fetchError } = await supabase.from("roles").select("*");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/auth/role-id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    const { data: role, error: fetchError } = await supabase.from("roles").select("*").eq("role_id", id).single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(403).json({
        success: false,
        message: "ID not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/auth/role", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    const { roleName,icon } = req.body;

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const { data: role, error: updateError } = await supabase
      .from("roles")
      .update({ 
        role_name: roleName,
        icon: icon, 
      })
      .eq("role_id", id)
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
      message: "Role has been updated",
      data: role,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/auth/role", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: role, error: deleteError } = await supabase.from("roles").delete().eq("role_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role has been deleted",
      data: role,
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
