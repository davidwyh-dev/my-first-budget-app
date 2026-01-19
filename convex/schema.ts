import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  dashboards: defineTable({
    userId: v.id("users"),
    name: v.string(),
    beforeTaxIncome: v.optional(v.number()),
    zipCode: v.optional(v.string()),
    afterTaxIncome: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  categories: defineTable({
    dashboardId: v.id("dashboards"),
    name: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    order: v.number(),
  })
    .index("by_dashboard", ["dashboardId"])
    .index("by_dashboard_order", ["dashboardId", "order"]),

  transactions: defineTable({
    dashboardId: v.id("dashboards"),
    categoryId: v.optional(v.id("categories")),
    description: v.string(),
    amount: v.number(),
    date: v.number(),
  })
    .index("by_dashboard", ["dashboardId"])
    .index("by_category", ["categoryId"])
    .index("by_dashboard_date", ["dashboardId", "date"]),
});
