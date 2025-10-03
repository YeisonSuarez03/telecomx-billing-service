# TelecomX Billing Service

Express + MongoDB (Mongoose) billing service skeleton.

Getting started

1. Copy `.env.example` to `.env` and fill in values.
2. npm install
# TelecomX Billing Service

Express + MongoDB (Mongoose) billing service skeleton.

Getting started

1. Copy `.env.example` to `.env` and fill in values.
2. npm install
3. npm run dev

Seed example data (optional):

1. Ensure MongoDB is running and `.env` has `MONGODB_URI`.
2. node src/seed.js

API

Users
- POST /api/users -> create user
- GET /api/users -> list users
- GET /api/users/:id -> get user by Mongo _id
- PUT /api/users/:id -> update
- DELETE /api/users/:id -> delete

Billings
- POST /api/billings -> create billing
- GET /api/billings -> list billings
- GET /api/billings/:id -> get billing by Mongo _id
- PUT /api/billings/:id -> update
- DELETE /api/billings/:id -> delete

Example models

User example:

{
	"_id": "68ddaa4dcba130bb01c826d4",
	"userId": "12122121-eefwedf-1121333",
	"address": {
		"city": "Cali",
		"country": "Colombia",
		"zipCode": "760001",
		"address": "Calle 13 #64-40"
	},
	"isActive": true
}

Billing example:

{
	"_id": "68dda9dfb24aa93e5f012862",
	"userId": "11211232-eferfef-1233424",
	"billingId": "000011232",
	"generationDate": "2025-10-01T09:15:00",
	"dueDate": "2025-10-15",
	"serviceId": "1",
	"totalInvoice": "125000",
	"isPaid": false,
	"paymentDate": null
}

Notes

- Models use `userId` and `billingId` as application-level identifiers while MongoDB `_id` remains the primary key.
- `totalInvoice` is stored as a Number (integer cents or whole currency units depending on your preference). Adjust types if you prefer strings or integer cents.

Next steps (suggested)

- Add validation (e.g., using Joi or express-validator).
- Add pagination for list endpoints.
- Add integration tests and CI.

