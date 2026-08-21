import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").collect();
  },
});

export const get = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stores").first();
    if (existing) return "already_seeded";

    const stores = [
      {
        name: "Pressroom A — Downtown",
        address: "142 Main St, Suite 200",
        city: "Portland",
        phone: "(503) 555-0101",
        hours: "Mon–Fri 7am–7pm",
        status: "open" as const,
      },
      {
        name: "Pressroom B — Eastside",
        address: "780 NE Broadway",
        city: "Portland",
        phone: "(503) 555-0202",
        hours: "Mon–Fri 7am–7pm, Sat 9am–4pm",
        status: "open" as const,
      },
      {
        name: "Pressroom C — Pearl District",
        address: "305 NW 12th Ave",
        city: "Portland",
        phone: "(503) 555-0303",
        hours: "Mon–Fri 8am–6pm",
        status: "busy" as const,
      },
      {
        name: "Pressroom D — Lake Oswego",
        address: "45 1st St",
        city: "Lake Oswego",
        phone: "(503) 555-0404",
        hours: "Mon–Fri 8am–5pm",
        status: "open" as const,
      },
      {
        name: "Pressroom E — Beaverton",
        address: "2100 SW Cedar Hills Blvd",
        city: "Beaverton",
        phone: "(503) 555-0505",
        hours: "Mon–Sat 8am–8pm, Sun 10am–5pm",
        status: "closed" as const,
      },
    ];

    for (const store of stores) {
      await ctx.db.insert("stores", store);
    }
    return "seeded";
  },
});
