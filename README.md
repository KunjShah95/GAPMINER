# GapMiner

> **Discover Unsolved Research Problems from Academic Papers**

GapMiner is an AI-powered research tool that automatically extracts limitations, identifies research gaps, and helps researchers discover opportunities from academic papers. Powered by Firecrawl for web scraping and Google Gemini for intelligent analysis.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28?logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Firebase Setup](#-firebase-setup)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
  - [Vercel](#vercel-recommended)
  - [Netlify](#netlify)
  - [Firebase Hosting](#firebase-hosting)
- [Project Structure](#-project-structure)
- [API Keys](#-api-keys)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **🔍 Intelligent Web Scraping** - Extract content from arXiv, OpenReview, ACL Anthology, and other academic sources
- **🤖 AI-Powered Gap Analysis** - Leverage Google Gemini to identify research limitations and unsolved problems
- **📊 Gap Categorization** - Automatically classify gaps into data, compute, evaluation, and methodology types
- **📚 Collections Management** - Organize discovered gaps into custom collections
- **🔐 Secure Authentication** - Firebase Auth with Email/Password and Google OAuth
- **☁️ Cloud Storage** - Persist results with Firestore database
- **🎨 Modern UI** - Beautiful, responsive interface with dark mode and smooth animations

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| **Build Tool** | Vite (Rolldown) |
| **Backend Services** | Firebase (Auth, Firestore) |
| **AI/ML** | Google Gemini 2.0 Flash |
| **Web Scraping** | Firecrawl API |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0 or **pnpm** ≥ 8.0.0
- A **Firebase** account ([firebase.google.com](https://firebase.google.com))
- A **Firecrawl** API key ([firecrawl.dev](https://firecrawl.dev))
- A **Google AI Studio** API key ([aistudio.google.com](https://aistudio.google.com))

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gapminer.git
cd gapminer
```

### 2. Install Dependencies

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

---

## 🔐 Environment Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firecrawl API
VITE_FIRECRAWL_API_KEY=your_firecrawl_api_key

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

---

## 🔥 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name (e.g., `gapminer`)
4. Disable Google Analytics (optional)
5. Click **"Create Project"**

### 2. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get Started"**
3. Enable **Email/Password** provider:
   - Click on Email/Password
   - Toggle "Enable" on
   - Save
4. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable" on
   - Enter your project's public-facing name
   - Select support email
   - Save

### 3. Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click **"Create Database"**
3. Select **"Start in production mode"**
4. Choose your preferred location (e.g., `us-central1`)
5. Click **"Enable"**

### 4. Configure Firestore Security Rules

In Firestore, go to **Rules** tab and update with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /crawlResults/{docId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /collections/{docId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Create Firestore Indexes

For optimal query performance, create the following composite indexes:

**crawlResults collection:**
| Field | Order |
|-------|-------|
| userId | Ascending |
| createdAt | Descending |

**collections collection:**
| Field | Order |
|-------|-------|
| userId | Ascending |
| createdAt | Descending |

### 6. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **"Web"** (</> icon)
4. Register your app with a nickname
5. Copy the `firebaseConfig` values to your `.env` file

---

## 💻 Local Development

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🚀 Deployment

### Vercel (Recommended)

Vercel is the recommended platform for deploying GapMiner.

#### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure environment variables:
   - Add all variables from `.env.example`
6. Click **"Deploy"**

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Vercel Configuration

Create `vercel.json` in root (optional):

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Netlify

#### Option 1: Deploy via Netlify Dashboard

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign in
3. Click **"Add new site"** > **"Import an existing project"**
4. Connect to your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables in **Site settings > Environment variables**
7. Click **"Deploy site"**

#### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
netlify init

# Deploy
netlify deploy --prod
```

#### Netlify Configuration

Create `netlify.toml` in root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Firebase Hosting

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase

```bash
firebase login
```

#### 3. Initialize Firebase Hosting

```bash
firebase init hosting
```

Select options:
- Use an existing project: Select your Firebase project
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`

#### 4. Build and Deploy

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

#### Firebase Configuration

The `firebase.json` file should look like:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 📁 Project Structure

```
gapminer/
├── public/                 # Static assets
│   └── vite.svg           # Favicon
├── src/
│   ├── assets/            # Images and static files
│   ├── components/        # React components
│   │   ├── layout/        # Layout components (Navbar, Footer, Sidebar)
│   │   └── ui/            # UI components (Button, Modal, etc.)
│   ├── context/           # React context providers
│   │   └── AuthContext.tsx
│   ├── lib/               # Utility libraries and services
│   │   ├── api.ts         # Firecrawl & Gemini API integration
│   │   ├── firebase.ts    # Firebase initialization
│   │   ├── firestore.ts   # Firestore database operations
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # Page components
│   │   ├── AssistantPage.tsx
│   │   ├── CollectionsPage.tsx
│   │   ├── CrawlPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ExplorePage.tsx
│   │   ├── HomePage.tsx
│   │   └── InsightsPage.tsx
│   ├── App.tsx            # Main App component
│   ├── index.css          # Global styles
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite type declarations
├── .env.example           # Environment template
├── .gitignore
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts         # Vite configuration
```

---

## 🔑 API Keys

### Firecrawl API Key

1. Go to [Firecrawl](https://firecrawl.dev)
2. Sign up or log in
3. Navigate to **Dashboard > API Keys**
4. Create a new API key
5. Copy the key to `VITE_FIRECRAWL_API_KEY`

### Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create API key in a new or existing project
5. Copy the key to `VITE_GEMINI_API_KEY`

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll to **"Your apps"** section
5. Copy each config value to the corresponding `VITE_FIREBASE_*` variable

---

## 🔧 Troubleshooting

### Common Issues

#### "Firebase: Error (auth/unauthorized-domain)"

**Solution**: Add your deployment domain to Firebase authorized domains:
1. Go to Firebase Console > Authentication > Settings
2. Under **Authorized domains**, click **"Add domain"**
3. Add your Vercel/Netlify domain (e.g., `your-app.vercel.app`)

#### "Firecrawl API error: 401"

**Solution**: Verify your Firecrawl API key:
1. Check that `VITE_FIRECRAWL_API_KEY` is correctly set
2. Ensure the API key is active in your Firecrawl dashboard
3. Check for any leading/trailing whitespace

#### "Missing or insufficient permissions" (Firestore)

**Solution**: Update Firestore security rules:
1. Go to Firestore > Rules
2. Ensure rules allow authenticated users to read/write their own data
3. Publish the updated rules

#### "Cannot find module '@/...'"

**Solution**: Path aliases issue:
1. Ensure `vite.config.ts` has the `@` alias configured
2. Ensure `tsconfig.app.json` has matching paths configuration
3. Restart the dev server

#### Build fails on Vercel/Netlify

**Solution**:
1. Ensure all environment variables are set in the platform dashboard
2. Check that Node.js version is 18 or higher
3. Clear cache and redeploy

### Getting Help

- Open an issue on [GitHub Issues](https://github.com/yourusername/gapminer/issues)
- Check [Vite documentation](https://vite.dev)
- Check [Firebase documentation](https://firebase.google.com/docs)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Update documentation as needed
- Test changes locally before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Firecrawl](https://firecrawl.dev) for powerful web scraping
- [Google Gemini](https://ai.google.dev) for AI-powered analysis
- [Firebase](https://firebase.google.com) for backend services
- [Vite](https://vite.dev) for lightning-fast builds
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling

---

<div align="center">

**[⬆ Back to Top](#gapminer)**

Made with ❤️ by the GapMiner Team

</div>
