# 🎯 Sniper Signals - Premium Trading Signals Platform

A premium, multi-language Telegram Web App for delivering exclusive gold trading signals to VIP subscribers. Built with Next.js 16, featuring glassmorphic design, Arabic/English support, and protected admin panel.

## ✨ Features

### 🌍 Multi-Language Support
- **Auto-detection** of browser language (Arabic/English)
- Manual language toggle
- RTL support for Arabic
- Complete UI translation

### 🎨 Premium Glassmorphic Design
- Modern glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Mobile-first responsive design
- Dark theme with gold accents

### 💰 Subscription Plans
Three pricing tiers without using the word "packages":
- **Monthly**: $79/month
- **Quarterly**: $179/3 months (Save $58)
- **Yearly**: $479/year (Save $469)

### 🔐 Admin Panel
- **Protected Login**: Password-protected admin access at `/admin/login`
- **Dashboard**: Full-featured dashboard at `/admin/dashboard`
- **Image Upload**: Paste from clipboard or upload signal charts
- **Signal Management**: Post, view, and delete signals

### 👥 User Experience
- **VIP Members**: Full access to signal details and charts
- **Free Users**: Blurred preview with upgrade prompts
- **Telegram Integration**: Works seamlessly within Telegram Web App
- **Browser Landing Page**: Converts visitors to subscribers

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection (Required)
MONGODB_URI=your_mongodb_connection_string

# Admin Authentication (Default: @Mainpassword87707)
ADMIN_PASSWORD=@Mainpassword87707

# Telegram Configuration
NEXT_PUBLIC_TELEGRAM_BOT=VIPSignals0_Bot
NEXT_PUBLIC_TELEGRAM_CHANNEL=YourChannelUsername
```

See `ENV.md` for detailed setup instructions.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
signals-vip-app/
├── app/
│   ├── page.js                      # Main landing page (multi-language)
│   ├── layout.js                    # Root layout with fonts
│   ├── globals.css                  # Global styles with glassmorphism
│   ├── admin/
│   │   ├── login/page.js           # Admin login page
│   │   └── dashboard/page.js       # Admin dashboard
│   └── api/
│       ├── signals/
│       │   ├── route.js            # GET/POST signals
│       │   └── [id]/route.js       # DELETE signal
│       └── auth/
│           └── login/route.js       # Admin authentication
├── lib/
│   ├── mongodb.js                   # MongoDB connection
│   └── translations.js              # English/Arabic translations
├── hooks/
│   └── useLanguage.js              # Language management hook
├── models/
│   ├── Signal.js                   # Signal schema
│   └── User.js                     # User schema (VIP status)
└── tailwind.config.js              # Tailwind with custom utilities
```

## 🔑 Admin Access

1. Navigate to `/admin/login`
2. Enter password: `@Mainpassword87707`
3. Access dashboard at `/admin/dashboard`
4. Post signals by pasting images or uploading files

## 🌐 Multi-Language Implementation

The app automatically detects the user's browser language and displays content in:
- **English** for non-Arabic browsers
- **Arabic** with RTL layout for Arabic browsers
- Manual toggle available in navigation

## 📱 Telegram Web App Integration

The app works in two modes:
1. **Browser Mode**: Landing page to convert visitors
2. **Telegram Mode**: Signal delivery app for VIP/Free users

Telegram Web App API automatically initializes when accessed from Telegram.

## 🎨 Design Features

- **Glassmorphism**: `backdrop-blur`, semi-transparent backgrounds
- **Animations**: Fade-in, slide-up, float effects
- **Gold Theme**: Premium gold gradients and accents
- **Responsive**: Mobile-first, works on all screen sizes
- **Dynamic Footer**: Automatically shows current year (2025)

## 🗄️ Database Schema

### User Model
```javascript
{
  telegramId: String (unique),
  isVip: Boolean (default: false),
  name: String
}
```

### Signal Model
```javascript
{
  pair: String,           // e.g., "XAUUSD - GOLD"
  type: String,           // "BUY" or "SELL"
  imageUrl: String,       // Base64 or URL
  createdAt: Date
}
```

## 🔧 Technologies Used

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose
- **Fonts**: Inter (English), Cairo (Arabic)
- **Icons**: Emoji-based for lightweight design

## 📄 License

All Rights Reserved © 2025 Sniper Signals

## 💡 Support

For assistance or feature requests, contact the development team.
