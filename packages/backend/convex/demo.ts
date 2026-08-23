import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("realtimeNotes")
      .withIndex("by_updated_at")
      .order("desc")
      .take(10);
  },
});

export const addNote = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, { text }) => {
    const normalizedText = text.trim();
    if (normalizedText.length === 0 || normalizedText.length > 160) {
      throw new Error("A note must contain between 1 and 160 characters.");
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    return await ctx.db.insert("realtimeNotes", {
      text: normalizedText,
      authorName: user?.name ?? undefined,
      updatedAt: Date.now(),
    });
  },
});
