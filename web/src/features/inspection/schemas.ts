import { z } from "zod";

export const GeoStampSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
  timestamp: z.string().optional(),
});

export const InspectionCreateSchema = z.object({
  mine_id: z.string().uuid(),
  inspection_type: z.enum([
    "dgms_annual_general", "dgms_surprise", "dgms_inquiry",
    "internal_safety_committee", "environmental_pcb",
    "medical_fitness", "electrical", "explosives"
  ]),
  checklist_template_id: z.string().uuid(),
  scheduled_date: z.string(), // Consider custom date validation if needed
  zone: z.string().optional(),
});

export const ObservationCreateSchema = z.object({
  checklist_item_id: z.string(),
  status: z.enum(["ok", "non_compliant", "observation"]),
  description: z.string().min(5, "Description is required"),
  category: z.string().optional(),
  severity: z.enum(["minor", "medium", "high", "critical"]).optional(),
  geo_stamp: GeoStampSchema.optional(),
});

export const CAPACreateSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  assigned_to: z.string().uuid("Please select an assignee"),
  due_date: z.string().min(1, "Due date is required"),
});
