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

const printerTypeValidator = v.union(
  v.literal("color"),
  v.literal("bw"),
  v.literal("micro"),
);

const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("printing"),
  v.literal("done"),
  v.literal("rejected"),
  v.literal("failed"),
  v.literal("retrying"),
);

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
      userType: v.optional(v.union(v.literal("customer"), v.literal("store_owner"))),
      phone: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("userType", ["userType"]),

    stores: defineTable({
      ownerId: v.string(),
      name: v.string(),
      uid: v.string(),
      phone: v.string(),
      address: addressValidator,
      latitude: v.number(),
      longitude: v.number(),
      status: v.union(v.literal("online"), v.literal("offline")),
      rates: rateValidator,
      autoAccept: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_owner", ["ownerId"])
      .index("by_uid", ["uid"])
      .index("by_status", ["status"]),

    orders: defineTable({
      customerId: v.string(),
      storeId: v.id("stores"),
      fileStorageId: v.string(),
      fileName: v.string(),
      pageCount: v.number(),
      binding: v.union(v.literal("none"), v.literal("one_pin"), v.literal("tape"), v.literal("spiral")),
      colorMode: v.union(v.literal("bw"), v.literal("color"), v.literal("micro")),
      copies: v.number(),
      customerPhone: v.string(),
      estimatedTotal: v.number(),
      status: orderStatusValidator,
      retryCount: v.number(),
      assignedPrinterId: v.optional(v.id("printers")),
      createdAt: v.number(),
      acceptedAt: v.optional(v.number()),
      printedAt: v.optional(v.number()),
      doneAt: v.optional(v.number()),
    })
      .index("by_customer", ["customerId"])
      .index("by_store", ["storeId"])
      .index("by_store_status", ["storeId", "status"])
      .index("by_customer_created", ["customerId", "createdAt"]),

    orderTimeline: defineTable({
      orderId: v.id("orders"),
      status: orderStatusValidator,
      message: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_order", ["orderId"])
      .index("by_order_created", ["orderId", "createdAt"]),

    printers: defineTable({
      storeId: v.id("stores"),
      name: v.string(),
      type: printerTypeValidator,
      status: v.union(v.literal("online"), v.literal("offline"), v.literal("error")),
      createdAt: v.number(),
    })
      .index("by_store", ["storeId"])
      .index("by_store_type", ["storeId", "type"]),

    messages: defineTable({
      orderId: v.id("orders"),
      userId: v.string(),
      userName: v.string(),
      content: v.string(),
      createdAt: v.number(),
    })
      .index("by_order", ["orderId"])
      .index("by_order_created", ["orderId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
