# BudgetWise - Smart Budget Planning App

A modern budget planning application that helps you understand your true take-home pay based on your location and track spending against your budget.

## Features

- **Tax Calculator**: Enter your zip code to automatically calculate federal, state, and local taxes
- **Budget Management**: Create custom budget categories using percentages or fixed amounts
- **Spending Tracker**: Log transactions and assign them to budget categories
- **Visual Dashboard**: See your spending against budget with intuitive bar charts
- **Multiple Dashboards**: Create separate budgets for different scenarios
- **Real-time Sync**: All changes sync instantly across devices via Convex

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Convex (real-time database)
- **Authentication**: Convex Auth
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-first-budget-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex (requires a free Convex account):
```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex (if not already logged in)
- Create a new Convex project (select "create a new project")
- Generate the `.env.local` file with your `VITE_CONVEX_URL`
- Generate TypeScript types in `convex/_generated/`
- Start the Convex development server

Keep this terminal running!

4. In a **new terminal**, start the Vite development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

6. Create an account and start budgeting!

### Environment Variables

Create a `.env.local` file with:

```env
VITE_CONVEX_URL=<your-convex-deployment-url>
```

This is automatically created when you run `npx convex dev`.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── lib/              # Utilities and helpers
│   ├── App.tsx           # Router configuration
│   └── main.tsx          # App entry point
├── convex/
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Auth configuration
│   ├── dashboards.ts     # Dashboard mutations/queries
│   ├── categories.ts     # Category mutations/queries
│   └── transactions.ts   # Transaction mutations/queries
└── ...
```

## Tax Calculations

The app includes a static tax calculator with:

- **Federal Tax**: 2024 tax brackets for single filers
- **State Tax**: Flat rates for all 50 states + DC
- **Local Tax**: Major city taxes (NYC, Philadelphia, etc.)
- **FICA**: Social Security and Medicare

Note: This is for estimation purposes only. Consult a tax professional for accurate tax advice.

## Design

- **Theme**: Dark mode with warm amber accents
- **Typography**: Playfair Display (headings), Lora (body), JetBrains Mono (numbers)
- **Style**: Clean, minimalist with soft shadows and rounded corners

## License

MIT
