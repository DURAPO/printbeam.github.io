import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_order_created", (q) =>
        q.eq("orderId", args.orderId),
      )
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    orderId: v.id("orders"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const userName = user?.name || identity.name || "Team member";

    return await ctx.db.insert("messages", {
      orderId: args.orderId,
      userId: identity.subject,
      userName,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
