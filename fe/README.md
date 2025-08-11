# GlobalNomad Frontend

A beautiful, modern travel planning application built with Next.js 15, TypeScript, and Aceternity UI components.

## Features

- 🎨 **Beautiful UI**: Stunning landing page with Aceternity UI components
- 🚀 **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- ✨ **Aceternity UI**: Premium UI components (BentoGrid, Carousel, 3D Pin)
- 📱 **Responsive Design**: Mobile-first approach with beautiful desktop layouts
- 🎭 **Framer Motion**: Smooth animations and transitions throughout

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx          # Landing page (Screen 3)
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/            # React components
│   └── ui/               # UI components
│       └── aceternity/   # Aceternity UI components
│           ├── bento-grid.tsx
│           ├── carousel.tsx
│           └── 3d-pin.tsx
└── lib/                   # Utility functions
    └── utils.ts
```

## Components

### BentoGrid & BentoGridItem
Creates a responsive grid layout with beautiful cards and hover effects.

### Carousel
Interactive carousel component with auto-play, navigation arrows, and dots.

### 3D Pin & PinContainer
3D effect cards with scroll-based animations and hover effects.

## Landing Page Features

### Header
- Screen identifier (Main Landing Page - Screen 3)
- GlobalTrotter branding with gradient text
- User and settings icons

### Banner Image
- Large hero image with overlay text
- Gradient overlay for better text readability
- Responsive design

### Search and Filter Bar
- Search input with icon
- Group by, Filter, and Sort buttons
- Glass morphism design

### Top Regional Selections
- 5 regional cards (Europe, Asia, Americas, Africa, Oceania)
- 3D Pin components with images and descriptions
- Responsive grid layout

### Previous Trips
- 3 trip cards with larger images
- Trip titles and descriptions
- 3D Pin components

### Featured Destinations
- BentoGrid layout with different card sizes
- Icons and descriptions
- Responsive grid system

### Floating Action Button
- "+ Plan a trip" button in bottom right
- Gradient background with hover effects
- Smooth animations

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Additional animations and effects
- **Responsive**: Mobile-first design with breakpoint-specific layouts
- **Glass Morphism**: Modern backdrop blur effects

## Dependencies

- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `clsx`: Conditional className utility
- `tailwind-merge`: Tailwind class merging utility

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

If your backend GraphQL runs on a different port, configure the endpoint with an env var in `fe/.env.local`:

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

## Deployment

The application is ready for deployment on Vercel, Netlify, or any other hosting platform that supports Next.js.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
