import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Extend the users table to include a name field
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),
  
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
    isPreTax: v.optional(v.boolean()), // Optional, default false (after-tax)
  })
    .index("by_dashboard", ["dashboardId"])
    .index("by_category", ["categoryId"])
    .index("by_dashboard_date", ["dashboardId", "date"]),
});
