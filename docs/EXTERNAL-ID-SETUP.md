# External ID production setup

The hosted portal supports two explicit modes:

- `synthetic` (default): local MSW responses and synthetic login.
- `external-id`: MSAL redirect login, OAuth access token, and the real Agent API.

## Required registrations

Create a Microsoft Entra External ID tenant for customer identities. In that
tenant create:

1. An API app registration for the Agent API.
2. An exposed delegated scope named `agent.run`.
3. A single-page application registration for the portal.
4. A redirect URI matching the Static Web Apps origin, for example
   `https://agreeable-smoke-0be6b411e.4.azurestaticapps.net`.

The API must emit a verified `customer_id` claim matching `CUST-####`. The
backend never trusts the request body customer ID in cloud environments.

## GitHub environment variables

Set these non-secret values in the frontend repository's `staging` environment:

```text
VITE_API_BASE_URL=https://aegisbank-staging-agent.mangostone-a76fbcd7.westus2.azurecontainerapps.io
VITE_ENTRA_CLIENT_ID=<spa-application-id>
VITE_ENTRA_AUTHORITY=https://<external-tenant-subdomain>.ciamlogin.com/<external-tenant-id>
VITE_AEGISBANK_API_SCOPE=api://<api-application-id>/agent.run
```

The API audience supplied to the backend deployment must be the API application
ID or identifier URI that matches the access token `aud` claim. Keep the
External ID tenant ID and API audience aligned.

## Deployment

Run the `Deploy frontend to Azure Static Web Apps` workflow manually with
`mode=external-id`. The workflow fails before build if any required variable is
missing. Automatic pushes to `master` remain in `synthetic` mode.

## Acceptance

After deployment, sign in through External ID and verify:

1. The browser sends `Authorization: Bearer ...` to `/api/v1/agent/run`.
2. A query such as `cuantos prestamos tengo` reaches the Agent API.
3. The response is produced by the AgentOrchestrator, not MSW.
4. Missing, expired, wrong-audience, and cross-customer tokens are rejected.

Do not set `VITE_USE_MOCK_API=false` until the tenant, registrations, claims,
redirect URI, and GitHub variables are all verified.
