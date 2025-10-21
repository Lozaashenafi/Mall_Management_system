import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js";
import nodemailer from "nodemailer";
import { io, onlineUsers } from "../../app.js";
import { sendSMS } from "../utils/sms.js"; // <-- use centralized SMS helper

// --- Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Renewal Reminder Job
const sendRenewalReminders = async () => {
  console.log("🔁 Running renewal reminder job...");

  const today = new Date();

  // Get active rentals
  const rentals = await prisma.rental.findMany({
    where: { status: "Active" },
    include: { tenant: true },
  });

  for (const rent of rentals) {
    const daysLeft = Math.ceil((rent.endDate - today) / (1000 * 60 * 60 * 24));

    // Send reminders 30 days and 7 days before endDate
    if ([30, 7].includes(daysLeft)) {
      const message = `Reminder: Your rental contract for room #${
        rent.roomId
      } is expiring in ${daysLeft} days (${rent.endDate.toDateString()}). Please contact management to renew your lease.`;

      // --- System notification
      await createNotification({
        tenantId: rent.tenantId,
        type: "RenewalReminder",
        message,
        sentVia: "System",
      });

      // --- Email
      if (rent.tenant.email) {
        await transporter.sendMail({
          from: `"Mall Management" <${process.env.EMAIL_USER}>`,
          to: rent.tenant.email,
          subject: `Rental Renewal Reminder - ${daysLeft} Days Left`,
          text: message,
        });

        await createNotification({
          tenantId: rent.tenantId,
          type: "RenewalReminder",
          message,
          sentVia: "Email",
        });
      }

      // --- SMS via helper
      if (rent.tenant.phone) {
        await sendSMS(rent.tenant.phone, message);

        await createNotification({
          tenantId: rent.tenantId,
          type: "RenewalReminder",
          message,
          sentVia: "SMS",
        });
      }

      // --- Real-time socket push
      const userId = rent.tenant.userId;
      if (userId && onlineUsers.has(userId)) {
        const socketId = onlineUsers.get(userId);
        io.to(socketId).emit("newNotification", {
          message,
          type: "RenewalReminder",
          sentVia: "System",
        });
      }
    }
  }

  console.log("✅ Renewal reminder job completed.");
};

// --- Run daily at midnight
cron.schedule("0 0 * * *", sendRenewalReminders);

export default sendRenewalReminders;
