# Frontend

React app for the CS440 Collaborative Development & Cloud Deployment assignment. Per the assignment spec, this is "a very simple React app with a button, a small number of input fields... When the button is clicked, the app sends the input values to the backend, which inserts them as a new row in the table."

## File-by-file reference

### `index.html`
The actual HTML page the browser loads. Contains an empty `<div id="root"></div>` and one `<script>` tag that loads `src/main.jsx`. Sets the page `<title>` and favicon link.

### `src/main.jsx`
The entry point. Finds `<div id="root">` from `index.html` and tells React to render `<App />` into it.

### `src/App.jsx`
The one component in this app — everything the assignment asks for lives here:
- State for the two form fields (`name`, `message`) and a `status` flag (`idle` / `submitting` / `success` / `error`).
- `handleSubmit`: runs on form submit, sends a `POST` request (via `fetch`) to the backend with the form values as JSON, and updates `status` based on the result.
- The JSX: a heading, a form with two labeled inputs and a submit button, and a success/error message shown after a submit attempt.

- **Does:** collect input, send it to a backend URL, show success/failure feedback.
- **Doesn't:**
  - Talk to the database directly — it only calls an HTTP endpoint; the backend does the actual insert.
  - Know the real backend URL yet — that comes from an environment variable we haven't set up (see below).
  - Guarantee the field names (`name`, `message`) match Anh's actual table schema — this is a **placeholder contract** (see TODO below).
  - Validate anything beyond HTML5's `required` attribute (non-empty fields). No format/length validation.

### `src/App.css`
Styles scoped to the elements in `App.jsx` (the form layout, inputs, button, success/error text colors).

### `src/index.css`
Global styles applied to the whole page: CSS variables for colors (with a dark-mode variant via `prefers-color-scheme`), and a `body`/`h1` reset.

### `vite.config.js`
Configuration for Vite, the build tool/dev server. Currently just enables the React plugin (JSX support + Fast Refresh during `npm run dev`).

### `package.json` / `package-lock.json`
`package.json` lists dependencies (`react`, `react-dom`) and dev tooling (`vite`, `@vitejs/plugin-react`, `oxlint`), plus the `dev` / `build` / `preview` / `lint` scripts. `package-lock.json` pins exact versions so `npm install` is reproducible across machines — **must be committed to git**, unlike `node_modules/`.

### `.oxlintrc.json`
Configuration for `oxlint`, the linter run by `npm run lint`. Default rules from the Vite scaffold — untouched.

### `public/favicon.svg`
The browser tab icon, referenced from `index.html`. Static asset, served as-is.

## Environment variables — not set up yet

`App.jsx` reads a backend URL from `import.meta.env.VITE_API_URL`. Right now, no `.env` file exists, so this is `undefined` and any submit attempt will fail. This is the next step we're working on:
- `.env.local` (gitignored) — real value for local dev, e.g. pointing at Anh's local backend port.
- `.env.example` (committed) — documents the variable name without a real value, so teammates know what to set.
- A Vercel environment variable of the same name, set in the project dashboard, for the deployed site.

## What's NOT done yet (per assignment spec)

- [ ] `.env.local` / `.env.example` files and a root `.gitignore`
- [ ] Confirm the request contract (`POST {API_URL}/api/messages`, `{ name, message }`) against Anh's actual table/columns once the backend exists — field names here are a guess, not final
- [ ] Local end-to-end test against a real backend (only tested against nothing / a failing fetch so far)
- [ ] Git: feature branch, commit, push, PR into `main`
- [ ] Deploy to Vercel (Root Directory = `frontend`, `VITE_API_URL` set in project settings)
- [ ] Verify a submitted row actually appears in the database via the Railway console

## What this frontend intentionally does NOT do

- No routing — it's a single page/component, no need for React Router.
- No state management library — `useState` is enough for two fields and a status flag.
- No CSS framework — plain CSS, scoped by two small stylesheets.
- No test suite — not required by the assignment ("minimal implementation effort").
- No backend/database code — that's Anh's `backend/` work, kept separate.
