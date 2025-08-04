import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ambassadors = pgTable("ambassadors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  followerCount: integer("follower_count").notNull(),
  country: text("country").notNull(),
  logoUrl: text("logo_url"),
  pageName: text("page_name").notNull(),
  pageUrl: text("page_url").notNull().unique(),
  bio: text("bio"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  whatsapp: text("whatsapp").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ambassadorBusinesses = pgTable("ambassador_businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ambassadorId: varchar("ambassador_id").notNull().references(() => ambassadors.id),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  identityTag: text("identity_tag").notNull(),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ambassadorId: varchar("ambassador_id").notNull().references(() => ambassadors.id),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const supportedCountries = pgTable("supported_countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertAmbassadorSchema = createInsertSchema(ambassadors).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertAmbassadorBusinessSchema = createInsertSchema(ambassadorBusinesses).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  timestamp: true,
});

export const insertSupportedCountrySchema = createInsertSchema(supportedCountries).omit({
  id: true,
  createdAt: true,
});

// Types
export type Ambassador = typeof ambassadors.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type AmbassadorBusiness = typeof ambassadorBusinesses.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type SupportedCountry = typeof supportedCountries.$inferSelect;

export type InsertAmbassador = z.infer<typeof insertAmbassadorSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertAmbassadorBusiness = z.infer<typeof insertAmbassadorBusinessSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type InsertSupportedCountry = z.infer<typeof insertSupportedCountrySchema>;
