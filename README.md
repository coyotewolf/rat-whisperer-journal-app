# 🐀 Rat Care Tracker

A comprehensive care management application designed for pet rat owners, helping you track the health, diet, behavior, and daily care of each of your furry friends.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Technical Architecture](#technical-architecture)
- [User Guide](#user-guide)
- [Page Navigation](#page-navigation)
- [AI Features](#ai-features)
- [Data Security](#data-security)
- [Development Information](#development-information)

---

## Project Overview

### 🎯 Purpose

Rat Care Tracker was born from a love for pet rat care. Although pet rats are small in size, they require careful attention and observation. This application aims to:

1. **Systematic Recording**: Provide a structured way to record daily feeding, health checks, weight changes, and other important information
2. **Health Monitoring**: Analyze health trends through AI to detect potential issues early
3. **Behavior Observation**: Track group interaction behaviors to understand social hierarchy dynamics
4. **Care Reminders**: Smart reminder system ensures important care tasks are never missed
5. **Data Visualization**: Transform care data into easy-to-understand charts and reports

### 👥 Target Users

- Pet rat owners (whether beginners or experienced keepers)
- Pet rat breeders
- Pet rat rescue organizations
- Veterinary clinics (tracking patient records)

---

## Core Features

### 🐁 Rat Profile Management

| Feature | Description |
|---------|-------------|
| Personal Info | Record name, gender, birthdate, coat color, ear type, coat type |
| Personality Tags | Custom personality descriptions (friendly, shy, curious, active, calm, etc.) |
| Profile Photo | Support photo cropping and upload |
| Status Tracking | Mark as active, deceased, etc. |

### 📝 Multiple Log Types

Supports six types of log entries:

| Log Type | Content |
|----------|---------|
| 🍽️ Feeding Log | Food type, portion, eating behavior |
| ⚖️ Weight Log | Weight value, body condition assessment |
| 🏥 Health Log | Symptoms, treatment, veterinary diagnosis |
| 💊 Medication Log | Medication name, dosage, frequency |
| 🎭 Behavior Log | Social interactions, special behavior observations |
| 🏠 Environment Log | Cage cleaning, environment changes |

### ✅ Task Management

- **Task Creation**: Set title, description, priority, due date
- **Recurring Tasks**: Support daily, weekly, monthly, and other periodic tasks
- **Rat Association**: Assign tasks to specific rats
- **Quick Suggestions**: Preset common task templates (feeding, water change, cage cleaning, etc.)

### 🔔 Smart Reminders

The system automatically calculates and reminds based on log entries:

- Feeding reminder (no feeding recorded for set number of days)
- Water change reminder
- Cage cleaning reminder
- Weight measurement reminder
- Health check reminder
- Medication reminder

### 📊 Data Reports

| Report Type | Analysis Content |
|-------------|------------------|
| Weight Trend | Weight change curves, increase/decrease analysis |
| Health Report | Health event statistics, common symptom analysis |
| Behavior Analysis | Behavior pattern recognition, interaction frequency |
| Hierarchy Analysis | AI analysis of group social structure and dominance relationships |
| Feeding & Environment | Diet habits and environment maintenance statistics |
| Daily Summary | Daily care activity overview |

---

## Technical Architecture

### 🛠️ Frontend Stack

```
├── React 18          # UI Framework
├── TypeScript        # Type Safety
├── Vite              # Build Tool
├── Tailwind CSS      # Styling Framework
├── shadcn/ui         # UI Component Library
├── Framer Motion     # Animations
├── Recharts          # Chart Visualization
├── i18next           # Internationalization (Traditional Chinese/English)
└── React Router      # Route Management
```

### ☁️ Backend Services (Lovable Cloud)

```
├── Supabase
│   ├── PostgreSQL    # Relational Database
│   ├── Auth          # User Authentication
│   ├── Storage       # File Storage
│   └── Edge Functions # Serverless Functions
└── Gemini API        # AI Analysis Engine
```

### 📁 Project Structure

```
src/
├── components/           # Reusable Components
│   ├── ui/              # Base UI Components (shadcn)
│   ├── log-forms/       # Log Form Components
│   ├── reports/         # Report Chart Components
│   └── settings/        # Settings Page Components
├── contexts/            # React Context
├── hooks/               # Custom Hooks
├── pages/               # Page Components
├── services/            # API Service Layer
├── types/               # TypeScript Type Definitions
├── utils/               # Utility Functions
└── integrations/        # Third-party Integrations

supabase/
└── functions/           # Edge Functions
    ├── hierarchy-analysis/  # AI Hierarchy Analysis
    ├── daily-interaction-survey/  # Daily Survey
    ├── get-mapbox-token/    # Map Service
    └── delete_user_by_id/   # Account Deletion
```

---

## User Guide

### 🚀 Quick Start

1. **Register Account**
   - Register with email
   - Verify email to log in

2. **Initial Setup**
   - System automatically creates three sample rats
   - Edit or delete them on the "Rats" page

3. **Add Your Rats**
   - Click "Add Rat" button
   - Fill in basic info and upload photo

4. **Start Recording**
   - Use quick log buttons on the home page
   - Or add detailed logs on the "Logs" page

### 📱 Quick Log (FAB)

The floating button at the bottom right of the home page provides common quick log functions:

- 🍽️ Feeding
- 💧 Water Change
- ✨ Cage Cleaning
- 🚽 Toilet Cleaning

Click to create a log instantly with default values for quick recording.

### ⚙️ Custom Settings

Adjustable in the settings page:

| Setting | Description |
|---------|-------------|
| Reminder Frequency | Adjust day thresholds for various reminders |
| Quick Actions | Customize quick log buttons and default values |
| Personality Tags | Manage available personality tags |
| Log Tags | Customize log category tags |
| Task Suggestions | Edit preset task templates |
| Appearance Theme | Switch light/dark mode |
| Language | Traditional Chinese/English |

---

## Page Navigation

### 🏠 Home (Dashboard)

- AI health status overview
- Smart care reminders
- Today's to-do tasks
- Recent activity log
- Quick log buttons

### 🐀 Rats

- All rat card list
- Quick view basic info
- Add/edit/delete rats
- View complete logs for individual rats

### 📋 Logs

- Timeline-style log list
- Filter and search functions
- Multi-select batch delete
- Add various log types

### ✅ Tasks

- To-do task list
- Quick complete/postpone
- Recurring task settings
- Task suggestion templates

### 📊 Reports

- Weight trend chart
- Health report
- Behavior analysis
- AI hierarchy analysis
- Feeding & environment statistics

### ⚙️ Settings

- Account management
- Reminder settings
- Appearance & language
- Tag management

---

## AI Features

### 🤖 Health Status Analysis

Uses Gemini AI to analyze recent log data and generate conversational health status summaries:

- Analyze weight change trends
- Identify abnormal behavior patterns
- Provide personalized care suggestions
- Cache results for performance optimization

### 🏆 Social Hierarchy Analysis

Analyze group interaction behavior through AI:

- Calculate dominance scores (-100 to +100)
- Rank group hierarchy order
- Identify dominant/submissive behaviors
- Generate interaction pattern reports
- Provide group management suggestions
- Track hierarchy change trends

### 📊 Analysis Cache Mechanism

- Smart caching reduces API calls
- Auto-invalidate when data changes
- Support forced re-analysis

---

## Data Security

### 🔐 Data Protection

- **Encrypted Transmission**: All data transmitted via HTTPS encryption
- **Row Level Security**: Database-level access control
- **User Isolation**: Each user can only access their own data

### 🗑️ Account Deletion

- Delete account in settings
- All data permanently deleted after deletion
- This action cannot be undone

---

## Development Information

### 📦 Environment Requirements

- Node.js 18+
- npm or bun

### 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build
```

### 🌐 Environment Variables

```env
VITE_SUPABASE_URL=           # Supabase Project URL
VITE_SUPABASE_PUBLISHABLE_KEY=  # Supabase Public Key
```

### 🔑 Secrets (Edge Functions)

| Secret Name | Purpose |
|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini AI Analysis |
| `MAPBOX_PUBLIC_TOKEN` | Mapbox Map Service |

### 📝 Database Structure

Main Tables:

| Table | Purpose |
|-------|---------|
| `rats` | Rat basic info |
| `log_entries` | Log entries |
| `tasks` | Task list |
| `reminder_settings` | Reminder settings |
| `quick_log_actions` | Quick log buttons |
| `personality_tags` | Personality tags |
| `log_tag_categories` | Log tag categories |
| `log_tag_suggestions` | Log tag suggestions |
| `task_suggestions` | Task suggestion templates |
| `hierarchy_analysis_cache` | AI analysis cache |
| `rat_rank_history` | Hierarchy history records |

---

## 🌟 Highlights

1. **🎨 Beautiful Interface**: Soft macaron color scheme, friendly user experience
2. **🤖 AI-Powered**: Smart health analysis and hierarchy analysis
3. **📱 Responsive Design**: Support desktop and mobile devices
4. **🌍 Multi-language Support**: Traditional Chinese and English interface
5. **🔄 Real-time Sync**: Cloud storage, cross-device usage
6. **⚡ Quick Recording**: One-click daily log completion
7. **📊 Data Visualization**: Intuitive charts and reports

---

## 📮 Contact & Feedback

For any suggestions or issues, feel free to reach out:

- Submit an Issue
- Send a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <img src="src/assets/pixel-rat.png" alt="Pixel Rat" width="64" />
  <br />
  <strong>Rat Care Tracker</strong>
  <br />
  Caring for every furry friend with love 🐀❤️
</p>
