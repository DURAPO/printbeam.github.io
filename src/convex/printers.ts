import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const PRINTER_LIMITS = { color: 6, bw: 7, micro: 5 } as const;

export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("printers")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

export const listOnlineByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const printers = await ctx.db
      .query("printers")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
    return printers.filter((p) => p.status === "online");
  },
});

export const listOnlineByStoreAndType = query({
  args: {
    storeId: v.id("stores"),
    type: v.union(v.literal("color"), v.literal("bw"), v.literal("micro")),
  },
  handler: async (ctx, args) => {
    const printers = await ctx.db
      .query("printers")
      .withIndex("by_store_type", (q) =>
        q.eq("storeId", args.storeId).eq("type", args.type),
      )
      .collect();
    return printers.filter((p) => p.status === "online");
  },
});

export const add = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    type: v.union(v.literal("color"), v.literal("bw"), v.literal("micro")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    const existing = await ctx.db
      .query("printers")
      .withIndex("by_store_type", (q) =>
        q.eq("storeId", args.storeId).eq("type", args.type),
      )
      .collect();

    const limit = PRINTER_LIMITS[args.type];
    if (existing.length >= limit) {
      throw new Error(`Maximum ${limit} ${args.type} printers allowed`);
    }

    return await ctx.db.insert("printers", {
      storeId: args.storeId,
      name: args.name,
      type: args.type,
      status: "online",
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { printerId: v.id("printers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const printer = await ctx.db.get(args.printerId);
    if (!printer) throw new Error("Printer not found");

    const store = await ctx.db.get(printer.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    await ctx.db.delete(args.printerId);
    return "deleted";
  },
});

export const toggleStatus = mutation({
  args: { printerId: v.id("printers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const printer = await ctx.db.get(args.printerId);
    if (!printer) throw new Error("Printer not found");

    const store = await ctx.db.get(printer.storeId);
    if (!store || store.ownerId !== identity.subject) throw new Error("Not authorized");

    const newStatus = printer.status === "online" ? "offline" : "online";
    await ctx.db.patch(args.printerId, { status: newStatus });
    return newStatus;
  },
});
