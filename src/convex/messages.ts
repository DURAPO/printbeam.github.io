import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByJob = query({
  args: { printJobId: v.id("printJobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_job_created", (q) =>
        q.eq("printJobId", args.printJobId),
      )
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    printJobId: v.id("printJobs"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db.get(identity.subject as any);
    const userName =
      user && "name" in user ? (user as any).name || "Team member" : "Team member";

    return await ctx.db.insert("messages", {
      printJobId: args.printJobId,
      userId: identity.subject,
      userName,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
