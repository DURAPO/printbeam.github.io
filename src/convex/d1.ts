/**
 * Convex actions for Cloudflare D1 database operations.
 * All functions run server-side with Node.js runtime for REST API access.
 */
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  d1Query,
  d1Execute,
  d1Batch,
  d1Metadata,
} from "./d1Client";

// ─── Audit Logs ───────────────────────────────────────────

/** Log an audit event to D1 */
export const logAuditEvent = action({
  args: {
    eventType: v.string(),
    userId: v.optional(v.string()),
    storeId: v.optional(v.string()),
    orderId: v.optional(v.string()),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const result = await d1Execute(
      `INSERT INTO audit_logs (event_type, user_id, store_id, order_id, details, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        args.eventType,
        args.userId ?? null,
        args.storeId ?? null,
        args.orderId ?? null,
        args.details ?? null,
        args.ipAddress ?? null,
        args.userAgent ?? null,
      ],
    );
    return { success: true, rowId: result.meta.last_row_id };
  },
});

/** Query audit logs with optional filters */
export const queryAuditLogs = action({
  args: {
    eventType: v.optional(v.string()),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    let sql = "SELECT * FROM audit_logs WHERE 1=1";
    const params: unknown[] = [];

    if (args.eventType) {
      sql += " AND event_type = ?";
      params.push(args.eventType);
    }
    if (args.userId) {
      sql += " AND user_id = ?";
      params.push(args.userId);
    }

    sql += " ORDER BY created_at DESC";
    sql += ` LIMIT ?`;
    params.push(args.limit ?? 50);

    if (args.offset) {
      sql += " OFFSET ?";
      params.push(args.offset);
    }

    return d1Query(sql, params);
  },
});

// ─── Analytics Events ─────────────────────────────────────

/** Track an analytics event in D1 */
export const trackEvent = action({
  args: {
    eventName: v.string(),
    userId: v.optional(v.string()),
    storeId: v.optional(v.string()),
    page: v.optional(v.string()),
    properties: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const result = await d1Execute(
      `INSERT INTO analytics_events (event_name, user_id, store_id, page, properties, session_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        args.eventName,
        args.userId ?? null,
        args.storeId ?? null,
        args.page ?? null,
        args.properties ?? null,
        args.sessionId ?? null,
      ],
    );
    return { success: true, rowId: result.meta.last_row_id };
  },
});

/** Query analytics events with optional filters */
export const queryAnalytics = action({
  args: {
    eventName: v.optional(v.string()),
    userId: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    let sql = "SELECT * FROM analytics_events WHERE 1=1";
    const params: unknown[] = [];

    if (args.eventName) {
      sql += " AND event_name = ?";
      params.push(args.eventName);
    }
    if (args.userId) {
      sql += " AND user_id = ?";
      params.push(args.userId);
    }
    if (args.startDate) {
      sql += " AND created_at >= ?";
      params.push(args.startDate);
    }
    if (args.endDate) {
      sql += " AND created_at <= ?";
      params.push(args.endDate);
    }

    sql += " ORDER BY created_at DESC";
    sql += " LIMIT ?";
    params.push(args.limit ?? 100);

    return d1Query(sql, params);
  },
});

// ─── Store Metrics ────────────────────────────────────────

/** Upsert daily store metrics */
export const upsertStoreMetrics = action({
  args: {
    storeId: v.string(),
    date: v.string(),
    totalOrders: v.number(),
    completedOrders: v.number(),
    failedOrders: v.number(),
    totalRevenue: v.number(),
    avgPrintTime: v.number(),
  },
  handler: async (_ctx, args) => {
    const result = await d1Execute(
      `INSERT INTO store_metrics (store_id, date, total_orders, completed_orders, failed_orders, total_revenue, avg_print_time, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(store_id, date) DO UPDATE SET
         total_orders = excluded.total_orders,
         completed_orders = excluded.completed_orders,
         failed_orders = excluded.failed_orders,
         total_revenue = excluded.total_revenue,
         avg_print_time = excluded.avg_print_time,
         updated_at = datetime('now')`,
      [
        args.storeId,
        args.date,
        args.totalOrders,
        args.completedOrders,
        args.failedOrders,
        args.totalRevenue,
        args.avgPrintTime,
      ],
    );
    return { success: true, changes: result.meta.changes };
  },
});

/** Get store metrics for a date range */
export const getStoreMetrics = action({
  args: {
    storeId: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    let sql = "SELECT * FROM store_metrics WHERE store_id = ?";
    const params: unknown[] = [args.storeId];

    if (args.startDate) {
      sql += " AND date >= ?";
      params.push(args.startDate);
    }
    if (args.endDate) {
      sql += " AND date <= ?";
      params.push(args.endDate);
    }

    sql += " ORDER BY date DESC";

    return d1Query(sql, params);
  },
});

// ─── Database Info ────────────────────────────────────────

/** Get D1 database metadata */
export const getDatabaseInfo = action({
  args: {},
  handler: async () => {
    return d1Metadata();
  },
});

/** Run a raw SQL query (admin only) */
export const rawQuery = action({
  args: {
    sql: v.string(),
    params: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, args) => {
    return d1Query(args.sql, args.params ?? []);
  },
});
