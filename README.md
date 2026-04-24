# RentAuto

A full-stack car rental platform built with **Angular** and **NestJS**, featuring real-time updates, Stripe payment integration, role-based access control and an admin panel.

---

## Tech Stack

| Layer    | Technology                             |
| -------- | -------------------------------------- |
| Frontend | Angular 17, TypeScript                 |
| Backend  | NestJS, TypeScript                     |
| Database | TypeORM + PostgreSQL                   |
| Auth     | JWT + Role-based Access Control (RBAC) |
| Payments | Stripe                                 |

---

## 📁 Project Structure

```
RentAuto/
├── rentAuto-web/      # Angular frontend
└── rentAuto-api/      # NestJS backend
```

---

## Features

- **Car catalog** — browse available vehicles with filters
- **Booking system** — reserve a car for specific dates
- **Stripe payments** — secure online payment integration
- **Authentication** — JWT-based login and registration
- **User roles (RBAC)** — admin and customer roles
- **Admin panel** — manage cars, users and reservations

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Stripe account (for payments)

### Backend (NestJS)

```bash
cd rentAuto-api
npm install
cp .env.example .env   # fill in your DB and Stripe credentials
npm run start:dev
```

### Frontend (Angular)

```bash
cd rentAuto-web
npm install
ng serve
```

App runs at `http://localhost:4200`  
API runs at `${environment.apiUrl}`

---

## Environment Variables

Create a `.env` file inside `rentAuto-api/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=rentauto

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 👨‍💻 Authors

- [@Arturoo19](https://github.com/Arturoo19)
