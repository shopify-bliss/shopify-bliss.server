import express from "express";
import bcrypt from "bcryptjs";
import moment from "moment-timezone";

import configureMiddleware from "./../../config/middleware.js";
import supabase from "./../../config/supabase.js";

import authenticateToken from "./../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/add-admin", authenticateToken, async (req, res) => {
  try {
    const superAdminID = "3de65f44-6341-4b4d-8d9f-c8ca3ea80b80";
    const adminID = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    if (req.user.role_id !== superAdminID && req.user.role_id !== adminID) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { username, email, password, phoneNumber, roleID } = req.body;

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid phone number format. Please provide a valid phone number.",
      });
    }

    // Validasi password
    const passwordCriteria = {
      minLength: /.{8,}/,
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      number: /\d/,
      specialCharacter: /[!@#$%^&*(),.?":{}|<>]/,
    };

    if (!passwordCriteria.minLength.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    } else if (!passwordCriteria.lowercase.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter.",
      });
    } else if (!passwordCriteria.uppercase.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter.",
      });
    } else if (!passwordCriteria.number.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one number.",
      });
    } else if (!passwordCriteria.specialCharacter.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character.",
      });
    }

    const created_at = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    // Gabungan validasi email dan username
    const { data: existingUser, error: userCheckError } = await supabase.from("users").select("email, username").or(`email.eq.${email},username.eq.${username}`).single();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username already exists.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const defaultRoleId = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        username: username,
        email: email,
        password: hashedPassword,
        role_id: roleID,
        created_at: created_at,
        updated_at: created_at,
        is_verified: true,
        expires_at: null,
        verification_code: null,
        phone_number: phoneNumber,
        avatar: "polar-bear.png",
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
      message: "Admin has been added",
      data: user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/api/role-update", authenticateToken, async (req, res) => {
  try {
    const { userID, role } = req.body;

    const superAdminID = "3de65f44-6341-4b4d-8d9f-c8ca3ea80b80";
    const adminID = "0057ae60-509f-40de-a637-b2b6fdc1569e";

    if (req.user.role_id !== superAdminID && req.user.role_id !== adminID) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .update({
        role_id: role,
      })
      .eq("user_id", userID)
      .single()
      .select("*");

    if (userError) {
      console.error("Update error:", userError);
      return res.status(500).json({
        message: userError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role has been updated",
      data: user,
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
