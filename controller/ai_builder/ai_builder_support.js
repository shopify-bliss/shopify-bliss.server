import express from "express";
import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";
import moment from "moment-timezone";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/ai-builder-support", async (req, res) => {
  try {
    const { aiBuilderID, pageID, supportID, styleDesign } = req.body;
    const created_at = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const { data: aiBuilderSupport, error: insertError } = await supabase
      .from("ai_builder_supports")
      .insert({
        ai_builder_id: aiBuilderID,
        page_id: pageID,
        support_id: supportID,
        style_design: styleDesign,
        created_at: created_at,
        updated_at: created_at,
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
      message: "AI Builder Support has been added",
      data: aiBuilderSupport,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/ai-builder-support", async (req, res) => {
  try {
    const { data: aiBuilderSupport, error: selectError } = await supabase.from("ai_builder_supports").select(`
        *,
        page_id:page_templates!ai_builder_support_page_id_fkey(*),
        support_id:page_templates!ai_builder_supports_support_id_fkey(*),
        ai_builder:ai_builder_id(*)
      `);

    if (selectError) {
      console.error("Select error:", selectError);
      return res.status(500).json({
        success: false,
        message: selectError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: aiBuilderSupport,
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
