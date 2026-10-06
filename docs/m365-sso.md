# Microsoft 365 sign-in for /team

Needs someone with Entra ID admin rights in Vektor's Microsoft 365 tenant. About 15 minutes.

## 1. Register the app

Entra admin center → **App registrations → New registration**

- Name: `Vektor Team (website)`
- Supported account types: **Accounts in this organizational directory only** (single tenant)
- Redirect URI (Web): `https://vektor-logistics.com/api/auth/callback/microsoft-entra-id`
  - add preview/staging URLs the same way, plus `http://localhost:3000/api/auth/callback/microsoft-entra-id` for development

## 2. Secret

**Certificates & secrets → New client secret.** Copy the value (shown once).

## 3. App roles

**App roles → Create app role** (Allowed member types: Users/Groups), one per value:

| Display name | Value |
|---|---|
| Rep | `rep` |
| Operations | `ops` |
| Carrier team | `carrier` |
| Leadership | `leadership` |
| Admin | `admin` |

Then **Enterprise applications → Vektor Team (website) → Users and groups → Add assignment** to give people (or M365 groups) a role. Turn on **Assignment required** under Properties so only assigned people can sign in. Anyone signed in without a role is treated as `rep`.

## 4. MFA / conditional access

Create or reuse a Conditional Access policy that requires MFA for this app. The site does not handle passwords or MFA itself.

## 5. Environment variables (host settings)

```
AUTH_SECRET=<openssl rand -base64 33>
AUTH_MICROSOFT_ENTRA_ID_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<secret value>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=<Directory (tenant) ID>
```

## 6. Check

Visit `/team` → redirected to `/team/sign-in` → "Continue with Microsoft" → back on the dashboard with your roles shown under your email. Sign-in, sign-out, denials and dashboard views are written as `type: "audit"` JSON lines to the server log.

## Security review before go-live

- Single-tenant app, assignment required, MFA policy applied
- `/team` responses carry `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`
- Client secret rotation date set (Entra shows expiry); prefer a certificate credential later
- Audit log shipped somewhere with retention
