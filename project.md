Create a complete landing page for a SaaS product called **PetAPI Cloud**.

PetAPI Cloud is a developer-focused Cat/Dog API platform that provides reliable pet-related data, images, breeds, facts, and metadata through simple APIs. The landing page should feel modern, clean, trustworthy, and slightly playful, but still professional enough for B2B and developer users.

The product includes a floating AI chat bubble on the landing page. When users click it, they can ask questions about the product, pricing, API usage, documentation, troubleshooting, and general support. The assistant should use RAG over the product documentation and support content.

The landing page should include these sections:

1. Hero section
   Introduce PetAPI Cloud as a fast and reliable Cat/Dog API for developers. Include a strong headline, short subheadline, primary CTA such as “Start Building”, secondary CTA such as “View Docs”, and a small API response preview.

2. Social proof section
   Show simple trust indicators such as uptime, API requests served, developer users, and supported pet data categories.

3. Features section
   Highlight core features:

* Cat and dog images
* Breed information
* Random pet facts
* Search and filtering
* REST API access
* API keys and usage limits
* Fast response time
* Reliable hosted infrastructure

4. AI Support Assistant section
   Explain the chat bubble feature. Users can click the floating chat bubble to ask questions about the API, pricing, docs, account setup, billing, and troubleshooting. The assistant should answer using RAG from product documentation.

5. Developer Experience section
   Show example API endpoints, sample JSON response, SDK-ready structure, API key authentication, and clear documentation.

6. User Dashboard section
   Describe the user dashboard features:

* Account overview
* API key management
* Usage analytics
* Billing and subscription status
* Request logs
* Documentation access
* Support chat history

7. Admin Dashboard section
   Describe the admin dashboard features:

* Manage users
* Manage subscriptions
* View API usage
* Monitor support questions
* Manage documentation
* Upload or edit knowledge base documents
* Re-index documents for RAG
* Review AI assistant answer quality

8. SaaS Core Features section
   Include standard SaaS functionality:

* Authentication
* User profiles
* Teams or organizations
* Role-based access control
* Subscription plans
* Billing management
* API rate limits
* Usage tracking
* Email notifications
* Admin controls

9. Pricing section
   Create three pricing tiers:

* Free
* Pro
* Business
  Each plan should include API request limits, dashboard access, support level, and AI assistant availability.

10. How It Works section
    Explain the flow:
    Sign up → Get API key → Call the API → Track usage → Ask AI assistant when needed.

11. FAQ section
    Answer common questions about API keys, rate limits, data sources, billing, RAG support assistant, and admin document uploads.

12. Final CTA section
    Encourage users to start building with PetAPI Cloud.

Use this tech stack:

* Next.js for the web application
* Supabase for PostgreSQL database, storage, and backend data
* Clerk for authentication and user management
* OpenAI-compatible LLM provider for the AI assistant
* RAG pipeline for documentation-based support
* Vector search for knowledge base retrieval

Design requirements:

* Modern SaaS landing page
* Clean layout with strong spacing
* Friendly pet-inspired visual style
* Developer-focused components
* Floating chat bubble fixed at bottom-right
* Light theme by default
* Responsive design for desktop and mobile
* Clear CTAs throughout the page
* Include realistic UI previews for user dashboard, admin dashboard, API docs, and AI chat assistant

always use pnpm
