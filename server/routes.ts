import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAmbassadorSchema, insertBusinessSchema, insertAmbassadorBusinessSchema } from "@shared/schema";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';

const createAmbassadorRequestSchema = z.object({
  ambassador: insertAmbassadorSchema,
  businessIds: z.array(z.string()).optional().default([]),
});

// Server-side Supabase client for authentication
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

let supabaseServer: any = null
if (supabaseUrl && supabaseAnonKey) {
  supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Supabase configuration endpoint for frontend
  app.get("/api/supabase-config", (req, res) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Supabase configuration not available on server" })
    }
    
    res.json({
      url: supabaseUrl,
      key: supabaseAnonKey
    })
  })

  // Authentication proxy endpoints
  app.post("/api/auth/signup", async (req, res) => {
    if (!supabaseServer) {
      return res.status(500).json({ error: "Authentication service not configured" })
    }

    try {
      const { email, password, options } = req.body
      
      // Log the signup attempt for debugging
      console.log(`Signup attempt for email: ${email}`)
      
      const { data, error } = await supabaseServer.auth.signUp({
        email,
        password,
        options
      })

      if (error) {
        console.error("Supabase signup error:", error)
        // Handle specific Supabase email validation errors
        if (error.message.includes('invalid') && email.includes('.marketing')) {
          return res.status(400).json({ 
            error: `Supabase doesn't recognize .marketing domain. The email ${email} needs to be allowlisted in your Supabase project settings under Authentication > Settings > Allow additional domains.`
          })
        }
        return res.status(400).json({ error: error.message })
      }

      console.log(`Signup successful for: ${email}`)
      res.json(data)
    } catch (error) {
      console.error("Signup error:", error)
      res.status(500).json({ error: "Signup failed" })
    }
  })

  app.post("/api/auth/signin", async (req, res) => {
    if (!supabaseServer) {
      return res.status(500).json({ error: "Authentication service not configured" })
    }

    try {
      const { email, password } = req.body
      
      console.log(`Signin attempt for email: ${email}`)
      
      const { data, error } = await supabaseServer.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error("Supabase signin error:", error)
        // Handle specific authentication errors
        if (error.message.includes('invalid') && email.includes('.marketing')) {
          return res.status(400).json({ 
            error: `Authentication failed for .marketing domain. Please ensure ${email} is allowlisted in your Supabase project settings.`
          })
        }
        return res.status(400).json({ error: error.message })
      }

      console.log(`Signin successful for: ${email}`)
      res.json(data)
    } catch (error) {
      console.error("Signin error:", error)
      res.status(500).json({ error: "Signin failed" })
    }
  })

  app.post("/api/auth/logout", async (req, res) => {
    try {
      res.json({ success: true })
    } catch (error) {
      console.error("Logout error:", error)
      res.status(500).json({ error: "Logout failed" })
    }
  })

  // Ambassador routes
  app.get("/api/ambassadors", async (req, res) => {
    try {
      const ambassadors = await storage.getAllAmbassadors();
      res.json(ambassadors);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      res.status(500).json({ error: "Failed to fetch ambassadors" });
    }
  });

  app.post("/api/ambassadors", async (req, res) => {
    try {
      const { ambassador: ambassadorData, businessIds } = createAmbassadorRequestSchema.parse(req.body);
      
      // Create the ambassador
      const ambassador = await storage.createAmbassador(ambassadorData);
      
      // Link businesses to ambassador
      for (const businessId of businessIds) {
        await storage.addBusinessToAmbassador({
          ambassadorId: ambassador.id,
          businessId,
        });
      }
      
      res.json(ambassador);
    } catch (error) {
      console.error("Error creating ambassador:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to create ambassador" 
      });
    }
  });

  app.get("/api/ambassadors/:pageUrl", async (req, res) => {
    try {
      const { pageUrl } = req.params;
      const ambassador = await storage.getAmbassadorByPageUrl(pageUrl);
      
      if (!ambassador) {
        return res.status(404).json({ error: "Ambassador not found" });
      }
      
      res.json(ambassador);
    } catch (error) {
      console.error("Error fetching ambassador:", error);
      res.status(500).json({ error: "Failed to fetch ambassador" });
    }
  });

  app.get("/api/ambassadors/:pageUrl/businesses", async (req, res) => {
    try {
      const { pageUrl } = req.params;
      const ambassador = await storage.getAmbassadorByPageUrl(pageUrl);
      
      if (!ambassador) {
        return res.status(404).json({ error: "Ambassador not found" });
      }
      
      const businesses = await storage.getBusinessesByAmbassador(ambassador.id);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching ambassador businesses:", error);
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  // Business routes
  app.get("/api/businesses", async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  app.post("/api/businesses", async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(businessData);
      res.json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to create business" 
      });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const business = await storage.getBusiness(id);
      
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });

  // Review routes
  app.get("/api/businesses/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getReviewsByBusiness(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Referral tracking (for future analytics)
  app.post("/api/referrals", async (req, res) => {
    try {
      const referralData = {
        ambassadorId: req.body.ambassadorId,
        businessId: req.body.businessId,
      };
      
      const referral = await storage.createReferral(referralData);
      res.json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ error: "Failed to create referral" });
    }
  });

  // Test endpoint to create sample data for testing
  app.post("/api/test/create-sample-data", async (req, res) => {
    try {
      // Create sample ambassador
      const ambassador = await storage.createAmbassador({
        name: "Mike Johnson",
        platform: "YouTube",
        followerCount: 25000,
        country: "PA",
        logoUrl: null,
        pageName: "Mike's Panama Network",
        pageUrl: "mikes-panama-network",
        bio: "Helping Black families relocate to Panama since 2021"
      });

      // Create sample businesses
      const business1 = await storage.createBusiness({
        name: "Rodriguez Immigration Law",
        category: "Immigration Lawyer",
        whatsapp: "50765551234",
        location: "Panama City",
        description: "Expert immigration services for expats moving to Panama"
      });

      const business2 = await storage.createBusiness({
        name: "Panama Relocation Services",
        category: "Personal Relocation Consultant",
        whatsapp: "50765554567",
        location: "David",
        description: "Complete relocation assistance for families and individuals"
      });

      // Link businesses to ambassador
      await storage.addBusinessToAmbassador({
        ambassadorId: ambassador.id,
        businessId: business1.id,
      });

      await storage.addBusinessToAmbassador({
        ambassadorId: ambassador.id,
        businessId: business2.id,
      });

      res.json({ 
        message: "Sample data created successfully",
        ambassador,
        businesses: [business1, business2]
      });
    } catch (error) {
      console.error("Error creating sample data:", error);
      res.status(500).json({ error: "Failed to create sample data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
