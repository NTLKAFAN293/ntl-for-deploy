# Data Analysis Tool for Product Managers

## Overview

This is a full-stack web application for product managers that helps scrape data from websites and social media platforms. The platform provides a comprehensive interface for data collection with features including web scraping tools, social media data collection, AI-powered data analysis chatbot, and real-time data visualization. Users can collect data from various sources, analyze it with AI assistance, and generate insights for product decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing with pages for Dashboard and Bot Editor
- **UI Components**: Shadcn/ui component library built on Radix UI primitives providing consistent design
- **Styling**: Tailwind CSS with custom color scheme and RTL (Right-to-Left) support for Arabic interface
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Code Editor**: Monaco Editor integration for syntax highlighting and JavaScript/TypeScript editing
- **Forms**: React Hook Form with Zod validation for form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Bot Management**: Custom BotManager service for Discord.js bot lifecycle management
- **File Handling**: Multer for file uploads with validation and size limits
- **Development**: Vite integration for hot module replacement in development mode

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Session Management**: PostgreSQL session store using connect-pg-simple

### Database Schema
- **Bots Table**: Stores bot configurations including name, description, token, code, and status
- **AI Chats Table**: Stores conversation history between users and AI assistant
- **Users Table**: Basic user authentication with username and password

### Authentication and Authorization
- **Session-based Authentication**: Express sessions stored in PostgreSQL
- **User Management**: Basic username/password authentication system
- **Security**: CORS handling and credential-based requests

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for database connectivity
- **discord.js**: Official Discord API library for bot functionality and webhook management
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect for database operations
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation

### AI Integration
- **OpenAI API**: GPT-based AI assistant for coding help and bot development guidance
- **Custom AI Assistant Service**: Wrapper around OpenAI API with conversation history management

### UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **class-variance-authority**: Utility for creating variant-based component APIs
- **tailwindcss**: Utility-first CSS framework with custom theme configuration
- **cmdk**: Command palette component for enhanced user interactions

### Development Tools
- **Vite**: Build tool with plugin ecosystem including React support and error overlay
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development environment integration
- **Monaco Editor**: In-browser code editor with TypeScript support

### File Processing
- **multer**: Middleware for handling multipart/form-data file uploads
- **fs/promises**: Node.js filesystem operations for file handling

### Date and Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: URL-safe unique string ID generator
- **clsx** and **tailwind-merge**: Utility functions for conditional CSS classes