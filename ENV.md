# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Admin Authentication
ADMIN_PASSWORD=@Mainpassword87707

# Telegram Configuration (used in frontend)
NEXT_PUBLIC_TELEGRAM_BOT=VIPSignals0_Bot
NEXT_PUBLIC_TELEGRAM_CHANNEL=YourChannelUsername
```

## How to Get MongoDB URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

## Important Notes

- The `ADMIN_PASSWORD` is currently set to `@Mainpassword87707`
- `NEXT_PUBLIC_` prefix makes variables accessible in the browser
- Never commit `.env.local` to GitHub (already in .gitignore)
