# Viral Clip Finder 🎬

A powerful AI-driven SaaS platform that transforms long-form video content into viral social media clips. Built with Next.js 15, React 19, and powered by advanced AI analysis.

![Viral Clip Finder](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.21-purple?style=for-the-badge&logo=prisma)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Viral Potential Scoring** - Advanced AI evaluates content for viral potential
- **Trending Topic Detection** - Identifies trending themes and keywords
- **Optimal Clip Extraction** - Automatically finds the most engaging 30-60 second segments
- **Smart Caption Generation** - Creates compelling captions with relevant hashtags

### 🎯 Content Creation Pipeline
- **Multi-Format Support** - MP4, MOV, MP3, WAV file uploads
- **Drag & Drop Interface** - Intuitive file upload experience
- **Real-Time Processing** - Live status updates during analysis
- **Batch Processing** - Handle multiple files simultaneously

### 📊 Professional Dashboard
- **Usage Analytics** - Track monthly processing minutes and limits
- **Project Management** - Organize content by projects
- **Performance Metrics** - Monitor clip performance and viral scores
- **Team Collaboration** - Multi-user access for Pro and Agency plans

### 🔐 Enterprise Security
- **JWT Authentication** - Secure token-based authentication
- **HTTP-Only Cookies** - Protection against XSS attacks
- **Role-Based Access** - User and Admin role management
- **Data Encryption** - Secure password hashing with bcrypt

### 💎 Subscription Tiers
- **Starter** ($49/month) - 120 minutes, basic features
- **Pro** ($149/month) - 400 minutes, priority processing, team access
- **Agency** ($399/month) - 1,500 minutes, API access, white-label options

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or compatible JavaScript runtime
- PostgreSQL database (local or cloud)
- npm, yarn, or pnpm package manager

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd viral-clip-finder
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env.local` file:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/viral_clips"
   
   # Authentication
   JWT_SECRET="your-super-secure-jwt-secret-here"
   
   # AI Analysis (Optional)
   PERPLEXITY_API_KEY="pplx-your-api-key-here"
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

3. **Set Up Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create database tables
   npx prisma db push
   
   # Optional: View database in browser
   npx prisma studio
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to see your application.

### Database Setup Options

#### Option 1: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account and new database
3. Copy the connection string to your `.env.local`

#### Option 2: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the database URL from project settings

#### Option 3: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb viral_clips
# Update DATABASE_URL in .env.local
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Modern component library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database
- **JWT Authentication** - Secure user sessions

### AI Integration
- **Perplexity AI** - Advanced content analysis
- **Custom AI Pipeline** - Viral potential scoring
- **Automated Processing** - Background job handling

## 📁 Project Structure

```
viral-clip-finder/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # User dashboard
│   │   ├── login/          # Authentication pages
│   │   └── signup/         
│   ├── components/         # Reusable UI components
│   │   └── ui/            # ShadCN components
│   ├── lib/               # Utility functions
│   └── middleware.ts      # Route protection
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

## 🎯 Core Features Overview

### Authentication System
- **Secure Signup/Login** with password strength validation
- **JWT Token Management** with HTTP-only cookies
- **Route Protection** via middleware
- **User Role Management** (USER/ADMIN)

### Content Processing Pipeline
1. **File Upload** - Drag & drop with progress tracking
2. **AI Analysis** - Viral potential scoring and segment identification
3. **Clip Generation** - Automated short clip creation
4. **Caption & Hashtag Generation** - AI-powered social media optimization

### Dashboard Features
- **Usage Monitoring** - Track monthly processing limits
- **Project Organization** - Manage multiple content projects
- **Analytics Dashboard** - Performance metrics and insights
- **Quick Actions** - Streamlined workflow tools

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication  
- `POST /api/auth/logout` - Session termination

### Dashboard
- `GET /api/dashboard` - User stats and project data

### External Integration
- `POST /api/proxy` - Secure external API proxy

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect Vercel to your repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- **Netlify** - Full-stack deployment
- **Railway** - Database and app hosting
- **Digital Ocean** - VPS deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Support

- **Documentation**: Check this README for setup instructions
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our community discussions

---