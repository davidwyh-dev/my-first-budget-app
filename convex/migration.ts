import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const importGuestData = mutation({
  args: {
    dashboards: v.array(
      v.object({
        tempId: v.string(),
        name: v.string(),
        beforeTaxIncome: v.optional(v.number()),
        zipCode: v.optional(v.string()),
        afterTaxIncome: v.optional(v.number()),
      })
    ),
    categories: v.array(
      v.object({
        tempId: v.string(),
        dashboardTempId: v.string(),
        name: v.string(),
        type: v.union(v.literal("percentage"), v.literal("fixed")),
        value: v.number(),
        order: v.number(),
      })
    ),
    transactions: v.array(
      v.object({
        dashboardTempId: v.string(),
        categoryTempId: v.optional(v.string()),
        description: v.string(),
        amount: v.number(),
        date: v.number(),
        isPreTax: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const dashboardIdMap = new Map<string, Id<"dashboards">>();
    const categoryIdMap = new Map<string, Id<"categories">>();
    const now = Date.now();

    for (const d of args.dashboards) {
      const id = await ctx.db.insert("dashboards", {
        userId,
        name: d.name,
        beforeTaxIncome: d.beforeTaxIncome,
        zipCode: d.zipCode,
        afterTaxIncome: d.afterTaxIncome,
        createdAt: now,
        updatedAt: now,
      });
      dashboardIdMap.set(d.tempId, id);
    }

    for (const c of args.categories) {
      const dashboardId = dashboardIdMap.get(c.dashboardTempId);
      if (!dashboardId) continue;
      const id = await ctx.db.insert("categories", {
        dashboardId,
        name: c.name,
        type: c.type,
        value: c.value,
        order: c.order,
      });
      categoryIdMap.set(c.tempId, id);
    }

    for (const t of args.transactions) {
      const dashboardId = dashboardIdMap.get(t.dashboardTempId);
      if (!dashboardId) continue;
      const categoryId = t.categoryTempId
        ? categoryIdMap.get(t.categoryTempId)
        : undefined;
      await ctx.db.insert("transactions", {
        dashboardId,
        categoryId,
        description: t.description,
        amount: t.amount,
        date: t.date,
        isPreTax: t.isPreTax,
      });
    }

    const firstTempId = args.dashboards[0]?.tempId;
    return firstTempId ? dashboardIdMap.get(firstTempId) ?? null : null;
  },
});
