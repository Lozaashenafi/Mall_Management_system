import axios from "axios";

export async function sendSMS(phone, message) {
  try {
    const formData = new URLSearchParams();
    formData.append("token", process.env.GEEZSMS_TOKEN);
    formData.append("phone", phone);
    formData.append("msg", message);
    formData.append("shortcode_id", process.env.GEEZSMS_SHORTCODE);
    formData.append("callback", process.env.GEEZSMS_CALLBACK);

    const response = await axios.post(
      "https://api.geezsms.com/api/v1/sms/send",
      formData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log(`📱 SMS sent to ${phone}: ${message}`);
    return response.data;
  } catch (err) {
    console.error(
      `❌ SMS to ${phone} failed:`,
      err.response?.data || err.message
    );
  }
}
