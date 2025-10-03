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

Kafka consumer service
----------------------

This repository includes a Kafka consumer that listens for customer-related events and applies changes to Users and Billings.

Location
- `src/kafka/config.js` - Kafka client singleton (kafkajs)
- `src/kafka/adapter.js` - Adapter wrapper around kafkajs so the provider can be swapped easily
- `src/kafka/consumer.js` - The consumer implementation and event handlers

Behavior
- The consumer subscribes to the configured topic (see env below) and calls the internal handlers for each event.
- It reads events as JSON objects with the shape: `{ "type": "Customer.Created", "payload": { ... } }`.
- Supported event types and actions:
	- `Customer.Created`: upserts the `User` and initializes a Billing for that user.
	- `Customer.Updated`: updates the `User` data from the event payload.
	- `Customer.Suspended`: sets the `User.isActive` to `false`.
	- `Customer.Deleted`: deletes the `User` and all their Billings.
	- `Customer.Reactivated`: sets the `User.isActive` to `true`.
- The consumer will subscribe `fromBeginning: true` on first startup to process pending events.
- The consumer startup is resilient: it retries connection attempts up to `KAFKA_MAX_RETRIES` (default 5) and will not crash the server if Kafka is unreachable.

Environment variables (Kafka)
- `KAFKA_BROKERS` - comma-separated list of brokers (default: `localhost:9092`). Example: `broker1:9092,broker2:9092`.
- `KAFKA_TOPIC` - topic to subscribe to (default: `customers`).
- `KAFKA_GROUP_ID` - consumer group id (default: `telecomx-billing-consumer`).
- `KAFKA_CLIENT_ID` - client id used by kafkajs (default: `telecomx-billing-service`).
- `KAFKA_MAX_RETRIES` - number of connect retries before giving up (default: `5`).

Billing changes
---------------

- Billing documents now have an auto-incremented `billingId` (stored as a padded string). The sequence is stored in the `Counter` collection.
- On billing creation:
	- `userId` must be supplied and the referenced `User` must exist and be `isActive: true`, otherwise creation returns an error.
	- `generationDate` is set automatically to the current date/time by the controller.
	- `billingId` is generated automatically and returned in the created document.
- All billing CRUD operations that previously used Mongo `_id` now support lookup by `billingId` (the API endpoints still use `/:id` param, which the controllers treat as the `billingId`). Consider renaming route params to `:billingId` for clarity.

Configuration and running
-------------------------

1. Copy `.env.example` to `.env` and update values, including Kafka brokers if you use a remote Kafka.
2. npm install
3. npm run dev

Notes
- If Kafka or MongoDB is unreachable on startup, the server logs errors and keeps running — the consumer skips if it cannot connect (configurable retries).
- For production, use secure connection settings for Kafka (SASL/TLS) and a managed MongoDB instance.


