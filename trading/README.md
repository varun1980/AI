# TradePro — Real-Time Trading Platform

A fast, low-latency trading platform with Coinbase Advanced integration, rule-based auto-trading, scheduled orders, and enforced 5% max loss protection.

## Features

- **Real-time price feed** via Coinbase Advanced WebSocket (ticker updates every tick)
- **Candlestick charts** with TradingView Lightweight Charts (1m, 5m, 15m, 1h, 4h, 1d)
- **Technical indicators**: RSI, MACD, MA20, MA50, Bollinger Bands
- **One-click order placement** with Market and Limit orders
- **5% max loss enforcement** — server-side hard limit, auto stop-loss calculation
- **Rule-based strategies** — trigger trades on price, RSI, MA crossovers, % change
- **Scheduled orders** — cron-based automated trading (daily buys, weekly DCA, etc.)
- **Trailing stop-loss / Take-profit** monitoring every 2 seconds
- **Full trade history** with P&L tracking, win rate, and performance charts
- **Price alerts** — get notified when targets are hit
- **Paper trading** by default — $10,000 virtual balance, real market prices
- **Portfolio dashboard** with positions, unrealized P&L, and daily performance

## Quick Start

### Using Docker (Recommended)

```bash
cd trading

# Copy env file
cp backend/.env.example backend/.env

# Start everything (PostgreSQL + Redis + Backend + Frontend)
docker-compose up -d

# Frontend: http://localhost:3001
# Backend API: http://localhost:4001/api/v1
```

### Manual Setup

**Backend:**
```bash
cd trading/backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

**Frontend:**
```bash
cd trading/frontend
cp .env.example .env.local
npm install
npm run dev
```

## Connecting Real Coinbase API (Optional)

1. Go to [Coinbase Advanced Trade](https://advanced.coinbase.com/) → Settings → API
2. Create a new API key with `trade` and `view` permissions
3. Add to `backend/.env`:
   ```
   PAPER_TRADING=false
   COINBASE_API_KEY=your_api_key
   COINBASE_API_SECRET=your_api_secret
   ```
4. Restart the backend

## Architecture

```
trading/
├── backend/           # NestJS API (port 4001)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── coinbase/       # Coinbase Advanced REST + WebSocket
│   │   │   ├── market-data/    # Real-time price feeds + indicators
│   │   │   ├── orders/         # Order execution with risk check
│   │   │   ├── risk/           # 5% max loss engine
│   │   │   ├── strategies/     # Rule-based auto-trading
│   │   │   ├── scheduler/      # Cron-based scheduled trades
│   │   │   ├── portfolio/      # Portfolio + position tracking
│   │   │   ├── trade-history/  # Trade records + stats
│   │   │   └── alerts/         # Price alert monitoring
│   │   └── prisma/
│   └── prisma/schema.prisma
└── frontend/          # Next.js 14 (port 3001)
    └── src/
        ├── app/
        │   ├── dashboard/      # Main trading dashboard
        │   ├── strategies/     # Strategy builder
        │   ├── scheduler/      # Scheduled orders
        │   ├── history/        # Trade history
        │   ├── alerts/         # Price alerts
        │   └── settings/       # API config, risk settings
        └── components/
```

## The 5% Rule

Every order goes through the risk engine:

1. **Risk % input** (0.1% – 5%) — how much of your account to risk
2. **Max loss amount** = account balance × risk %
3. **Auto stop-loss** = entry price – (maxLoss / position size)
4. If you provide a stop-loss wider than the limit, it's tightened automatically
5. A **2-second monitor** checks live prices and closes positions at stop-loss/take-profit

## API Endpoints

```
POST   /api/v1/orders              # Place order
POST   /api/v1/orders/risk-check   # Preview risk before placing
GET    /api/v1/orders/open         # Open orders
GET    /api/v1/portfolio/summary   # Portfolio summary
GET    /api/v1/portfolio/performance # Historical performance
GET    /api/v1/trades              # Trade history (paginated)
GET    /api/v1/trades/stats        # Trade statistics
POST   /api/v1/strategies          # Create strategy
PATCH  /api/v1/strategies/:id/activate # Activate strategy
POST   /api/v1/scheduler           # Create scheduled order
POST   /api/v1/alerts              # Set price alert
```

## WebSocket Events (port 4001 /trading namespace)

```
Client → Server:
  subscribe_ticker   { symbol: 'BTC-USD' }
  get_candles        { symbol, granularity, limit }

Server → Client:
  ticker             { symbol, price, bid, ask, changePercent24h, ... }
  exchange_status    { connected: boolean }
  trade_executed     { trade data }
  alert_triggered    { alert data }
  order_update       { order data }
```
