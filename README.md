# WanderLust - Tour & Travels Application

A comprehensive full-stack tour and travels web application built with React, Tailwind CSS, and Supabase.

## Features

### User Features
- 🏠 **Beautiful Home Page** with hero section and featured tours
- 🔍 **Advanced Search & Filtering** by location, price, duration, difficulty
- 📱 **Responsive Design** optimized for all devices
- 🌙 **Dark Mode Support** with smooth transitions
- 🔐 **User Authentication** with secure login/signup
- ❤️ **Wishlist System** to save favorite tours
- 🛒 **Shopping Cart** for booking management
- 📅 **Booking System** with date selection and group size
- ⭐ **Reviews & Ratings** for tours
- 👤 **User Dashboard** to manage bookings and profile

### Admin Features
- 📊 **Admin Dashboard** with comprehensive statistics
- ➕ **Tour Management** - add, edit, delete tours
- 📋 **Booking Management** with status updates
- 👥 **User Management** with role assignments
- 🏷️ **Featured Tours** management
- 📈 **Analytics** and performance metrics

### Technical Features
- ⚡ **Fast Performance** with Vite build system
- 🎨 **Modern UI** with Tailwind CSS and Framer Motion
- 🔒 **Secure Authentication** with Supabase Auth
- 💾 **Database Management** with Supabase PostgreSQL
- 📱 **Mobile-First Design** with responsive breakpoints
- 🌐 **SEO Optimized** with proper meta tags

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tour-travels-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the API settings
   - Click "Connect to Supabase" button in the top right of this application
   - Follow the setup wizard to configure your database

4. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials

5. **Database Setup**
   The application will automatically create the necessary database tables when you connect to Supabase.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Use the demo accounts provided on the login page

## Demo Accounts

### Admin Account
- **Email**: admin@wanderlust.com
- **Password**: admin123
- **Access**: Full admin dashboard with tour and user management

### User Account
- **Email**: user@example.com
- **Password**: user123
- **Access**: Standard user features (booking, wishlist, profile)

## Database Schema

The application uses the following main tables:

- **users** - User profiles and authentication
- **tours** - Tour information and details
- **bookings** - User tour bookings
- **reviews** - Tour reviews and ratings
- **wishlists** - User wishlist items

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication related components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── tours/          # Tour related components
│   └── ui/             # Generic UI components
├── context/            # React context providers
├── data/               # Sample data and constants
├── lib/                # Utilities and configurations
├── pages/              # Application pages
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   └── user/           # User dashboard pages
└── types/              # TypeScript type definitions
```

## Key Features Implementation

### Authentication
- JWT-based authentication with Supabase Auth
- Protected routes for user and admin areas
- Role-based access control

### Tour Management
- CRUD operations for tours
- Image upload support via URLs
- Advanced filtering and search capabilities
- Featured tours system

### Booking System
- Multi-step booking process
- Date selection with availability checking
- Group size management
- Booking status tracking

### Payment Integration
- Shopping cart functionality
- Booking confirmation system
- Payment status tracking

### Admin Panel
- Comprehensive dashboard with statistics
- Tour management interface
- Booking status management
- User role management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email info@wanderlust.com or join our community chat.