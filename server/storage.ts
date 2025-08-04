import type { 
  Ambassador, 
  InsertAmbassador, 
  Business, 
  InsertBusiness,
  AmbassadorBusiness,
  InsertAmbassadorBusiness,
  Review,
  InsertReview,
  Referral,
  InsertReferral,
  SupportedCountry
} from "@shared/schema";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  ambassadors, 
  businesses, 
  ambassadorBusinesses, 
  reviews, 
  referrals,
  supportedCountries
} from "@shared/schema";
import { eq, and, asc } from "drizzle-orm";

export interface IStorage {
  // Ambassador operations
  getAllAmbassadors(): Promise<Ambassador[]>;
  getAmbassador(id: string): Promise<Ambassador | undefined>;
  getAmbassadorByPageUrl(pageUrl: string): Promise<Ambassador | undefined>;
  createAmbassador(ambassador: InsertAmbassador): Promise<Ambassador>;
  
  // Business operations
  getAllBusinesses(): Promise<Business[]>;
  getBusiness(id: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessesByAmbassador(ambassadorId: string): Promise<Business[]>;
  
  // Ambassador-Business relationship operations
  addBusinessToAmbassador(data: InsertAmbassadorBusiness): Promise<AmbassadorBusiness>;
  removeBusinessFromAmbassador(ambassadorId: string, businessId: string): Promise<void>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByBusiness(businessId: string): Promise<Review[]>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByAmbassador(ambassadorId: string): Promise<Referral[]>;
  
  // Country operations
  getSupportedCountries(): Promise<SupportedCountry[]>;
}

export class MemStorage implements IStorage {
  private ambassadors: Map<string, Ambassador> = new Map();
  private businesses: Map<string, Business> = new Map();
  private ambassadorBusinesses: Map<string, AmbassadorBusiness> = new Map();
  private reviews: Map<string, Review> = new Map();
  private referrals: Map<string, Referral> = new Map();

  // Ambassador operations
  async getAllAmbassadors(): Promise<Ambassador[]> {
    return Array.from(this.ambassadors.values());
  }

  async getAmbassador(id: string): Promise<Ambassador | undefined> {
    return this.ambassadors.get(id);
  }

  async getAmbassadorByPageUrl(pageUrl: string): Promise<Ambassador | undefined> {
    return Array.from(this.ambassadors.values()).find(
      (ambassador) => ambassador.pageUrl === pageUrl
    );
  }

  async createAmbassador(insertAmbassador: InsertAmbassador): Promise<Ambassador> {
    const id = randomUUID();
    const ambassador: Ambassador = {
      ...insertAmbassador,
      id,
      logoUrl: insertAmbassador.logoUrl || null,
      bio: insertAmbassador.bio || null,
      verified: false,
      createdAt: new Date(),
    };
    this.ambassadors.set(id, ambassador);
    return ambassador;
  }

  // Business operations
  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }

  async getBusiness(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = randomUUID();
    const business: Business = {
      ...insertBusiness,
      id,
      description: insertBusiness.description || null,
      verified: false,
      createdAt: new Date(),
    };
    this.businesses.set(id, business);
    return business;
  }

  async getBusinessesByAmbassador(ambassadorId: string): Promise<Business[]> {
    const relationshipIds = Array.from(this.ambassadorBusinesses.values())
      .filter(rel => rel.ambassadorId === ambassadorId)
      .map(rel => rel.businessId);
    
    return relationshipIds
      .map(id => this.businesses.get(id))
      .filter((business): business is Business => business !== undefined);
  }

  // Ambassador-Business relationship operations
  async addBusinessToAmbassador(data: InsertAmbassadorBusiness): Promise<AmbassadorBusiness> {
    const id = randomUUID();
    const relationship: AmbassadorBusiness = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.ambassadorBusinesses.set(id, relationship);
    return relationship;
  }

  async removeBusinessFromAmbassador(ambassadorId: string, businessId: string): Promise<void> {
    const relationshipToRemove = Array.from(this.ambassadorBusinesses.entries()).find(
      ([, rel]) => rel.ambassadorId === ambassadorId && rel.businessId === businessId
    );
    
    if (relationshipToRemove) {
      this.ambassadorBusinesses.delete(relationshipToRemove[0]);
    }
  }

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      feedback: insertReview.feedback || null,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.businessId === businessId
    );
  }

  // Referral operations
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = randomUUID();
    const referral: Referral = {
      ...insertReferral,
      id,
      timestamp: new Date(),
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getReferralsByAmbassador(ambassadorId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.ambassadorId === ambassadorId
    );
  }

  // Country operations
  async getSupportedCountries(): Promise<SupportedCountry[]> {
    // For memory storage, return static list
    return [
      { id: '1', name: 'United States', slug: 'united-states', isActive: true, createdAt: new Date() },
      { id: '2', name: 'Brazil', slug: 'brazil', isActive: true, createdAt: new Date() },
      { id: '3', name: 'Colombia', slug: 'colombia', isActive: true, createdAt: new Date() },
      { id: '4', name: 'Costa Rica', slug: 'costa-rica', isActive: true, createdAt: new Date() },
      { id: '5', name: 'France', slug: 'france', isActive: true, createdAt: new Date() },
      { id: '6', name: 'Mexico', slug: 'mexico', isActive: true, createdAt: new Date() },
      { id: '7', name: 'Panama', slug: 'panama', isActive: true, createdAt: new Date() },
      { id: '8', name: 'Portugal', slug: 'portugal', isActive: true, createdAt: new Date() },
      { id: '9', name: 'Spain', slug: 'spain', isActive: true, createdAt: new Date() },
      { id: '10', name: 'Thailand', slug: 'thailand', isActive: true, createdAt: new Date() }
    ].sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Database storage implementation using Supabase
export class DatabaseStorage implements IStorage {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  private db = drizzle(
    postgres(process.env.DATABASE_URL!, { 
      max: 1,
      ssl: 'require'
    })
  );

  // Ambassador operations
  async getAllAmbassadors(): Promise<Ambassador[]> {
    const result = await this.db.select().from(ambassadors);
    return result;
  }

  async getAmbassador(id: string): Promise<Ambassador | undefined> {
    const results = await this.db.select().from(ambassadors).where(eq(ambassadors.id, id));
    return results[0];
  }

  async getAmbassadorByPageUrl(pageUrl: string): Promise<Ambassador | undefined> {
    const results = await this.db.select().from(ambassadors).where(eq(ambassadors.pageUrl, pageUrl));
    return results[0];
  }

  async createAmbassador(insertAmbassador: InsertAmbassador): Promise<Ambassador> {
    const results = await this.db.insert(ambassadors).values(insertAmbassador).returning();
    return results[0];
  }

  // Business operations
  async getAllBusinesses(): Promise<Business[]> {
    const result = await this.db.select().from(businesses);
    return result;
  }

  async getBusiness(id: string): Promise<Business | undefined> {
    const results = await this.db.select().from(businesses).where(eq(businesses.id, id));
    return results[0];
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const results = await this.db.insert(businesses).values(insertBusiness).returning();
    return results[0];
  }

  async getBusinessesByAmbassador(ambassadorId: string): Promise<Business[]> {
    const results = await this.db
      .select({
        id: businesses.id,
        name: businesses.name,
        category: businesses.category,
        whatsapp: businesses.whatsapp,
        location: businesses.location,
        description: businesses.description,
        verified: businesses.verified,
        createdAt: businesses.createdAt,
      })
      .from(businesses)
      .innerJoin(ambassadorBusinesses, eq(businesses.id, ambassadorBusinesses.businessId))
      .where(eq(ambassadorBusinesses.ambassadorId, ambassadorId));
    
    return results;
  }

  // Ambassador-Business relationship operations
  async addBusinessToAmbassador(data: InsertAmbassadorBusiness): Promise<AmbassadorBusiness> {
    const results = await this.db.insert(ambassadorBusinesses).values(data).returning();
    return results[0];
  }

  async removeBusinessFromAmbassador(ambassadorId: string, businessId: string): Promise<void> {
    await this.db.delete(ambassadorBusinesses).where(
      and(
        eq(ambassadorBusinesses.ambassadorId, ambassadorId),
        eq(ambassadorBusinesses.businessId, businessId)
      )
    );
  }

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const results = await this.db.insert(reviews).values(insertReview).returning();
    return results[0];
  }

  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    return await this.db.select().from(reviews).where(eq(reviews.businessId, businessId));
  }

  // Referral operations
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const results = await this.db.insert(referrals).values(insertReferral).returning();
    return results[0];
  }

  async getReferralsByAmbassador(ambassadorId: string): Promise<Referral[]> {
    return await this.db.select().from(referrals).where(eq(referrals.ambassadorId, ambassadorId));
  }

  // Country operations
  async getSupportedCountries(): Promise<SupportedCountry[]> {
    const result = await this.db
      .select()
      .from(supportedCountries)
      .where(eq(supportedCountries.isActive, true))
      .orderBy(asc(supportedCountries.name));
    return result;
  }
}

// Use database storage when DATABASE_URL is available, memory storage as fallback
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
