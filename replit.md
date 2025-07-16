# AOU GPA Calculator

## Overview

This is a full-stack GPA calculator application built specifically for Arab Open University (AOU) students. The application allows students to select their department and major, add courses with grades across multiple semesters, and calculate their cumulative GPA based on AOU's grading system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: In-memory storage with session IDs
- **API Structure**: RESTful endpoints under `/api` prefix

### Database Schema
The application uses a PostgreSQL database with the following tables:
- `departments`: Academic departments (id, name)
- `majors`: Academic majors linked to departments (id, name, departmentId)
- `courses`: Course catalog (code, name, credits, departmentId, majorId, prerequisites)
- `user_records`: User session data (sessionId, departmentId, majorId, semesters as JSON)

## Key Components

### Frontend Components
- **GPACalculator**: Main application component managing state and calculations
- **DepartmentMajorSelection**: Dropdowns for selecting academic information
- **SemesterManagement**: Interface for managing semesters and courses
- **CourseSearch**: Search functionality for adding courses to semesters
- **GradeScale**: Display of AOU grading scale and grade points

### Backend Components
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **Route Handlers**: Express routes for departments, majors, courses, and user records
- **Database Integration**: Drizzle ORM for type-safe database operations

## Data Flow

1. **Initial Setup**: User selects department and major from populated dropdowns
2. **Semester Management**: User creates semesters and searches for courses to add
3. **Course Addition**: Real-time course search with duplicate prevention
4. **Grade Entry**: Users assign grades to courses using AOU grading scale
5. **GPA Calculation**: Automatic calculation of semester and cumulative GPA
6. **Data Persistence**: Session-based storage of user progress

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: JavaScript bundler for production builds

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations in `migrations/` directory

### Environment Setup
- **Development**: `npm run dev` starts both frontend and backend
- **Production**: `npm run build` creates optimized builds
- **Database**: `npm run db:push` applies schema changes

### Configuration Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- Environment variables for any additional external services

## Recent Changes

### December 2024 Updates:
- **Grading System Correction**: Updated to use official AOU grading scale (A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D=1.5, F=0.0)
- **Firebase Integration**: Added Firebase/Firestore configuration for production data storage
- **Enhanced Course Catalog**: Updated with official AOU course data from Kuwait campus including:
  - Computer Science: M110 (Python Programming), M115 (Python for ML and DS), M109 (.NET Programming)
  - IT: T215A/B (Communication and IT), T216A/B (Cisco Networking)
  - Graphics: GD111 (Visual Perception), GD124 (Digital Photography), GD126 (Multimedia Design)
  - Business: BUS110, B207A/B, BUS310 courses
  - Additional majors: Accounting, English, Education with respective courses
- **Authentic Data**: Replaced placeholder data with real AOU course information sourced from official websites
- **Firestore Integration**: Full migration to Cloud Firestore for all data storage operations
- **Case-Insensitive Search**: Implemented case-insensitive course search functionality
- **Course Data Population**: Firestore collections populated with authentic AOU course data

### July 2025 Updates:
- **Complete Firestore Migration**: Replaced in-memory storage with Cloud Firestore for all data operations
- **Enhanced Course Search**: Case-insensitive search allows users to find courses by code or name regardless of letter case
- **Firestore Collections**: Created departments, majors, courses, and user_records collections in Firestore
- **Server-Side Firebase Config**: Added dedicated Firebase configuration for server-side Firestore operations

The application is designed to be deployed on platforms like Replit, with automatic database provisioning and environment variable management. Firebase integration is ready for production use with authentic course data.