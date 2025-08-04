# Comuniti v2 Platform

## Overview

Comuniti v2 is a trust-based platform that connects expat influencers (ambassadors) with recommended service providers in global relocation hubs. The platform allows influencers to curate and share lists of trusted local businesses while enabling service providers to gain visibility through verified community recommendations. Built as a full-stack TypeScript application, it features a React frontend with shadcn/ui components and an Express backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 4, 2025:**
- **Complete Onboarding Test Validation**: Verified all ambassador directory fields display correctly in public view
- **Database Logging Enhanced**: Added comprehensive console logging for ambassador creation with field validation
- **Field Display Confirmed**: All required fields properly shown in directory (name, country, platform, follower count, branding, list name, business links)
- **API Integration Tested**: Created 10 test ambassadors across multiple platforms and countries with business connections
- **Onboarding Flow Refactored**: Cleaned up ambassador onboarding by moving country selection to account creation step and enforcing follower threshold before progression
- **Account Creation Enhanced**: /onboarding/ambassador/account now collects email, password, full name, country, and optional profile image
- **Platform Selection Streamlined**: /onboarding/ambassador now focuses solely on platform and follower count with threshold enforcement
- **Follower Threshold Implemented**: Configurable minimum follower count (default: 1) blocks progression if not met, showing waitlist message
- **Data Flow Optimized**: Removed duplicate inputs and ensured all data remains accessible for public directory display
- **Country Field Relocated**: Moved from platform selection step to account creation for better logical flow

**January 4, 2025 (Earlier):**
- **Trust Metrics Updated**: Replaced star ratings with "Member since [Month Year]" format using ambassador creation dates
- **Layout Improvements**: Removed referral numbers and optimized stats grid from 3 to 2 columns for better visual balance
- **Image Display Fixed**: Resolved ambassador profile photo loading issues by handling both logoUrl and logo_url field names
- **Authentication System Fixed**: Resolved complete authentication failure for .marketing email domains
- **Backend Authentication Proxy**: Implemented server-side authentication endpoints (/api/auth/signup, /api/auth/signin, /api/auth/logout)
- **Email Confirmation Flow**: Added complete email confirmation system with /auth/email-confirmation page and callback handling
- **Supabase Integration**: Fixed frontend-backend Supabase connection using backend proxy due to missing VITE_ environment variables
- **Enhanced Error Handling**: Specific messaging for .marketing domain issues and Supabase configuration guidance
- **Email Verification**: Users now receive confirmation emails and are guided through the verification process
- **User Experience**: Seamless redirect flow from signup → email confirmation → onboarding continuation

**January 3, 2025:**
- **MVP Language Features**: Implemented complete multi-language support (EN/ES/PT) with language selector in upper right of landing and ambassador pages
- **Social Media Integration**: Added follower count input fields during ambassador onboarding (platform selection, manual follower count input, country/region selection)
- **Business Verification Logic**: Only businesses that sign up and pay receive verified badges; ambassador-added businesses remain unverified for MVP
- **Translation System**: Full Spanish and Portuguese translations for all major UI elements and pages
- **Onboarding Enhancement**: Extended ambassador account creation with platform, follower count, and country fields for complete profile setup
- Fixed major onboarding completion issue: resolved database schema mismatch and payload size errors
- Updated TypeScript schema to match actual Supabase database columns (name, platform, followerCount, etc.)
- Increased JSON payload limits to 50mb to handle image uploads
- Added comprehensive file validation: 5MB size limit, JPEG/PNG/WebP format checking
- Updated domain references from 'comuniti.com' to 'comuniti.co' throughout the application
- Improved user experience: users can now continue from branding step without restarting entire onboarding
- Preserved localStorage data to allow seamless continuation of onboarding process
- Successfully tested complete ambassador profile creation with real database integration
- Enhanced error messaging with actionable guidance for users
- Applied consistent orange accent color (#F1762E) to all primary action buttons
- Fixed ambassador directory infinite loading loop with React Query implementation
- Created working directory page displaying real ambassador and business data
- Added Prime Solutions Tax & Legal business to Aaron's ambassador page with correct WhatsApp number (50763226180)
- Implemented professional footer with grayscale Comuniti logo
- Verified single database instance working correctly with consistent data
- Completed dual-button business card template: WhatsApp (orange) and Google Maps (teal) buttons with equal sizing
- Fixed onboarding flow to properly capture detailed business addresses in database location field
- Implemented Supabase storage for ambassador photo uploads with proper error handling
- Updated WhatsApp number field to correct value (50763226180) and specific Torre Global Bank address

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and build tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing with pages for home, ambassador onboarding, and directory views
- **State Management**: React Query (@tanstack/react-query) for server state management and React Hook Form for form handling
- **Styling**: Custom Tailwind configuration with Comuniti brand colors (blue #003366, orange #F1762E, yellow #F1D337, etc.) and Maven Pro font family
- **Internationalization**: Context-based language system supporting English, Spanish, and Portuguese

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Storage Layer**: Abstract storage interface with in-memory implementation for development and PostgreSQL adapter for production
- **API Design**: RESTful endpoints for ambassadors, businesses, and relationships with JSON request/response format
- **Development Server**: Vite integration for hot module replacement in development mode

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver for production
- **Schema Management**: Drizzle migrations with schema definitions in TypeScript
- **Core Tables**: 
  - `ambassadors` - influencer profiles with platform data and page URLs
  - `businesses` - service provider information with categories and contact details
  - `ambassador_businesses` - many-to-many relationship table for recommendations
  - `reviews` - user feedback system with ratings and identity tags
  - `referrals` - tracking ambassador-business referral relationships

### Authentication and Authorization
- **Supabase Authentication**: Integrated real user signup and authentication
- User accounts created with email/password through Supabase auth system
- Ambassador verification status tracked via boolean flags
- Business verification managed through admin approval workflow
- User sessions managed through Supabase with automatic token handling

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage**: File upload handling for ambassador logos and business images via @google-cloud/storage
- **Uppy**: File upload interface with dashboard, drag-drop, and AWS S3 integration capabilities

### Key Libraries and Frameworks
- **React Ecosystem**: React Router alternative (wouter), React Query for data fetching, React Hook Form for form validation
- **UI Components**: Radix UI primitives for accessible components, Lucide React for icons, class-variance-authority for component variants
- **Development Tools**: Vite for build tooling, ESBuild for server bundling, TypeScript for type safety
- **Validation**: Zod for runtime type checking and form validation schemas
- **Styling**: Tailwind CSS with PostCSS, custom CSS variables for theming

### Build and Deployment
- **Development**: Vite dev server with HMR, TypeScript compilation, and Express backend proxy
- **Production Build**: Vite builds client assets, ESBuild bundles server code into single file
- **Environment**: Node.js runtime with ES modules, environment-based configuration for database connections
- **Custom Domain**: comuniti.co (to be configured in Replit Deployments settings after initial deployment)