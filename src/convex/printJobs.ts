import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** List print orders for the current user (customer dashboard). */
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", identity.subject))
      .order("desc")
      .take(50);

    // Enrich with store names
    return Promise.all(
      orders.map(async (order) => {
        const store = await ctx.db.get(order.storeId);
        return {
          ...order,
          storeName: store?.name ?? "Unknown",
        };
      }),
    );
  },
});

/** Get a single order (customer or store owner access). */
export const get = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    if (order.customerId === identity.subject) {
      const store = await ctx.db.get(order.storeId);
      return { ...order, storeName: store?.name ?? "Unknown", access: "customer" as const };
    }

    const store = await ctx.db.get(order.storeId);
    if (store && store.ownerId === identity.subject) {
      return { ...order, storeName: store.name, access: "store" as const };
    }

    return null;
  },
});

/** Stats for the customer dashboard. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, active: 0, completed: 0 };

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", identity.subject))
      .collect();

    return {
      total: orders.length,
      active: orders.filter(
        (o) => o.status === "pending" || o.status === "accepted" || o.status === "printing" || o.status === "retrying",
      ).length,
      completed: orders.filter((o) => o.status === "done").length,
    };
  },
});

// Legacy create/cancel stubs kept for import compatibility — all real mutations go through orders.ts
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
  },
  handler: async () => {
    throw new Error("Use orders.create instead");
  },
});

export const cancel = mutation({
  args: { jobId: v.id("orders") },
  handler: async () => {
    throw new Error("Use orders.reject instead");
  },
});
