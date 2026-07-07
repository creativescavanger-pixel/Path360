This file explains how to create an offline/portable bundle of the app and how to run it on another computer.

- Create an offline zip (runs build first):
  ```bash
  sh scripts/package_offline.sh
  ```

- Transfer the generated `path360-offline-*.zip` to another computer and unzip.

- Serve the `dist/` folder with a static server (no Node required):
  ```bash
  cd dist
  python3 -m http.server 5000
  # then open http://localhost:5000
  ```

- Or run with Docker (on target machine):
  ```bash
  docker build -t path360-app .
  docker run -p 80:80 path360-app
  ```

Notes:
- The PWA plugin will register a service worker so browsers can cache assets for offline use after the first successful load.
- Any features that call external APIs (Supabase, Posthog, Stripe, AI clients) will still require network access or local mocks.

CI build (build online)
 - A GitHub Actions workflow is included at `.github/workflows/ci-build.yml`. It builds the production `dist/`, creates a full offline zip, and can optionally build a Docker image tar.
 - To run it from GitHub UI: go to Actions → "Build and Package" → Run workflow → set `include_docker` if you want the Docker tar.
 - Or trigger via `gh` CLI:
   ```bash
   gh workflow run "Build and Package" --repo <owner>/<repo> --field include_docker=true
   ```
 - After the workflow completes, download artifacts (dist, full-offline-zip, docker-tar) from the workflow run page.
