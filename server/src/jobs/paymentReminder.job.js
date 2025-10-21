import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js";
import nodemailer from "nodemailer";
import { io, onlineUsers } from "../../app.js";
import { sendSMS } from "../utils/sms.js"; // <-- import SMS helper

// --- Email sender
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Helper: add months based on payment interval
function addMonths(date, interval) {
  const newDate = new Date(date);
  if (interval === "Monthly") newDate.setMonth(newDate.getMonth() + 1);
  else if (interval === "Quarterly") newDate.setMonth(newDate.getMonth() + 3);
  else if (interval === "Yearly") newDate.setMonth(newDate.getMonth() + 12);
  else newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
}

// --- Helper: get next due date based on last payment
async function getNextDueDate(rent) {
  const lastPayment = await prisma.payment.findFirst({
    where: { rentId: rent.rentId },
    orderBy: { endDate: "desc" },
  });

  const baseDate = lastPayment ? lastPayment.endDate : rent.startDate;
  return addMonths(baseDate, rent.paymentInterval);
}

// --- Main job
const sendPaymentReminders = async () => {
  console.log("🔁 Running payment reminder job...");

  const today = new Date();
  const rentals = await prisma.rental.findMany({
    where: { status: "Active" },
    include: { tenant: true },
  });

  for (const rent of rentals) {
    const nextDueDate = await getNextDueDate(rent);
    const daysLeft = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));

    // Send reminders at 10, 6, 3, 1 days before due
    if ([10, 6, 3, 1].includes(daysLeft)) {
      const message = `Reminder: Your rent payment for room #${
        rent.roomId
      } is due in ${daysLeft} days (${nextDueDate.toDateString()}). Please make your payment on time.`;

      // --- System notification
      await createNotification({
        tenantId: rent.tenantId,
        type: "PaymentReminder",
        message,
        sentVia: "System",
      });

      // --- Email
      if (rent.tenant.email) {
        await transporter.sendMail({
          from: `"Mall Management" <${process.env.EMAIL_USER}>`,
          to: rent.tenant.email,
          subject: `Payment Reminder - ${daysLeft} Days Left`,
          text: message,
        });

        await createNotification({
          tenantId: rent.tenantId,
          type: "PaymentReminder",
          message,
          sentVia: "Email",
        });
      }

      // --- SMS via helper
      if (rent.tenant.phone) {
        await sendSMS(rent.tenant.phone, message);

        await createNotification({
          tenantId: rent.tenantId,
          type: "PaymentReminder",
          message,
          sentVia: "SMS",
        });
      }

      // --- Real-time push
      const userId = rent.tenant.userId;
      if (userId && onlineUsers.has(userId)) {
        const socketId = onlineUsers.get(userId);
        io.to(socketId).emit("newNotification", {
          message,
          type: "PaymentReminder",
          sentVia: "System",
        });
      }
    }
  }

  console.log("✅ Payment reminder job completed.");
};

// --- Run every day at midnight
cron.schedule("0 0 * * *", sendPaymentReminders);

export default sendPaymentReminders;
