# Trippy - Ride Sharing, Intercity Travel & Set Your Own Fare in Bangladesh

Trippy is Bangladesh's premier fair-fare ride-sharing and intercity travel platform. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- **Set Your Own Fare Bidding**: Interactive dynamic fare proposer (±50 BDT steps, quick percentage chips) with real-time simulated counter-offers from verified drivers.
- **Specialized Bangladesh Fleet**: Comprehensive specifications, luggage capacities, and negotiable pricing for:
  - **Sedan Premium** (Axio, Allion, Premio - 4 Seats)
  - **Toyota Noah** (Family 7-Seater)
  - **Toyota Hiace Microbus** (11-Seater Group Transport)
  - **Mountain Chander Gari** (4x4 Offroad Jeep for Sajek Valley, Nilgiri & Bandarban)
- **Live GPS Tracking Portal**: Turn-by-turn route tracking along the Dhaka N3 Highway, real-time fluctuating telemetry (speed, remaining distance, battery), 70% milestone tracker, and emergency SOS (999).
- **Public Shared Links**: Shareable trip links with one-click clipboard copy for passenger family monitoring.
- **Mobile App Experience Hub**: Store badges for Google Play, Apple App Store, Direct APK download, and interactive smartphone mockups of In-App Driver Chat, Receipts & Reviews, and Trip History.
- **Intercity Route Guide**: Travel corridor pricing for Dhaka ↔ Chittagong, Dhaka ↔ Sylhet, and Dhaka ↔ Cox's Bazar.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Obsidian Glassmorphism System
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Outfit, Inter, JetBrains Mono (via `next/font`)

---

## 📁 Project Structure

```
trippy-website/
├── public/                 # Vehicle & in-app screenshot assets
├── src/
│   ├── app/                # App Router routes (/, /booking, /fleet, /tracking, /app)
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   ├── common/         # Badge, QrCodeBox, FaqAccordion, Testimonials
│   │   ├── hero/           # HeroSection, HeroBookingWidget, LiveRadarMap
│   │   ├── features/       # FeaturesGrid, HowItWorks, AppDownloadBanner
│   │   ├── fleet/          # FleetCatalog, IntercityRoutes
│   │   ├── booking/        # BookingPortal
│   │   ├── tracking/       # TrackingPortal
│   │   └── app-hub/        # AppHubPortal
│   └── types/              # TypeScript interfaces (fleet, booking)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```
