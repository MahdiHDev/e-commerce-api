# Spark Ecommerce API

Backend API for **Spark Men's Fashion**, an e-commerce platform for
managing customer authentication, product categories, brands, and
products.

## Features

- User registration, login, Google authentication, and email
  verification
- Password recovery, reset, and change flows
- Access to a refresh-token endpoint
- Category management, including soft deletion and restoration
- Brand management with logo uploads
- Product management with product images and variant-specific images
- Product variants with SKU, price, stock quantity, and attributes

## Tech Stack

The backend is built with:

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Better Auth
- Cloudinary for image storage

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm (or your preferred package manager)
- PostgreSQL
- A Cloudinary account if you plan to use image uploads

### Installation

```bash
git clone <your-repository-url>
cd <repository-folder>
npm install
```

### Environment Variables

Create a `.env` file in the project root and add the environment
variables required by your application.

At minimum, configure the values needed for:

- Database connection
- Authentication and session handling
- Google OAuth, if Google login is enabled
- Cloudinary credentials
- Application port and base URL

Use the variable names expected by the source code. Do not commit `.env`
files, API secrets, OAuth secrets, database credentials, or real user
passwords.

### Database Setup

Configure your PostgreSQL connection, then run the Prisma commands used
by this repository to generate the client and apply migrations.

```bash
npx prisma generate
npx prisma migrate dev
```

> If this project uses a custom Prisma schema path or Prisma
> configuration, include the appropriate configuration when running
> these commands.

### Run the Application

Use the scripts defined in `package.json` to start the development
server or build the production application.

```bash
npm run
```

This lists the scripts available in the project.

## API Overview

The API collection uses the `{{spark}}` Postman variable as its base
URL.

Set `spark` in your Postman environment to your server URL, for example:

```text
http://localhost:<PORT>
```

The routes below are relative to that base URL.

### Authentication

Base route: `/api/v1/auth`

Method Endpoint Description

---

POST `/register` Register a user
POST `/login` Log in with email and password
GET `/login/google` Start Google login
POST `/verify-email` Verify an email using an OTP
POST `/forget-password` Request a password-reset OTP
POST `/reset-password` Reset a password using an OTP
POST `/change-password` Change the current password
POST `/refresh-token` Request a refreshed authentication token

**Example --- register**

```json
{
    "name": "Your Name",
    "email": "you@example.com",
    "password": "your-secure-password"
}
```

**Example --- login**

```json
{
    "email": "you@example.com",
    "password": "your-secure-password"
}
```

**Example --- verify email**

```json
{
    "email": "you@example.com",
    "otp": "YOUR_OTP"
}
```

**Example --- request password reset**

```json
{
    "email": "you@example.com"
}
```

**Example --- reset password**

```json
{
    "email": "you@example.com",
    "otp": "YOUR_OTP",
    "newPassword": "your-new-password"
}
```

**Example --- change password**

```json
{
    "currentPassword": "your-current-password",
    "newPassword": "your-new-password"
}
```

### Categories

Base route: `/api/v1/categories`

Method Endpoint Description

---

POST `/` Create a category
GET `/` Get all categories
GET `/:id` Get a category by ID
PATCH `/:id` Update a category
DELETE `/:id` Delete a category
PATCH `/restore/:id` Restore a deleted category

**Create category body**

```json
{
    "name": "T-Shirts",
    "slug": "t-shirts"
}
```

The collection also demonstrates optional query parameters for listing
categories:

- `page`
- `limit`
- `searchTerm`

### Brands

Base route: `/api/v1/brands`

Method Endpoint Description

---

POST `/` Create a brand
GET `/` Get all brands
GET `/:id` Get a brand by ID
PATCH `/:id` Update a brand
DELETE `/:id` Delete a brand
PATCH `/restore/:id` Restore a deleted brand

Brand creation and update use `multipart/form-data`.

Field Type Description

---

`data` Text JSON string containing brand fields
`brandLogo` File Brand logo image

**Example `data` value**

```json
{
    "name": "Nike",
    "slug": "nike",
    "description": "Brand description"
}
```

The collection demonstrates these optional query parameters when listing
brands:

- `searchTerm`
- `page`
- `limit`

### Products

Base route: `/api/v1/product`

Method Endpoint Description

---

POST `/` Create a product
PATCH `/:id` Update a product

The Postman collection also contains test routes:

- `GET /api/v1/product/test`
- `GET /api/v1/product/test/admin`

These appear to be testing endpoints; confirm their purpose before
exposing them in production.

Product creation and update use `multipart/form-data`.

---

Field Type Description

---

`data` Text JSON string containing
product details and
variants

`productImages` File(s) Main product images

`variantImages_<group>` File(s) Images associated with
a variant image group

---

**Example product `data` value**

```json
{
    "name": "Oversized Hoodie",
    "slug": "oversized-hoodie",
    "description": "Heavyweight fleece hoodie with a relaxed fit",
    "categoryId": "CATEGORY_ID",
    "status": "ACTIVE",
    "variants": [
        {
            "sku": "HOD-NVY-M",
            "price": 1200,
            "compareAtPrice": 1500,
            "stockQuantity": 12,
            "attributes": {
                "color": "Navy",
                "size": "M"
            }
        },
        {
            "sku": "HOD-NVY-L",
            "price": 1200,
            "compareAtPrice": 1500,
            "stockQuantity": 9,
            "attributes": {
                "color": "Navy",
                "size": "L"
            }
        }
    ]
}
```

For variant images, use a multipart field matching the image-group
convention used by the API. For example, a variant with the image group
`Navy` uses the field `variantImages_Navy`.

The product examples in the collection use statuses such as `ACTIVE` and
`DRAFT`. Confirm the complete set of accepted enum values in the
application schema.

## Postman Collection

A Postman collection named **Spark Ecommerce** is available for testing
the endpoints.

1.  Import the collection into Postman.
2.  Create or select a Postman environment.
3.  Add a variable named `spark`.
4.  Set its value to your local or deployed API base URL.
5.  Send requests in the relevant folders: `auth`, `Categories`,
    `brand`, and `create product`.
6.  For protected endpoints, authenticate first and allow Postman to
    send the authentication credentials or cookies required by your
    application.

Use your own test accounts, OTPs, IDs, and image files. The exported
collection contains example request data; do not treat those values as
production credentials.

## Important Notes

- Use valid database IDs for category and product references.
- Send brand and product image requests as `multipart/form-data`.
- Send the `data` multipart field as valid JSON text.
- Do not manually set the multipart `Content-Type` header in Postman;
  let Postman generate the boundary.
- Protect admin or other restricted routes with the authorization
  rules implemented by the backend.
- Validate uploads and request payloads on the server.
- Keep secrets in environment variables and rotate any credentials
  that may have been committed or shared.
- Review test endpoints and remove or restrict them before production
  deployment.

## Project Status and Contributions

This README documents the routes represented in the supplied Postman
collection. For exact setup scripts, environment-variable names,
authorization requirements, response formats, and additional modules,
refer to the repository source code and its `package.json`, Prisma
schema, and route definitions.

If you contribute:

1.  Create a feature branch.
2.  Keep changes consistent with the existing TypeScript and project
    structure.
3.  Test affected endpoints with the Postman collection.
4.  Open a pull request with a clear description of the changes.

## License

Add the license used by this repository here.
