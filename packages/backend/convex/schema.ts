import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  anonymousRequests: defineTable({
    body: v.string(),
    kind: v.union(v.literal("form"), v.literal("agent")),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  realtimeNotes: defineTable({
    text: v.string(),
    authorId: v.optional(v.string()),
    authorName: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_author_id_and_updated_at", ["authorId", "updatedAt"]),
});
