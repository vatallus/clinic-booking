# Clinic Booking System

A web-based appointment booking system for clinics, built with Next.js, TailwindCSS, Prisma, and Supabase.

## Features

- User authentication with Supabase Auth
- Doctor listing and selection
- Appointment booking
- Appointment management (view, cancel)
- Responsive design

## Tech Stack

- **Frontend**: Next.js, TailwindCSS, ShadcnUI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Supabase
- **ORM**: Prisma
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- PostgreSQL database (provided by Supabase)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd clinic-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
     ```

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
clinic-booking/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes
│   │   ├── book-appointment # Booking page
│   │   ├── my-appointments  # Appointments page
│   │   └── page.tsx         # Home page
│   └── lib/                 # Utility functions
├── prisma/                  # Prisma schema and migrations
├── public/                  # Static assets
└── package.json             # Dependencies and scripts
```

## API Endpoints

- `GET /api/doctors` - Get list of doctors
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/[id]` - Update appointment status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
