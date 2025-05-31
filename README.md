# Vertirix Console

A modern, enterprise-grade voice agent management platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Authentication & Security
- **Secure login system** with session management (24-hour sessions)
- **Password hashing** with salt for security
- **Role-based access control** (Admin vs User)
- **Session restoration** on page refresh
- **Protected routes** with automatic redirects
- **Account lockout protection** (5 failed attempts = 15min lockout)
- **Strong password requirements** (12+ chars, uppercase, lowercase, numbers, special chars)

### Admin Panel
- **Complete user management** dashboard
- **Create/Edit/Delete users** functionality
- **Subscription plan assignment** (Basic, Starter, Professional, Enterprise)
- **User search and filtering** by status/role
- **Real-time statistics** and analytics
- **User activity tracking**

### Voice Agent Management
- **Subscription-based agent limits** (1-5 agents based on plan)
- **Predefined agent configurations** for different use cases
- **Voice type options**: Hyper Realistic, Realistic, Custom, Professional, Standard
- **Language support**: English (US) and Arabic
- **Custom first message** configuration
- **Agent editing interface** with live preview

### User Interface
- **Modern glass morphism design** with dark theme
- **Responsive layout** for all devices
- **Professional branding** with purple (#6E56CF) accent
- **Animated loading states** and transitions
- **Toast notifications** for user feedback
- **Real-time statistics** and monitoring

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context + localStorage
- **Authentication**: Custom secure implementation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/houraniiiii/console.git
   cd console
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Initial Setup

### Admin Account Creation
The system automatically creates a secure admin account on first startup:

- **Email**: admin@vertirix.com
- **Password**: Randomly generated 16-character secure password
- **Access**: Full system administration capabilities

**Important**: The admin password is only displayed once in the browser console during initial setup. Make sure to save it securely!

### First Login Steps
1. Start the application
2. Check the browser console for admin credentials
3. Save the generated password securely
4. Log in with the admin account
5. Create additional users as needed

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── login/             # Login page
│   ├── admin/             # Admin dashboard
│   ├── agents/[id]/edit/  # Agent editing pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main console page
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── tabs/             # Tab components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/               # Custom React hooks
│   └── useConsoleData.ts # Console data management
└── types/               # TypeScript type definitions
    └── index.ts         # All application types
```

## 🔧 Key Components

### Authentication System
- Secure session-based authentication
- Password hashing with salt
- Role-based access control
- Automatic session expiry
- Account lockout protection
- Strong password requirements

### Admin Dashboard
- User management interface
- Subscription plan assignment
- Real-time analytics
- Search and filtering capabilities

### Voice Agent Console
- Agent configuration interface
- Real-time status monitoring
- Instance management
- Contact and campaign tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm start
```

## 📝 API Integration

The application is designed for easy backend integration:

- **User Management**: Ready for REST API integration
- **Authentication**: Can be replaced with JWT/OAuth
- **Data Storage**: Currently localStorage, easily adaptable to databases
- **Real-time Updates**: WebSocket ready architecture

## 🔒 Security Features

- Session-based authentication with 24-hour expiry
- Advanced password hashing (production-ready with bcrypt placeholder)
- Role-based routing and access control
- Protected API endpoints pattern
- Input validation and sanitization
- CSRF protection patterns
- User data isolation
- Account lockout after failed attempts
- Strong password requirements (12+ characters)
- Secure password generation for admin account

## 📊 Subscription Tiers

| Plan | Agents | Features |
|------|--------|----------|
| Basic | 1 | Basic voice agent management |
| Starter | 2 | Enhanced features |
| Professional | 3 | Advanced analytics |
| Enterprise | 5 | Full feature access |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for modern voice agent management**
