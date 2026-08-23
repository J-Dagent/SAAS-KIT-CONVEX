import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  realtimeNotes: defineTable({
    text: v.string(),
    authorName: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_updated_at", ["updatedAt"]),
});
