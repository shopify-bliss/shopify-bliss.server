import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";
import moment from "moment-timezone";


const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/ai-builder-section", async (req, res) => {
  try {
    const { styleDesign, sectionID, pageID, aiBuilderID } = req.body;
    const created_at = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const { data: aiBuilderSection, error: insertError } = await supabase
      .from("ai_builder_sections")
      .insert({
        style_design: styleDesign,
        section_id: sectionID,
        page_id: pageID,
        ai_builder_id: aiBuilderID,
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
      message: "Ai Builder Style has been added",
      data: aiBuilderSection,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/ai-builder-section", async (req, res) => {
  try {
    const { data: aiBuilderSection, error: selectError } = await supabase.from("ai_builder_sections").select(`*, sections:section_id(*), pages:page_id(*)`);

    if (selectError) {
      console.error("Select error:", selectError);
      return res.status(500).json({
        success: false,
        message: selectError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: aiBuilderSection,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/ai-builder-section-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Parameter id is required",
      });
    }

    const { data: aiBuilderSections, error: selectError } = await supabase.from("ai_builder_sections").select(`*, sections:section_id(*), pages:page_id(*)`).eq("ai_builder_id", id);

    if (selectError) {
      console.error("Select error:", selectError);
      return res.status(500).json({
        success: false,
        message: selectError.message,
      });
    }

    if (!aiBuilderSections || aiBuilderSections.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sections found for the given aiBuilderID",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiBuilderSections,
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
