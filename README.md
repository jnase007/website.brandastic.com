# website.brandastic.com

Client website intake for Brandastic.

- `/` is the welcome page. `/onboarding` redirects there.
- `/[slug]` is a private client checklist. Old `/onboarding/[slug]` links redirect here.
- `/admin` is the password-protected admin. Old `/onboarding/admin` links redirect here.

Checklist copy is seeded from `item-library.md`. Library edits apply to new clients. Existing clients keep the items they were given.

## Local

```bash
cp .env.example .env.local
# Set DATABASE_URL, ADMIN_PASSWORD, and SESSION_SECRET
npm install
npm run dev
```
