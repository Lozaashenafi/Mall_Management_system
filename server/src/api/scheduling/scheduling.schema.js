// scheduling.schema.js
import { z } from "zod";

const schedulingSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  duedate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: "Invalid due date",
    }),

  recurrenceRule: z.string().optional(), // can be empty
  category: z.string().optional(),

  frequency: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

export default schedulingSchema;
