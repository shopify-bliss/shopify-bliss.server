import cron from "node-cron";
import supabase from "../config/supabase.js";
import moment from "moment";

// Jalankan tugas setiap 1 menit
cron.schedule("* * * * *", async () => {
  try {
    // console.log("Running cron job to delete expired accounts...");

    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

    // Hapus akun yang belum diverifikasi dan sudah melewati waktu kadaluarsa
    const { data, error } = await supabase
      .from("users")
      .delete()
      .match({ is_verified: false })
      .lte("expires_at", currentTime);

    console.log("Deleted expired accounts:", data);

    if (error) {
      console.error("Error deleting expired accounts:", error);
      return;
    }
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});
