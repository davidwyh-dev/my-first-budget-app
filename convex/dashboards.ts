import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("dashboards")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("dashboards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const dashboard = await ctx.db.get(args.id);
    if (!dashboard || dashboard.userId !== userId) {
      return null;
    }
    return dashboard;
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    return await ctx.db.insert("dashboards", {
      userId,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dashboards"),
    name: v.optional(v.string()),
    beforeTaxIncome: v.optional(v.number()),
    zipCode: v.optional(v.string()),
    afterTaxIncome: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const dashboard = await ctx.db.get(args.id);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Dashboard not found");
    }
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: {
    id: v.id("dashboards"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const dashboard = await ctx.db.get(args.id);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Dashboard not found");
    }
    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("dashboards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const dashboard = await ctx.db.get(args.id);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Dashboard not found");
    }
    
    // Delete all categories for this dashboard
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_dashboard", (q) => q.eq("dashboardId", args.id))
      .collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }
    
    // Delete all transactions for this dashboard
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_dashboard", (q) => q.eq("dashboardId", args.id))
      .collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }
    
    // Delete the dashboard
    await ctx.db.delete(args.id);
  },
});
