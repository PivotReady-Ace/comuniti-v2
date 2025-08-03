# Comuniti Platform

## Overview

Comuniti is a trust-based platform that connects expat influencers (ambassadors) with recommended service providers in global relocation hubs. The platform allows influencers to curate and share lists of trusted local businesses while enabling service providers to gain visibility through verified community recommendations. Built as a full-stack TypeScript application, it features a React frontend with shadcn/ui components and an Express backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 3, 2025:**
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
- Added Prime Solutions Tax & Legal business to Aaron's ambassador page
- Implemented professional footer with grayscale Comuniti logo
- Verified single database instance working correctly with consistent data

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