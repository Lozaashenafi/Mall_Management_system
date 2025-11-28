import prisma from "../config/prismaClient.js";
import { createNotification } from "../api/notification/notification.service.js"; // adjust path

// Map frequency to days/months increment
const frequencyMap = {
  Daily: { days: 1 },
  Weekly: { days: 7 },
  Monthly: { months: 1 },
  Quarterly: { months: 3 },
  Yearly: { years: 1 },
};

export const generateMaintenanceOccurrences = async () => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany();

    for (const schedule of schedules) {
      // Get the latest occurrence
      const lastOccurrence =
        await prisma.maintenanceScheduleOccurrence.findFirst({
          where: { scheduleId: schedule.scheduleId },
          orderBy: { occurrenceDate: "desc" },
        });

      let nextDate = lastOccurrence
        ? new Date(lastOccurrence.occurrenceDate)
        : new Date(schedule.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize

      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      while (nextDate <= nextWeek) {
        try {
          const occurrence = await prisma.maintenanceScheduleOccurrence.create({
            data: {
              scheduleId: schedule.scheduleId,
              occurrenceDate: nextDate,
              startDateTime: nextDate,
              dueDate: schedule.duedate ? new Date(schedule.duedate) : null,
            },
          });

          // Notify all admins and super admins if occurrence is today
          const occurrenceDay = new Date(nextDate);
          occurrenceDay.setHours(0, 0, 0, 0);

          if (occurrenceDay.getTime() === today.getTime()) {
            const admins = await prisma.user.findMany({
              where: { role: { in: ["Admin", "SuperAdmin"] } },
            });

            for (const admin of admins) {
              await createNotification({
                userId: admin.userId,
                tenantId: null,
                type: "Maintenance",
                message: `Maintenance task "${schedule.title}" is scheduled for today.`,
                sentVia: "System",
              });
            }

            // Optionally mark occurrence as notified
            await prisma.maintenanceScheduleOccurrence.update({
              where: { occurrenceId: occurrence.occurrenceId },
              data: { notified: true, notifiedAt: new Date() },
            });
          }
        } catch (err) {}

        // Increment nextDate based on frequency
        const freq = schedule.frequency;
        if (!freq || !frequencyMap[freq]) break; // no frequency → only one occurrence

        const increment = frequencyMap[freq];
        if (increment.days)
          nextDate.setDate(nextDate.getDate() + increment.days);
        if (increment.months)
          nextDate.setMonth(nextDate.getMonth() + increment.months);
        if (increment.years)
          nextDate.setFullYear(nextDate.getFullYear() + increment.years);
      }
    }

    console.log("Maintenance occurrences generated successfully.");
  } catch (error) {
    console.error("Error generating maintenance occurrences:", error);
  }
};
