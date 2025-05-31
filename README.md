# Vertirix Console 🎙️

A modern, enterprise-grade voice agent management platform built with Next.js 14, TypeScript, and Tailwind CSS. Manage AI-powered voice agents with subscription-based access, real-time monitoring, and comprehensive admin controls.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

## 🌟 Overview

Vertirix Console is a comprehensive voice agent management platform that enables businesses to deploy, configure, and monitor AI-powered voice agents. With subscription-based tiers, role-based access control, and real-time analytics, it provides everything needed for enterprise voice automation.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure login system** with session management (24-hour sessions)
- **Advanced password hashing** with salt for maximum security
- **Role-based access control** (Admin vs User)
- **Session restoration** on page refresh
- **Protected routes** with automatic redirects
- **Account lockout protection** (5 failed attempts = 15min lockout)
- **Strong password requirements** (12+ chars, uppercase, lowercase, numbers, special chars)
- **CSRF protection** and input validation
- **Secure password generation** for admin accounts

### 👨‍💼 Admin Panel
- **Complete user management** dashboard with CRUD operations
- **Create/Edit/Delete users** with validation
- **Subscription plan assignment** (Basic, Starter, Professional, Enterprise)
- **User search and filtering** by status/role/subscription
- **Real-time statistics** and analytics dashboard
- **User activity tracking** and audit logs
- **Bulk operations** for user management

### 🤖 Voice Agent Management
- **Subscription-based agent limits** (1-5 agents based on plan)
- **5 predefined agent configurations**: Sales, Support, Lead Qualifier, Follow-up, Arabic Agent
- **Voice type options**: Hyper Realistic, Realistic, Custom, Professional, Standard
- **Multi-language support**: English (US) and Arabic
- **Custom first message** configuration with live preview
- **Agent editing interface** with real-time configuration
- **Voice speed control** and response delay settings
- **Personality customization** and custom instructions
- **Scheduling system** with timezone support

### 🎨 User Interface
- **Modern glass morphism design** with dark theme
- **Responsive layout** for all screen sizes
- **Professional branding** with purple (#6E56CF) accent
- **Animated loading states** and smooth transitions
- **Toast notifications** for user feedback
- **Real-time statistics** and monitoring dashboards
- **Intuitive navigation** with sidebar and header

### 📊 Analytics & Monitoring
- **Real-time call statistics** and success rates
- **Agent performance metrics** and usage analytics
- **Subscription usage tracking** and limits
- **User activity monitoring** and audit trails
- **Instance cost tracking** and billing integration
- **Campaign performance** analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript 5.0+ for type safety
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React Hot Toast for user feedback
- **State Management**: React Context API + localStorage
- **Authentication**: Custom secure implementation with session management
- **Routing**: Next.js App Router with protected routes
- **Build Tool**: Webpack 5 (via Next.js)

## 📦 Installation

### Prerequisites
- Node.js 18.0+ 
- npm 9.0+ or yarn 1.22+
- Git 2.0+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/houraniiiii/console.git
   cd console
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup

Create a `.env.local` file in the root directory (optional):

```env
# Application Settings
NEXT_PUBLIC_APP_NAME=Vertirix Console
NEXT_PUBLIC_APP_VERSION=1.0.0

# Security Settings (optional overrides)
NEXT_PUBLIC_SESSION_DURATION=86400000  # 24 hours in ms
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5
NEXT_PUBLIC_LOCKOUT_DURATION=900000    # 15 minutes in ms

# Development Settings
NODE_ENV=development
```

## 🔐 Initial Setup

### Admin Account
The system includes a pre-configured admin account:

- **Email**: Contact system administrator for credentials
- **Password**: Secure password provided by administrator
- **Access**: Full system administration capabilities

**⚠️ Important**: Admin credentials are securely configured in the system. For production deployments, please ensure you have received the admin credentials through a secure channel.

### First Login Steps
1. Navigate to your deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to the login page (`/login`)
3. Enter the admin credentials provided by your administrator
4. Access the admin dashboard
5. Create additional users as needed through the admin panel

### Security Best Practices
- Change the admin password after first login if desired
- Create individual user accounts for team members
- Never share admin credentials
- Use strong passwords for all accounts

### Creating Your First User
1. Login as admin
2. Navigate to Admin Panel
3. Click "Create User"
4. Fill in user details and assign subscription plan
5. User will receive secure credentials

## 🏗️ Project Structure

```
vertirix-console/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── login/             # Authentication pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── agents/[id]/edit/  # Agent configuration pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Main console dashboard
│   ├── components/            # Reusable UI components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── tabs/             # Tab-based content components
│   ├── contexts/             # React Context providers
│   │   └── AuthContext.tsx   # Authentication & user management
│   ├── hooks/               # Custom React hooks
│   │   └── useConsoleData.ts # Console data management
│   └── types/               # TypeScript definitions
│       └── index.ts         # Application type definitions
├── public/                   # Static assets
├── .next/                   # Next.js build output
├── package.json            # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## 🔧 Key Components

### Authentication System
- **Secure session management** with 24-hour expiry
- **Password hashing** using advanced algorithms
- **Role-based access control** with admin/user permissions
- **Account lockout protection** after failed attempts
- **Session restoration** on page refresh
- **Automatic logout** on session expiry

### Admin Dashboard Features
- **User management interface** with full CRUD operations
- **Subscription plan assignment** and management
- **Real-time analytics** and system statistics
- **Search and filtering** capabilities
- **Bulk user operations** for efficiency
- **Audit logging** for security compliance

### Voice Agent Console
- **Agent configuration interface** with live preview
- **Real-time status monitoring** and health checks
- **Instance management** with cost tracking
- **Contact and campaign** management systems
- **Scheduling system** with timezone support
- **Performance analytics** and reporting

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Build
```bash
# Production build
npm run build

# Start production server
npm start

# Or export static files
npm run export
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 API Integration

The application is designed for easy backend integration:

### Ready for Backend Integration
- **User Management**: REST API endpoints ready
- **Authentication**: JWT/OAuth integration points
- **Data Storage**: Currently localStorage, database-ready
- **Real-time Updates**: WebSocket integration ready
- **File Upload**: Agent voice file management
- **Billing Integration**: Subscription management hooks

### Example API Structure
```typescript
// User Management
GET    /api/users          # Get all users
POST   /api/users          # Create user
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user

// Authentication
POST   /api/auth/login     # User login
POST   /api/auth/logout    # User logout
GET    /api/auth/me        # Current user

// Agents
GET    /api/agents         # Get agents
PUT    /api/agents/:id     # Update agent
POST   /api/agents/:id/activate  # Activate agent
```

## 🔒 Security Features

### Enterprise-Grade Security
- **Session-based authentication** with 24-hour expiry
- **Advanced password hashing** (bcrypt-ready implementation)
- **Role-based routing** and access control
- **Protected API endpoints** with middleware
- **Input validation** and sanitization
- **CSRF protection** patterns implemented
- **User data isolation** and privacy
- **Account lockout** after failed attempts
- **Strong password requirements** (12+ characters)
- **Secure password generation** for admin accounts
- **Session monitoring** and automatic cleanup

### Security Best Practices
- No hardcoded credentials
- Secure session management
- Input validation on all forms
- Error handling without information leakage
- Audit logging for admin actions
- Rate limiting on authentication endpoints

## 📊 Subscription Tiers

| Plan | Agents | Monthly Price | Features |
|------|--------|---------------|----------|
| **Basic** | 1 agent | $29/month | Basic voice agent management, Standard voice quality |
| **Starter** | 2 agents | $59/month | Enhanced features, Professional voice quality |
| **Professional** | 3 agents | $99/month | Advanced analytics, Custom voice options |
| **Enterprise** | 5 agents | $199/month | Full feature access, Hyper-realistic voice, Priority support |

### Plan Features
- **Basic**: Essential voice agent functionality
- **Starter**: Enhanced customization and reporting
- **Professional**: Advanced analytics and integrations
- **Enterprise**: Full platform access with premium support

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:turbo    # Start with Turbopack (experimental)

# Building
npm run build        # Create production build
npm run start        # Start production server
npm run export       # Export static site

# Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript validation
npm run format       # Format code with Prettier

# Utilities
npm run clean        # Clean build artifacts
npm run analyze      # Bundle analyzer
```

## 🐛 Troubleshooting

### Common Issues

**1. Admin password not showing in console**
```bash
# Clear browser storage and restart
localStorage.clear()
# Then refresh the page
```

**2. Session expired errors**
```bash
# Check system time is correct
# Clear browser cache and cookies
```

**3. Build errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**4. TypeScript errors**
```bash
# Regenerate types
npm run type-check
```

### Getting Help
- Check the browser console for error messages
- Review the application logs
- Ensure all dependencies are installed correctly
- Verify Node.js version compatibility

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with proper commit messages
4. **Add** tests for new functionality
5. **Run** the test suite (`npm run test`)
6. **Submit** a pull request

### Code Standards
- Follow the existing code style
- Write meaningful commit messages
- Add TypeScript types for new code
- Include tests for new features
- Update documentation as needed

### Pull Request Process
1. Update the README.md with details of changes
2. Update version numbers following SemVer
3. The PR will be merged once reviewed and approved

## 📄 License

This project is proprietary software. All rights reserved.

**© 2024 Vertirix Systems. Unauthorized copying, modification, or distribution is prohibited.**

## 🆘 Support & Contact

### Technical Support
- **Email**: support@vertirix.com
- **Documentation**: [docs.vertirix.com](https://docs.vertirix.com)
- **Issues**: Create an issue in this repository

### Business Inquiries
- **Sales**: sales@vertirix.com
- **Partnerships**: partners@vertirix.com
- **General**: info@vertirix.com

### Community
- **Discord**: [Join our community](https://discord.gg/vertirix)
- **Twitter**: [@vertirix](https://twitter.com/vertirix)
- **LinkedIn**: [Vertirix Systems](https://linkedin.com/company/vertirix)

---

<div align="center">

**Built with ❤️ for modern voice agent management**

[🌐 Website](https://vertirix.com) • [📚 Documentation](https://docs.vertirix.com) • [💬 Support](mailto:support@vertirix.com)

</div>
