# IOT Print Service

A web-based printing service that allows users to upload files and manages print jobs through a queue system.

## Features

- File upload interface for users
- FIFO queue system for print jobs
- Printer management system with status updates
- Supabase integration for file storage and database

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

## API Routes

- `POST /api/upload` - Upload a new file
- `GET /api/print/next` - Get the next file in queue
- `POST /api/print/status` - Update print job status

## Database Schema

### PrintJobs Table
- id: uuid (primary key)
- filename: string
- status: enum ('pending', 'processing', 'completed', 'failed')
- created_at: timestamp
- updated_at: timestamp 