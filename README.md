# 🌍 GlobeNomad

<div align="center">

![GlobeNomad Logo](https://img.shields.io/badge/🌍-GlobeNomad-blue?style=for-the-badge&logo=earth&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.11.0-e10098?style=flat-square&logo=graphql)](https://graphql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.17.1-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

**A modern, full-stack travel planning application that helps users discover, plan, and share their adventures around the globe.**
</div>

---

## 🎯 About The Project

GlobeNomad is a comprehensive travel planning platform that combines the power of modern web technologies with intuitive design to create the ultimate travel companion. Whether you're planning a weekend getaway or a month-long adventure, GlobeNomad provides all the tools you need to create, manage, and share your travel experiences.

### ✨ Key Features

- 🗺️ **Interactive Trip Planning** - Create detailed itineraries with drag-and-drop functionality
- 🔍 **Smart Destination Discovery** - Explore destinations with AI-powered recommendations
- 💰 **Budget Management** - Track expenses and get cost estimates for your trips
- 🌐 **Social Sharing** - Share your trips publicly and discover others' adventures
- 📱 **Responsive Design** - Seamless experience across all devices
- 🔐 **Secure Authentication** - JWT-based auth with password recovery
- 👥 **Admin Dashboard** - Comprehensive admin panel for platform management
- 🎨 **Modern UI/UX** - Beautiful interface with Aceternity UI components

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Aceternity UI, Framer Motion
- **Icons**: Lucide React
- **State Management**: Apollo Client
- **GraphQL Client**: Apollo Client 3.13.9
- **Forms**: React Hook Form with Zod validation

### Backend
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: MongoDB with Mongoose ODM
- **API**: GraphQL with Apollo Server
- **Authentication**: JWT with Passport.js
- **Email**: Nodemailer
- **Validation**: Class Validator & Class Transformer
- **Security**: bcrypt for password hashing
- **Scheduling**: NestJS Schedule

### DevOps & Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest
- **Version Control**: Git
- **API Testing**: GraphQL Playground

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KushalvDesai/GlobeNomad.git
   cd GlobeNomad
   ```

2. **Install Backend Dependencies**
   ```bash
   cd be
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../fe
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the `be` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/globenomad
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@globenomad.com
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3001
   ```
   
   Create `.env.local` file in the `fe` directory:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/graphql
   ```

5. **Start the Application**
   
   Start the backend server:
   ```bash
   cd be
   npm run start:dev
   ```
   
   In a new terminal, start the frontend:
   ```bash
   cd fe
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend GraphQL Playground: http://localhost:3000/graphql

## 📁 Project Structure

```
GlobeNomad/
├── be/                          # Backend (NestJS)
│   ├── src/
│   │   ├── admin/              # Admin management module
│   │   ├── activities/         # Activities and categories
│   │   ├── auth/               # Authentication & authorization
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── email.service.ts
│   │   ├── trip/               # Trip management
│   │   │   ├── trip.service.ts
│   │   │   ├── trip.resolver.ts
│   │   │   └── schema/
│   │   ├── user/               # User management
│   │   │   ├── user.service.ts
│   │   │   ├── user.resolver.ts
│   │   │   └── schema/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── schema.gql              # Generated GraphQL schema
│
├── fe/                          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── profile/        # User profile
│   │   │   └── reset-password/ # Password reset
│   │   ├── components/         # React components
│   │   │   └── ui/             # UI components
│   │   ├── graphql/            # GraphQL queries & mutations
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   └── types.ts
│   │   └── lib/                # Utilities
│   ├── public/                 # Static assets
│   └── package.json
│
└── README.md                    # This file
```

## 🔧 Available Scripts

### Backend (be/)
```bash
npm run start:dev      # Development mode with hot reload
npm run start:prod     # Production mode
npm run build          # Build for production
npm run test           # Run tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Lint code
```

### Frontend (fe/)
```bash
npm run dev            # Development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code
```

## 🌟 Core Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- Password reset via email
- Role-based access control (User, Admin, Super Admin)

### 🗺️ Trip Management
- Create and manage detailed trips
- Interactive itinerary builder
- Budget estimation and tracking
- Public/private trip sharing
- Trip discovery and exploration

### 👥 User Management
- User profiles with customizable information
- Trip history and statistics
- Social features for sharing experiences

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Beautiful animations with Framer Motion
- Premium UI components from Aceternity UI
- Dark/light theme support

### 📊 Admin Dashboard
- User management and statistics
- Trip monitoring and moderation
- Platform analytics and insights

## 🤝 Our Team

This project was developed by a talented team of developers:

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/yashbharvada.png" width="100px;" alt="Yash Bharvada"/><br />
      <sub><b>Yash Bharvada</b></sub><br />
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/aaleya5.png" width="100px;" alt="Aaleya Boxwala"/><br />
      <sub><b>Aaleya Boxwala</b></sub><br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/KushalvDesai.png" width="100px;" alt="Kushal Desai"/><br />
      <sub><b>Kushal Desai</b></sub><br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/shreylakhtaria.png" width="100px;" alt="Shrey Lakhataria"/><br />
      <sub><b>Shrey Lakhataria</b></sub><br />
      <sub>Backend Developer</sub>
    </td>
  </tr>
</table>

## 🌐 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting service

### Environment Variables for Production
- Set secure JWT_SECRET
- Configure production MongoDB URI
- Set up email service credentials
- Update CORS settings for production URLs

## 🤝 Contributing

We welcome contributions to GlobeNomad! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - For the robust backend framework
- [Next.js](https://nextjs.org/) - For the amazing React framework
- [Aceternity UI](https://ui.aceternity.com/) - For beautiful UI components
- [Apollo GraphQL](https://www.apollographql.com/) - For GraphQL implementation
- [Tailwind CSS](https://tailwindcss.com/) - For utility-first CSS

## 📞 Support

If you have any questions or need help, feel free to reach out:

- **Project Repository**: [GitHub](https://github.com/KushalvDesai/GlobeNomad)
- **Issues**: [Report Issues](https://github.com/KushalvDesai/GlobeNomad/issues)
- **Email**: shreylakhtaria@gmail.com

---

<div align="center">

**Made with ❤️ by the GlobeNomad Team**

*Happy Traveling! 🌍✈️*

</div>
