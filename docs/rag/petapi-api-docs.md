# PetAPI Cloud API Documentation

## Overview

PetAPI Cloud is a hosted cat and dog API for product teams that need pet images, breed metadata, pet facts, and simple search responses. The API is designed for server-side usage with bearer API keys created from the user dashboard.

Use this document as the primary knowledge base source for questions about authentication, plans, limits, endpoints, response shape, errors, and dashboard workflows.

## Authentication

All live API requests require a bearer API key.

```http
Authorization: Bearer <pet_api_key>
```

Create API keys from the dashboard. Label keys by environment, such as development, staging, or production. Keep live keys server-side and never expose secret API keys in browser code, mobile apps, public repositories, or client-side environment variables.

If Supabase is not configured in a local development environment, demo responses may be available without a real API key. Production deployments should always validate API keys.

## Plans And Limits

The Free plan includes 10,000 API requests per month. Free is best for prototypes, demos, and low-volume development.

The Pro plan includes 500,000 API requests per month. Pro is intended for production apps that need higher monthly usage, dashboard API-key management, usage tracking, and access to the standard PetAPI Cloud endpoints.

The Business plan supports custom request limits, SLA options, team roles, and dedicated support. Business is appropriate for high-volume or contractual production use.

If a customer asks what is included in Pro, answer: Pro includes 500,000 requests per month, production-oriented API access, dashboard-managed API keys, usage tracking, and the standard cat and dog API endpoints.

## Base URL

Use the deployed application origin as the base URL.

```text
https://<your-domain>/api/v1
```

Local development usually runs at:

```text
http://localhost:3000/api/v1
```

## Standard Response Shape

Successful API responses return a `data` object or array and a `meta` object.

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "latency_ms": 12,
    "mode": "live"
  }
}
```

The `request_id` is also sent as the `x-request-id` response header. Include this value when contacting support about a specific request.

## Errors

If the request does not include a bearer API key, the API returns HTTP 401.

```json
{
  "error": "Missing API key. Send Authorization: Bearer <pet_api_key>."
}
```

If the API key is invalid, inactive, or revoked, the API returns HTTP 401.

```json
{
  "error": "Invalid or revoked API key."
}
```

When troubleshooting errors, check the request ID, API key status, plan limits, billing status, and whether the key has been revoked.

## Get Random Pet Image

```http
GET /api/v1/images/random
```

Returns one cat or dog image.

Query parameters:

- `species`: optional. Use `cat` or `dog`.
- `breed`: optional. Use a breed slug such as `shiba-inu`.

Example:

```bash
curl "https://<your-domain>/api/v1/images/random?species=dog&breed=shiba-inu" \
  -H "Authorization: Bearer <pet_api_key>"
```

Example response:

```json
{
  "data": {
    "id": "pet_img_9a41",
    "species": "dog",
    "breed": "shiba inu",
    "image_url": "https://cdn.petapi.cloud/dogs/shiba-9931.jpg",
    "metadata": {
      "width": 1600,
      "height": 1067,
      "tags": ["alert", "outdoor", "family-friendly"]
    }
  },
  "meta": {
    "request_id": "uuid",
    "latency_ms": 12,
    "mode": "live"
  }
}
```

## List Breeds

```http
GET /api/v1/breeds
```

Returns breed metadata.

Query parameters:

- `species`: optional. Use `cat` or `dog`.
- `size`: optional. Example values include `small-medium` and `large`.

Example:

```bash
curl "https://<your-domain>/api/v1/breeds?species=cat" \
  -H "Authorization: Bearer <pet_api_key>"
```

Breed objects include `species`, `slug`, `name`, `temperament`, `origin`, and `size`.

## Get Random Pet Fact

```http
GET /api/v1/facts/random
```

Returns one cat or dog fact.

Query parameters:

- `species`: optional. Use `cat` or `dog`.

Example:

```bash
curl "https://<your-domain>/api/v1/facts/random?species=dog" \
  -H "Authorization: Bearer <pet_api_key>"
```

Fact objects include `species` and `fact`.

## Search Pets

```http
GET /api/v1/search
```

Searches images, breeds, and facts.

Query parameters:

- `query`: required for useful results. Search across species, breed names, temperament, image tags, and fact text.

Example:

```bash
curl "https://<your-domain>/api/v1/search?query=gentle" \
  -H "Authorization: Bearer <pet_api_key>"
```

Search responses include `images`, `breeds`, and `facts` arrays.

## Dashboard Workflow

Users can sign in with Clerk and open the dashboard to create API keys. Each key has a name, prefix, hashed secret, scopes, active status, monthly limit, and last-used timestamp.

Admins can open the admin dashboard to upload documentation, upload RAG files, invite admin users, and re-index the knowledge base. Only super admins can invite other admins. Admins can upload documents and test the RAG assistant but cannot invite admins unless they are super admins.

## RAG Support Assistant

The support assistant answers from uploaded product documentation and API documentation. Good RAG uploads should be focused and factual. Prefer dedicated documents for pricing, authentication, endpoint reference, error handling, and dashboard workflows instead of one large unrelated file.

After uploading new documentation, run the admin re-index action. Re-indexing regenerates document chunks and embeddings for retrieval.
