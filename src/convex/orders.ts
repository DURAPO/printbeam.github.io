import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCustomer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", identity.subject))
      .order("desc")
      .take(50);

    return orders;
  },
});

export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== identity.subject) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);

    return orders;
  },
});

export const listByStoreAndStatus = query({
  args: {
    storeId: v.id("stores"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("printing"),
      v.literal("done"),
      v.literal("rejected"),
      v.literal("failed"),
      v.literal("retrying"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== identity.subject) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_store_status", (q) =>
        q.eq("storeId", args.storeId).eq("status", args.status),
      )
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    if (order.customerId === identity.subject) return { ...order, access: "customer" as const };

    const store = await ctx.db.get(order.storeId);
    if (store && store.ownerId === identity.subject) {
      return { ...order, access: "store" as const };
    }

    return null;
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    fileStorageId: v.string(),
    fileName: v.string(),
    pageCount: v.number(),
    binding: v.union(v.literal("none"), v.literal("one_pin"), v.literal("tape"), v.literal("spiral")),
    colorMode: v.union(v.literal("bw"), v.literal("color"), v.literal("micro")),
    copies: v.number(),
    customerPhone: v.string(),
    estimatedTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    if (store.status !== "online") throw new Error("Store is currently offline");

    const orderId = await ctx.db.insert("orders", {
      customerId: identity.subject,
      storeId: args.storeId,
      fileStorageId: args.fileStorageId,
      fileName: args.fileName,
      pageCount: args.pageCount,
      binding: args.binding,
      colorMode: args.colorMode,
      copies: args.copies,
      customerPhone: args.customerPhone,
      estimatedTotal: args.estimatedTotal,
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    });

    await ctx.db.insert("orderTimeline", {
      orderId,
      status: "pending",
      message: "Order submitted",
      createdAt: Date.now(),
    });

    if (store.autoAccept) {
      await ctx.db.patch(orderId, { status: "accepted", acceptedAt: Date.now() });
      await ctx.db.insert("orderTimeline", {
        orderId,
        status: "accepted",
        message: "Auto-accepted by store",
        createdAt: Date.now(),
      });
    }

    return orderId;
  },
});

export const accept = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    if (order.status !== "pending") throw new Error("Order is not in pending status");

    await ctx.db.patch(args.orderId, { status: "accepted", acceptedAt: Date.now() });
    await ctx.db.insert("orderTimeline", {
      orderId: args.orderId,
      status: "accepted",
      message: "Order accepted by store",
      createdAt: Date.now(),
    });

    return "accepted";
  },
});

export const reject = mutation({
  args: { orderId: v.id("orders"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    if (order.status !== "pending") throw new Error("Order is not in pending status");

    await ctx.db.patch(args.orderId, { status: "rejected" });
    await ctx.db.insert("orderTimeline", {
      orderId: args.orderId,
      status: "rejected",
      message: args.reason || "Order rejected by store",
      createdAt: Date.now(),
    });

    return "rejected";
  },
});

export const startPrinting = mutation({
  args: { orderId: v.id("orders"), printerId: v.id("printers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    if (order.status !== "accepted") throw new Error("Order must be accepted first");

    await ctx.db.patch(args.orderId, { status: "printing", assignedPrinterId: args.printerId });
    await ctx.db.insert("orderTimeline", {
      orderId: args.orderId,
      status: "printing",
      message: "Printing started",
      createdAt: Date.now(),
    });

    return "printing";
  },
});

export const markDone = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    await ctx.db.patch(args.orderId, { status: "done", doneAt: Date.now(), printedAt: Date.now() });
    await ctx.db.insert("orderTimeline", {
      orderId: args.orderId,
      status: "done",
      message: "Order completed",
      createdAt: Date.now(),
    });

    return "done";
  },
});

export const markFailed = mutation({
  args: { orderId: v.id("orders"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    await ctx.db.patch(args.orderId, { status: "failed" });
    await ctx.db.insert("orderTimeline", {
      orderId: args.orderId,
      status: "failed",
      message: args.reason || "Print job failed",
      createdAt: Date.now(),
    });

    return "failed";
  },
});

export const retry = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    if (order.status !== "failed") throw new Error("Only failed orders can be retried");

    await ctx.db.patch(args.orderId, {
      status: "retrying",
      retryCount: order.retryCount + 1,
    });
    await ctx.db.insert("orderTimeline", {
      orderId: args.orderId,
      status: "retrying",
      message: `Retry attempt #${order.retryCount + 1}`,
      createdAt: Date.now(),
    });

    return "retrying";
  },
});

export const getTimeline = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderTimeline")
      .withIndex("by_order_created", (q) => q.eq("orderId", args.orderId))
      .order("asc")
      .collect();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, active: 0, done: 0 };

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", identity.subject))
      .collect();

    return {
      total: orders.length,
      active: orders.filter(
        (o) => o.status === "pending" || o.status === "accepted" || o.status === "printing" || o.status === "retrying",
      ).length,
      done: orders.filter((o) => o.status === "done").length,
    };
  },
});
