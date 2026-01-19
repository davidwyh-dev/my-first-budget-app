import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { dashboardId: v.id("dashboards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const dashboard = await ctx.db.get(args.dashboardId);
    if (!dashboard || dashboard.userId !== userId) {
      return [];
    }
    return await ctx.db
      .query("transactions")
      .withIndex("by_dashboard_date", (q) => q.eq("dashboardId", args.dashboardId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    dashboardId: v.id("dashboards"),
    categoryId: v.optional(v.id("categories")),
    description: v.string(),
    amount: v.number(),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const dashboard = await ctx.db.get(args.dashboardId);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Dashboard not found");
    }
    
    return await ctx.db.insert("transactions", {
      dashboardId: args.dashboardId,
      categoryId: args.categoryId,
      description: args.description,
      amount: args.amount,
      date: args.date,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    categoryId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    const dashboard = await ctx.db.get(transaction.dashboardId);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Not authorized");
    }
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    const dashboard = await ctx.db.get(transaction.dashboardId);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Not authorized");
    }
    await ctx.db.delete(args.id);
  },
});
