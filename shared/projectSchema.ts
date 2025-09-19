
import { z } from "zod";

export const insertProjectSchema = z.object({
  name: z.string().min(1, "اسم المشروع مطلوب"),
  description: z.string().min(1, "وصف المشروع مطلوب"),
  category: z.enum(["utility", "moderation", "music", "game", "other"]),
  tags: z.array(z.string()).optional(),
  files: z.record(z.string()),
  author: z.string().min(1, "اسم المؤلف مطلوب"),
  authorAvatar: z.string().optional(),
  verified: z.boolean().default(false),
  downloads: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().default(0)
});

export const projectSchema = insertProjectSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export const projectSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  verified: z.boolean().optional()
});

export type ProjectSearch = z.infer<typeof projectSearchSchema>;
