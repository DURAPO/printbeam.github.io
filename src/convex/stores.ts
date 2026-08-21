import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const rateValidator = v.object({
  onePin: v.number(),
  tape: v.number(),
  spiral: v.number(),
  bwPerPage: v.number(),
  colorPerPage: v.number(),
  microPerPage: v.number(),
});

const addressValidator = v.object({
  street: v.string(),
  road: v.optional(v.string()),
  area: v.optional(v.string()),
  city: v.string(),
  pincode: v.string(),
});

function generateStoreUid(name: string, phone: string): string {
  const letters = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const digits = phone.replace(/[^0-9]/g, "").slice(-Math.max(4, 14 - letters.length));
  return (letters + digits).slice(0, 18);
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const listOnline = query({
  args: {
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stores = await ctx.db
      .query("stores")
      .withIndex("by_status", (q) => q.eq("status", "online"))
      .collect();

    return stores.map((store) => ({
      ...store,
      distance:
        args.latitude !== undefined && args.longitude !== undefined
          ? haversineDistance(args.latitude, args.longitude, store.latitude, store.longitude)
          : null,
    }));
  },
});

export const listByOwner = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .collect();
  },
});

export const get = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

export const getByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .first();
    if (!store) return null;
    return {
      ...store,
      valid: true,
      online: store.status === "online",
    };
  },
});

export const validateUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const uid = args.uid.trim();
    if (uid.length < 6 || uid.length > 18) {
      return { valid: false, error: "UID must be 6–18 characters" as const };
    }
    const letters = uid.replace(/[^a-zA-Z]/g, "");
    const digits = uid.replace(/[^0-9]/g, "");
    if (letters.length < 2 || letters.length > 4) {
      return { valid: false, error: "Must have 2–4 letters" as const };
    }
    if (digits.length < 4 || digits.length > 14) {
      return { valid: false, error: "Must have 4–14 digits" as const };
    }
    const store = await ctx.db
      .query("stores")
      .withIndex("by_uid", (q) => q.eq("uid", uid))
      .first();
    if (!store) return { valid: false, error: "Store not found" as const };
    if (store.status === "offline") {
      return { valid: false, error: "Store is currently offline" as const, storeId: store._id };
    }
    return { valid: true, storeId: store._id, storeName: store.name };
  },
});

export const confirmStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) return { confirmed: false, error: "Store not found" as const };
    if (store.status !== "online") {
      return { confirmed: false, error: "Store is currently offline" as const };
    }
    return { confirmed: true, storeName: store.name, rates: store.rates };
  },
});

export const createStore = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    address: addressValidator,
    latitude: v.number(),
    longitude: v.number(),
    rates: rateValidator,
    customUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingStore = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .first();
    if (existingStore) throw new Error("You already have a store. Each owner can only create one store.");

    let uid = args.customUid?.trim() || generateStoreUid(args.name, args.phone);
    uid = uid.toUpperCase();

    if (uid.length < 6 || uid.length > 18) {
      throw new Error("Store UID must be 6–18 characters");
    }
    const letters = uid.replace(/[^a-zA-Z]/g, "");
    const digits = uid.replace(/[^0-9]/g, "");
    if (letters.length < 2 || letters.length > 4 || digits.length < 4 || digits.length > 14) {
      throw new Error("UID must have 2–4 letters and 4–14 digits");
    }

    const existingUid = await ctx.db
      .query("stores")
      .withIndex("by_uid", (q) => q.eq("uid", uid))
      .first();
    if (existingUid) throw new Error(`UID "${uid}" is already taken. Try a different one.`);

    const storeId = await ctx.db.insert("stores", {
      ownerId: identity.subject,
      name: args.name,
      uid,
      phone: args.phone,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "online",
      rates: args.rates,
      autoAccept: false,
      createdAt: Date.now(),
    });

    await ctx.db.patch(identity.subject as any, { userType: "store_owner" });

    return storeId;
  },
});

export const updateStore = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(addressValidator),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    rates: v.optional(rateValidator),
    customUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    if (store.ownerId !== identity.subject) throw new Error("Not authorized");

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.address !== undefined) updates.address = args.address;
    if (args.latitude !== undefined) updates.latitude = args.latitude;
    if (args.longitude !== undefined) updates.longitude = args.longitude;
    if (args.rates !== undefined) updates.rates = args.rates;

    if (args.customUid !== undefined && args.customUid.trim() !== store.uid) {
      const newUid = args.customUid.trim().toUpperCase();
      if (newUid.length < 6 || newUid.length > 18) {
        throw new Error("UID must be 6–18 characters");
      }
      const l = newUid.replace(/[^a-zA-Z]/g, "");
      const d = newUid.replace(/[^0-9]/g, "");
      if (l.length < 2 || l.length > 4 || d.length < 4 || d.length > 14) {
        throw new Error("UID must have 2–4 letters and 4–14 digits");
      }
      const dup = await ctx.db
        .query("stores")
        .withIndex("by_uid", (q) => q.eq("uid", newUid))
        .first();
      if (dup) throw new Error(`UID "${newUid}" is already taken`);
      updates.uid = newUid;
    }

    await ctx.db.patch(args.storeId, updates);
    return "updated";
  },
});

export const toggleOnline = mutation({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    if (store.ownerId !== identity.subject) throw new Error("Not authorized");

    const newStatus = store.status === "online" ? "offline" : "online";
    await ctx.db.patch(args.storeId, { status: newStatus });
    return newStatus;
  },
});

export const toggleAutoAccept = mutation({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    if (store.ownerId !== identity.subject) throw new Error("Not authorized");

    await ctx.db.patch(args.storeId, { autoAccept: !store.autoAccept });
    return !store.autoAccept;
  },
});
