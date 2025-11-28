# Lumen Yard - Modern Publishing Platform

A full-featured publishing platform inspired by Medium, built with Next.js 15, React 19, TypeScript, and Prisma.

![Lumen Yard Homepage](./docs/images/homepage.png)

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure signup/login with NextAuth.js
- **Rich Text Editor** - Jodit Editor with formatting, images, and paste support
- **Posts Management** - Create, edit, delete posts with drafts and publishing
- **Media Handling** - Cloudinary integration for image uploads
- **Social Features** - Follow users, like posts, comments, bookmarks
- **Search & Discovery** - Tag-based filtering and full-text search
- **SEO Optimized** - Dynamic metadata and Open Graph tags

### Screenshots

| Feature | Screenshot |
|---------|------------|
| Homepage | ![Homepage](./docs/images/homepage.png) |
| Post Editor | ![Editor](./docs/images/editor.png) |
| User Profile | ![Profile](./docs/images/profile.png) |
| Post Detail | ![Post](./docs/images/post-detail.png) |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Query
- **Rich Text Editor**: Jodit React
- **Image Upload**: Cloudinary
- **UI Components**: Radix UI + shadcn/ui

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd Capstone_Phase_Two
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lumen_yard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Capstone_Phase_Two/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (main)/              # Main app pages
│   ├── api/                 # API routes
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── components/              # UI components (shadcn)
├── prisma/                  # Database schema
├── docs/                    # Documentation & images
└── public/                  # Static assets
```

## 🎯 Key Features

### Authentication System
![Auth Flow](./docs/images/auth-flow.png)
- Secure credential-based authentication
- Protected routes with middleware
- Session management with NextAuth.js

### Rich Text Editor
![Editor Features](./docs/images/editor-features.png)
- Full-featured Jodit editor
- Image upload and embedding
- Copy/paste support
- Live preview

### Social Features
![Social Features](./docs/images/social-features.png)
- Follow/unfollow users
- Like and bookmark posts
- Nested comment system
- Personalized feed

## 🚢 Deployment

### Vercel Deployment
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL="your-production-db-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="production-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## 🧪 Testing

```bash
npm test                 # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run type-check      # TypeScript check
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Posts Endpoints
- `GET /api/post` - List posts
- `POST /api/post` - Create post
- `GET /api/post/[id]` - Get post
- `PUT /api/post/[id]` - Update post
- `DELETE /api/post/[id]` - Delete post

### Social Endpoints
- `POST /api/users/[username]/follow` - Follow/unfollow user
- `POST /api/post/[id]/like` - Like/unlike post
- `POST /api/post/[id]/bookmark` - Bookmark post

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- Prisma for the excellent ORM
- All open-source contributors

---

**Built with ❤️ using Next.js, React, and TypeScript**