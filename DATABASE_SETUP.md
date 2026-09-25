# Database Setup Instructions

## Step 1: Get Your Neon Database URL

Your Neon database connection string is available in your Neon console:

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project (e.g., "Omnium")
3. Go to your branch and find **Connection Details**
4. Copy the **Connection string** - it looks like:
   ```
   postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Set Up Database Schema

1. In your Neon console, go to **SQL Editor**
2. Open the `database.sql` file from this project
3. Copy the entire SQL content
4. Paste it into the SQL Editor
5. Run the SQL to create the tables

The SQL will create:
- `users` table with username and password_hash
- `sessions` table for session management
- Proper indexes and triggers

## Step 3: Update Your Environment Variables

### For Local Development:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your database URL:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
   NODE_ENV=development
   PORT=3000
   ```

### For Render Deployment:
1. Go to your Render web service
2. Click "Environment" tab
3. Add this environment variable:
   - `DATABASE_URL`: Your Neon connection string
   - `NODE_ENV`: `production`

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Test Authentication

### Local Testing:
1. Start your server: `npm start`
2. Go to `http://localhost:3000`
3. Test username/password registration
4. Test login functionality

### Production Testing:
1. Deploy to Render
2. Access your app at the Render URL
3. Test authentication flows

## Important Notes:

- **Password Security**: Passwords are hashed using bcrypt before storage
- **Session Management**: Sessions are stored in the database with expiration
- **Username Uniqueness**: Usernames must be unique in the database
- **SQL Injection Protection**: Using parameterized queries

## Authentication Flow:

1. **Registration**: Users create username/password → Password is hashed → Stored in database
2. **Login**: Users enter credentials → Password is verified against hash → Session created
3. **Session**: Session ID stored in cookie → Session data stored in database
4. **Logout**: Session is deleted from database → Cookie is cleared

## Troubleshooting:

### Database Connection Issues:
- Ensure your `DATABASE_URL` is correct
- Check that your Neon database is active
- Verify SSL is enabled (required for Neon)

### Authentication Issues:
- Check that the database schema was created correctly
- Verify the SQL was executed without errors
- Check server logs for database errors

### Session Issues:
- Ensure cookie-parser middleware is working
- Check that sessions are being created in the database
- Verify session expiration is working correctly

## Security Best Practices:

1. **Password Hashing**: Using bcrypt with salt rounds of 10
2. **SQL Injection**: Using parameterized queries
3. **Session Security**: HTTP-only cookies in production
4. **SSL Required**: Database connections use SSL
5. **Input Validation**: Client and server-side validation

That's it! Your authentication system now uses PostgreSQL for secure user and session storage.