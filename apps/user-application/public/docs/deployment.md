# Deployment

## Release order

Deploy the backend before the frontend:

1. Validate, test, and build the workspace.
2. Deploy Convex functions and schema to Convex Cloud.
3. Build the frontend with that deployment's public URLs.
4. Deploy the Worker to Cloudflare.
5. Smoke-test `/`, `/docs`, `/app`, and the OAuth callback.

## GitHub Actions

`.github/workflows/deploy.yml` provides a manual `workflow_dispatch` release. It uses GitHub's `production` environment and performs:

```text
install
  -> typecheck
  -> tests
  -> production build
  -> Convex Cloud deploy
  -> Cloudflare Worker deploy
```

GitHub Actions is the only production deployer. Local deploy commands fail before contacting Convex or Cloudflare. The workflow validates every required public variable and private secret, builds once, configures the Convex production environment, deploys Convex, then uploads the same verified frontend artifact to Cloudflare.

Convex uses `CONVEX_DEPLOY_KEY`, while Wrangler uses its Cloudflare API token. `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, and `CLOUDFLARE_ACCOUNT_ID` are GitHub environment variables because they are not secrets.

## Post-deployment checks

```bash
curl --fail https://your-worker.example.com/
curl --fail https://your-worker.example.com/docs
curl --head https://your-worker.example.com/app
```

The first two checks must succeed even if Convex is unavailable. `/app` may show the login screen, redirect, or report a private-backend configuration error, but it must never expose private data without a valid backend identity.
