# Security notice and credential rotation

## Previous exposure

Older commits of this **public** repository contained backend and frontend `.env` files. The current source tree no longer tracks those files, and `.gitignore` excludes local environment settings and generated outputs.

**Important:** Deleting tracked secrets in a later commit does **not** erase them from Git history, forks, clones, or external caches. GitHub access to the repository does not grant the ability to revoke credentials at their providers.

## Required owner actions

Review the affected services and, where applicable, **revoke or rotate any credentials that were previously committed**, including:

- Cloudinary API credentials.
- Google Gemini API key.
- Konnect payment API credentials (and review associated wallet/account access).
- SendGrid API key.
- MongoDB database connection credentials and database user privileges.
- JWT signing secret, with consideration for invalidating existing sessions.

Review service logs and billing for unusual activity. Update secrets in any deployment environment and your **local untracked** `.env` files after rotation.

Do not paste real keys into GitHub issues, pull requests, commit messages, README files, or chat.

## Future hygiene

- Use `backend/.env.example` and `frontend/.env.example` as templates only.
- Keep actual `.env` files untracked.
- Use provider-specific secret management for hosted deployments.
- Run a secret scan on the **entire Git history** before considering the repository remediated.
- If historical cleanup is required, coordinate it after revoking credentials. Rewriting history involves destructive operations for collaborators and does not guarantee removal from existing forks or caches.

If you find a security problem, contact the repository owner privately rather than opening a public issue containing sensitive information.
