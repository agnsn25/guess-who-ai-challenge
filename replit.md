# Guess Who: AI Challenge

## Overview

This is a modern web implementation of the classic "Guess Who?" board game where users play against an AI opponent powered by XAI's Grok model. The application features a full-stack TypeScript implementation with a React frontend and Express backend, allowing players to ask questions about character attributes to identify their opponent's chosen character.

The game includes a character board with 20 diverse characters, each with detailed attributes like gender, hair color, age, facial features, and accessories. Players take turns asking yes/no questions, with the AI providing intelligent responses and strategic questions of its own.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management with custom hooks for game logic
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design system including dark mode support and CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for game management, character data, and AI interactions
- **Data Layer**: Currently using in-memory storage with interface-based design for easy database migration
- **AI Integration**: XAI Grok API for intelligent question answering and strategic gameplay

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **Schema**: 
  - Users table for authentication
  - Characters table with JSON attributes for flexible character data
  - Games table tracking game state and progress
  - Game history table for turn-by-turn gameplay logging
- **Migrations**: Drizzle Kit for database schema management

### Key Design Patterns
- **Repository Pattern**: IStorage interface abstracts data access, currently implemented with MemStorage class
- **Component Composition**: Modular React components with clear separation of concerns
- **Custom Hooks**: Centralized game logic in useGame hook with React Query integration
- **Type Safety**: Shared TypeScript types between frontend and backend via shared schema
- **Error Handling**: Structured error responses with user-friendly toast notifications

### Game Logic Flow
1. Player selects characters and starts game
2. Turn-based system alternates between player and AI
3. Questions are validated and responses logged
4. Character elimination based on answers
5. Game ends when final guess is made
6. Score tracking across multiple games

## External Dependencies

### Core AI Service
- **XAI Grok API**: Powers the AI opponent with strategic question generation and intelligent answering
- **OpenAI SDK**: Used as the client library for XAI API communication

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL database (configured but using in-memory storage currently)
- **Replit**: Development and hosting platform with integrated deployment

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Typography including DM Sans, Fira Code, and Geist Mono

### Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: Fast bundling for production builds
- **Drizzle Kit**: Database schema management and migrations
- **React Hook Form**: Form state management with validation

### Additional Libraries
- **TanStack Query**: Powerful data fetching and caching
- **Wouter**: Lightweight routing solution
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Utility for creating component variants
- **Embla Carousel**: Carousel functionality for UI components