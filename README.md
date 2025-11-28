# Lumen Yard - Phase 2 Frontend Capstone Project

A full-featured publishing platform inspired by Medium, built with Next.js 16, React 19, TypeScript, and Prisma. This project demonstrates modern frontend engineering practices including component design, data fetching, state management, authentication, SEO optimization, and deployment.

##  Features

### Core Functionality
-  **User Authentication** - Sign up, login, and protected routes using NextAuth.js
-  **Rich Text Editor** - Jodit Editor with formatting, images, and embeds
-  **Posts CRUD** - Create, read, update, and delete posts with drafts and publishing workflow
- **Media Handling** - Cloudinary integration for image uploads and optimization
- **Tags & Search** - Tag-based filtering and full-text search
- **Social Features** - Comments (nested), likes/claps, bookmarks, and follow authors
- **User Profiles** - Author profiles with bio, posts, and follower counts
- **Personalized Feed** - Feed filtered by followed authors
- **SEO Optimized** - Open Graph tags, Twitter cards, and metadata
- **Performance** - SSG/ISR for posts, React Query for data fetching

### Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Query (@tanstack/react-query)
- **Rich Text Editor**: Jodit React
- **Image Upload**: Cloudinary
- **UI Components**: Radix UI + shadcn/ui

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Cloudinary account (for image uploads)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/pshemssa/Capstone_Phase_Two
cd Capstone_Phase_Two
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lumen_yard?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App URL (for production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Google Site Verification
GOOGLE_SITE_VERIFICATION="your-verification-code"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
phase2/
├── app/
│   ├── (auth)/          # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/          # Main application routes
│   │   ├── feed/        # Personalized feed
│   │   ├── post/        # Post detail pages
│   │   ├── tag/         # Tag pages
│   │   ├── users/       # User profiles
│   │   ├── write/       # Post editor
│   │   └── settings/    # User settings
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── post/        # Post CRUD endpoints
│   │   ├── comments/    # Comment endpoints
│   │   ├── users/       # User endpoints
│   │   ├── search/      # Search endpoint
│   │   └── upload/      # Image upload endpoint
│   ├── components/      # React components
│   │   ├── auth/        # Auth forms
│   │   ├── layout/      # Layout components
│   │   ├── post/        # Post components
│   │   └── users/       # User components
│   ├── lib/             # Utilities and configs
│   │   ├── auth.ts      # NextAuth configuration
│   │   ├── prisma.ts    # Prisma client
│   │   └── api-utils.tsx # API utilities
│   └── types/           # TypeScript types
├── components/           # Shared UI components (shadcn/ui)
├── prisma/               # Prisma schema and migrations
├── __tests__/            # Test files
└── public/               # Static assets
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking
npm run type-check
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Deploy!

### 3. Environment Variables in Vercel

Add all environment variables from your `.env` file in the Vercel project settings:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your Vercel domain)
- `NEXTAUTH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_APP_URL` (your Vercel domain)

### 4. Database Setup

For production, use a managed PostgreSQL database:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)

Update `DATABASE_URL` in Vercel with your production database URL.

## Key Features Implementation

### Lab 1 - Project Setup & Routing 
- Next.js App Router with clean folder structure
- Global layouts, header, footer, and navigation

### Lab 2 - Authentication & User Profiles 
- NextAuth.js with credentials provider
- Signup/login pages with form validation
- Protected routes with middleware
- User profile pages with posts and bio

### Lab 3 - Editor & Rich Content 
- Jodit React rich text editor
- Image upload to Cloudinary
- Preview and publish flows
- Draft saving

### Lab 4 - Posts CRUD & Media Handling 
- Full CRUD operations for posts
- Image optimization with Cloudinary
- Draft and published states
- Edit post functionality

### Lab 5 - Feeds, Tags, and Search 
- Home feed with latest posts
- Tag filtering pages
- Debounced search with full-text search

### Lab 6 - Comments, Reactions & Social Features 
- Nested comment system
- Like/clap functionality with optimistic updates
- Follow/unfollow authors 
- Bookmarks
- Personalized feed based on follows

### Lab 7 - State Management & Data Fetching 
- React Query for data fetching and caching
- Context API for session management
- Optimistic UI updates

### Lab 8 - TypeScript & Quality 
- Full TypeScript coverage
- ESLint configuration
- Unit and integration tests
- Type-safe API responses

### Lab 9 - SEO, Performance & SSG/SSR 
- Dynamic metadata and Open Graph tags
- SSG with `generateStaticParams` for posts
- ISR with 60-second revalidation
- Image optimization

### Lab 10 - Deployment & Observability 
- Vercel deployment ready
- Environment variable configuration
- Production build optimization

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage
- `npm run type-check` - Type check without emitting

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npx prisma generate` after schema changes

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies if session issues persist

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure CORS is configured in Cloudinary

## screenshots
   ## Landing Page

   ![alt text](public/image1.png)

   ## SignUp Page

  ![alt text](public/image_signup.png)

   ## Signup successfull page

   ![alt text](public/image-2.png)

   ## SignIn Page

   ![alt text](public/image-1.png)

   ## successfully signing in landing page

   ![alt text](public/image-3.png)

   ## postdetails page
     
   ![alt text](public/image-4.png)

   ## write page

   ![alt text](public/image-5.png)

   ## profile page

   ![alt text](public/image-6.png)

   ## settings page

   ![alt text](public/image-7.png)

   ## profile page

   ![alt text](public/image-8.png)

 ## runned tests successfully

   ![alt text](public/image.png)

## License

This project is part of a capstone project for educational purposes.

## Contributing

This is a capstone project. For questions or issues, please contact the project maintainer.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma for the excellent ORM
- All open-source contributors whose packages made this possible

---
