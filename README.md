# website.brandastic.com

Client website intake for Brandastic, plus the existing channel onboarding page.

- `/` and `/onboarding` serve the original onboarding page, unchanged.
- `/onboarding/[slug]` is a private client checklist.
- `/onboarding/admin` is the password-protected admin for Sandy.

Checklist copy is seeded from `item-library.md`. Library edits apply to new clients. Existing clients keep the items they were given.

## Local

```bash
cp .env.example .env.local
# Set DATABASE_URL, ADMIN_PASSWORD, and SESSION_SECRET
npm install
npm run dev
```
