# Lab 14 Ballot dApp

Структура проекта:

- `contracts` — Hardhat-проект со смарт-контрактом Ballot
- `frontend` — Next.js App Router приложение для работы с контрактом

## 1. Установка зависимостей

### Смарт-контракт и Hardhat
```bash
cd contracts
npm install
```

### Frontend
```bash
cd ../frontend
npm install
```

## 2. Подготовка переменных окружения

### `contracts/.env`
Создайте файл `.env` на основе `.env.example`:

```env
PRIVATE_KEY=your_wallet_private_key
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
ETHERSCAN_API_KEY=your_etherscan_v2_api_key
VERIFY_ON_DEPLOY=false
```

### `frontend/.env.local`
Создайте файл `.env.local` на основе `.env.example`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=97
```

## 3. Компиляция смарт-контракта

```bash
cd contracts
npm run compile
```

## 4. Деплой в BNB Smart Chain Testnet

```bash
npm run deploy:bscTestnet
```

После деплоя сохраните адрес контракта и вставьте его в `frontend/.env.local`.

## 5. Верификация контракта

```bash
npx hardhat verify --network bscTestnet <DEPLOYED_CONTRACT_ADDRESS> --constructor-args verify-args.js
```

## 6. Запуск frontend

```bash
cd ../frontend
npm run dev
```

Откройте в браузере:

```text
http://localhost:3000
```

## 7. Деплой frontend на Vercel

Добавьте переменные окружения в настройках проекта Vercel:

- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`

Затем выполните деплой любым стандартным способом для Next.js.
