# Guess Who: AI Challenge

A modern web implementation of the classic "Guess Who?" board game where users play against an AI opponent powered by XAI's Grok model.

## Features

- 🎮 Classic Guess Who gameplay against AI
- 🤖 AI opponent powered by XAI's Grok model
- 🎨 Modern UI with shadcn/ui components
- 🌙 Dark mode support
- 📱 Responsive design
- ⚡ Fast development with Vite
- 🔒 Type-safe with TypeScript

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **XAI Grok API** for AI gameplay

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- XAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd guess-who-ai-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your XAI API key to the `.env` file:
```env
XAI_API_KEY=your_xai_api_key_here
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `XAI_API_KEY` | Your XAI API key for Grok AI | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No (uses in-memory storage) |
| `PORT` | Server port | No (defaults to 5000) |
| `NODE_ENV` | Environment mode | No (defaults to development) |

## Game Rules

1. Each player (you and the AI) secretly selects a character
2. Take turns asking yes/no questions about character attributes
3. Eliminate characters based on the answers
4. First to correctly guess the opponent's character wins!

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and API client
│   │   └── pages/        # Page components
├── server/               # Express backend
│   ├── services/         # External service integrations
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data layer
└── shared/               # Shared TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Acknowledgments

- Built with modern web technologies
- Powered by XAI's Grok AI model
- UI components from shadcn/ui
