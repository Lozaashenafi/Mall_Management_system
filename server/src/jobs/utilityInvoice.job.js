import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js";
import nodemailer from "nodemailer";
import { io, onlineUsers } from "../../app.js";
import { sendSMS } from "../utils/sms.js"; // <-- centralized SMS helper

// --- Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Main utility invoice job
const generateUtilityInvoices = async () => {
  console.log("🔁 Running monthly utility invoice job...");

  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  // 1️⃣ Get total utility expenses for this month
  const utilityExpenses = await prisma.utilityExpense.findMany({
    where: {
      date: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
        lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      },
    },
  });

  const expenseByType = {};
  for (const exp of utilityExpenses) {
    if (!expenseByType[exp.type]) expenseByType[exp.type] = 0;
    expenseByType[exp.type] += exp.amount;
  }

  // 2️⃣ Get all active rentals
  const rentals = await prisma.rental.findMany({
    where: { status: "Active" },
    include: { tenant: true, room: true },
  });

  // Count tenants for each utility type
  const utilityTenantCounts = {
    Water: rentals.filter((r) => r.includeWater).length,
    Electricity: rentals.filter((r) => r.includeElectricity).length,
    Generator: rentals.filter((r) => r.includeGenerator).length,
    Service: rentals.filter((r) => r.includeService).length,
  };

  // 3️⃣ Create UtilityCharge record per utility type
  const utilityChargeRecords = {};
  for (const type of ["Water", "Electricity", "Generator", "Service"]) {
    const totalCost = expenseByType[type] || 0;
    utilityChargeRecords[type] = await prisma.utilityCharge.create({
      data: {
        type,
        month: monthStr,
        totalCost,
      },
    });
  }

  // 4️⃣ Generate invoices for each rental
  for (const rent of rentals) {
    let totalAmount = 0;
    const utilityAmounts = {};

    if (rent.includeWater && utilityTenantCounts.Water > 0) {
      const amount = (expenseByType.Water || 0) / utilityTenantCounts.Water;
      utilityAmounts.Water = amount;
      totalAmount += amount;
    }

    if (rent.includeElectricity && utilityTenantCounts.Electricity > 0) {
      const amount =
        (expenseByType.Electricity || 0) / utilityTenantCounts.Electricity;
      utilityAmounts.Electricity = amount;
      totalAmount += amount;
    }

    if (rent.includeGenerator && utilityTenantCounts.Generator > 0) {
      const amount =
        (expenseByType.Generator || 0) / utilityTenantCounts.Generator;
      utilityAmounts.Generator = amount;
      totalAmount += amount;
    }

    if (rent.includeService && utilityTenantCounts.Service > 0) {
      const amount = (expenseByType.Service || 0) / utilityTenantCounts.Service;
      utilityAmounts.Service = amount;
      totalAmount += amount;
    }

    // 5️⃣ Create UtilityInvoice records
    for (const [type, amount] of Object.entries(utilityAmounts)) {
      await prisma.utilityInvoice.create({
        data: {
          utilityChargeId: utilityChargeRecords[type].utilityChargeId,
          rentId: rent.rentId,
          amount,
          status: "UNPAID",
        },
      });
    }

    // 6️⃣ Send notification to tenant
    const message = `Your utility invoice for ${monthStr} has been generated. Total: ${totalAmount.toFixed(
      2
    )} ETB. Please make payment on time.`;

    await createNotification({
      tenantId: rent.tenantId,
      type: "Invoice",
      message,
      sentVia: "System",
    });

    // --- Email
    if (rent.tenant.email) {
      await transporter.sendMail({
        from: `"Mall Management" <${process.env.EMAIL_USER}>`,
        to: rent.tenant.email,
        subject: `Utility Invoice - ${monthStr}`,
        text: message,
      });

      await createNotification({
        tenantId: rent.tenantId,
        type: "Invoice",
        message,
        sentVia: "Email",
      });
    }

    // --- SMS via centralized helper
    if (rent.tenant.phone) {
      await sendSMS(rent.tenant.phone, message);
      await createNotification({
        tenantId: rent.tenantId,
        type: "Invoice",
        message,
        sentVia: "SMS",
      });
    }

    // --- Real-time push
    if (rent.tenant.userId && onlineUsers.has(rent.tenant.userId)) {
      const socketId = onlineUsers.get(rent.tenant.userId);
      io.to(socketId).emit("newNotification", {
        message,
        type: "Invoice",
        sentVia: "System",
      });
    }
  }

  console.log("✅ Monthly utility invoices generated and notifications sent.");
};

// --- Schedule: run at 00:05 on the 1st of each month
cron.schedule("5 0 1 * *", generateUtilityInvoices);

export default generateUtilityInvoices;
