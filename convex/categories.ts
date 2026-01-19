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
      .query("categories")
      .withIndex("by_dashboard_order", (q) => q.eq("dashboardId", args.dashboardId))
      .collect();
  },
});

export const create = mutation({
  args: {
    dashboardId: v.id("dashboards"),
    name: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
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
    
    // Get the highest order number
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_dashboard", (q) => q.eq("dashboardId", args.dashboardId))
      .collect();
    const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order), -1);
    
    return await ctx.db.insert("categories", {
      dashboardId: args.dashboardId,
      name: args.name,
      type: args.type,
      value: args.value,
      order: maxOrder + 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    value: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }
    const dashboard = await ctx.db.get(category.dashboardId);
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
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }
    const dashboard = await ctx.db.get(category.dashboardId);
    if (!dashboard || dashboard.userId !== userId) {
      throw new Error("Not authorized");
    }
    
    // Unassign transactions from this category
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();
    for (const transaction of transactions) {
      await ctx.db.patch(transaction._id, { categoryId: undefined });
    }
    
    await ctx.db.delete(args.id);
  },
});
