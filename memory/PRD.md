# APIPlayground - Product Requirements Document

## Overview
APIPlayground is a mobile-first REST API testing tool built for CSE students using React Native with Expo. It provides a comprehensive interface for building, sending, and analyzing HTTP requests with AI-powered response explanations.

## Tech Stack
- **Frontend**: React Native + Expo (SDK 54), expo-router for navigation
- **Backend**: Python FastAPI with Gemini AI proxy
- **Database**: MongoDB (for backend state if needed)
- **State Management**: React Context + useReducer with AsyncStorage persistence
- **AI**: Google Gemini 3 Flash via Google Gemini API Key
- **Fonts**: Lora (headings), DM Sans (body), IBM Plex Mono (code)
- **Icons**: Phosphor React Native

## Core Features

### 1. Home Screen
- Greeting with dynamic time-based message
- Quick-launch method pills (GET, POST, PUT, PATCH, DELETE)
- Recent requests from history
- Collections overview
- "New Request" primary action button

### 2. Request Builder
- HTTP method selector with bottom sheet
- URL input with send button
- Tabbed interface: Params, Headers, Body, Auth, Variables
- Key-Value editor for params, headers, form data
- JSON body editor
- Auth support: Bearer Token, Basic Auth, API Key
- Environment variables viewer
- Save to collection FAB

### 3. Response Viewer
- Status code with color-coded display (2xx green, 4xx amber, 5xx red)
- Response time and size metrics
- JSON syntax highlighting with token-based coloring
- Response headers viewer
- AI Explain tab with Gemini-powered analysis

### 4. Collections
- Group and organize saved requests
- Expand/collapse collection cards
- Play button to fire requests immediately
- Create new collections with color swatches
- Search/filter collections

### 5. History
- Section-based grouping by date (Today, Yesterday, etc.)
- Delete individual history items
- Clear all history
- Navigate to response details from history

### 6. Environments
- Create and manage environment variables
- Toggle active environment
- Inline variable editing
- Full edit screen for detailed variable management

### 7. WebSocket Client
- Connect/disconnect to WebSocket servers
- Real-time message log (terminal style)
- Send messages
- Connection status indicator

### 8. Settings
- Accent color customization (6 color options)
- Request timeout configuration
- SSL verification toggle
- Follow redirects toggle
- AI explanations on/off
- AI language selector (English, Tamil, Hindi)
- Clear history
- Export/import data
- App info and links

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/ai/explain` - AI-powered response analysis via Gemini 3 Flash

## Design System
- Dark theme: Base #141210, Elevated #1C1916, Surface #232018
- Accent: Sage green #5A7A5C
- Method colors: GET #3D6B4F, POST #3D5470, PUT #7A5C30, PATCH #5C3D70, DELETE #7A3D3D
- No gradients, no glows, no blur effects
- 4px spacing base unit, 10px card radius, 6px input radius

## Status
- **MVP Complete**: All 9 screens fully functional
- **Backend**: AI proxy working with Gemini 3 Flash
- **Testing**: 95%+ pass rate (all core features working)
