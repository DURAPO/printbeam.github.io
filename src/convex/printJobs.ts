import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    return jobs;
  },
});

export const get = query({
  args: { jobId: v.id("printJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || job.userId !== identity.subject) return null;

    return job;
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    storeName: v.string(),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    copies: v.number(),
    color: v.boolean(),
    paperSize: v.string(),
    doubleSided: v.boolean(),
    notes: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const jobId = await ctx.db.insert("printJobs", {
      userId: identity.subject,
      storeId: args.storeId,
      storeName: args.storeName,
      fileName: args.fileName,
      fileSize: args.fileSize,
      copies: args.copies,
      color: args.color,
      paperSize: args.paperSize,
      doubleSided: args.doubleSided,
      notes: args.notes,
      scheduledAt: args.scheduledAt,
      amount: args.amount,
      status: args.scheduledAt ? "scheduled" : "pending",
      createdAt: Date.now(),
    });

    return jobId;
  },
});

export const cancel = mutation({
  args: { jobId: v.id("printJobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Print job not found");
    if (job.userId !== identity.subject) throw new Error("Not authorized");

    await ctx.db.patch(args.jobId, { status: "cancelled" });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, pending: 0, completed: 0 };

    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      total: jobs.length,
      pending: jobs.filter(
        (j) =>
          j.status === "pending" ||
          j.status === "scheduled" ||
          j.status === "processing",
      ).length,
      completed: jobs.filter((j) => j.status === "completed").length,
    };
  },
});
