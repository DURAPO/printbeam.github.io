import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    stores: defineTable({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      phone: v.optional(v.string()),
      hours: v.optional(v.string()),
      status: v.union(v.literal("open"), v.literal("closed"), v.literal("busy")),
    }).index("by_status", ["status"]),

    printJobs: defineTable({
      userId: v.string(),
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
      status: v.union(
        v.literal("pending"),
        v.literal("scheduled"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_user_created", ["userId", "createdAt"]),

    messages: defineTable({
      printJobId: v.id("printJobs"),
      userId: v.string(),
      userName: v.optional(v.string()),
      content: v.string(),
      createdAt: v.number(),
    })
      .index("by_job", ["printJobId"])
      .index("by_job_created", ["printJobId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
