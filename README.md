# CivicLens React App

A simple ReactJS + Vite application with TailwindCSS styling that displays a centered greeting message.

## Features

- **ReactJS** with functional components
- **Vite** for fast development and building
- **TailwindCSS** for modern, utility-first styling
- Responsive design with centered content
- Clean, minimal UI

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # TailwindCSS imports
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Customization

The main greeting message can be customized in `src/App.jsx`. The styling uses TailwindCSS classes for easy modification of colors, fonts, and layout.
