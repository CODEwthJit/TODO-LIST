# Todo App Learning Project

A guided full-stack learning project using React, JavaScript, Vite, Node.js, Express, PostgreSQL, and REST. Stages 0-10 are implemented. Automated checks use Node's built-in test runner.

## Architecture

The browser displays the React app. React sends HTTP requests to Express. Express middleware reads JSON and the session cookie, the route selects a controller, and the controller calls a service. The service calls a repository, which runs parameterized SQL against PostgreSQL.

```text
Browser -> React UI and state
  -> HTTP request with session cookie
Express middleware -> route -> validation/authentication
  -> controller -> service -> repository
PostgreSQL -> query result
  -> repository -> service -> controller -> HTTP response
React state -> updated UI
```

Each backend layer has a focused job:

- **Route:** Maps an HTTP method and path to middleware and a controller.
- **Controller:** Reads validated request data and selects the HTTP response.
- **Service:** Coordinates application operations.
- **Repository:** Runs SQL through the PostgreSQL connection pool.
- **Database:** Persists accounts, sessions, and todos.

## Run locally

### 1. Start PostgreSQL

Use a local PostgreSQL server on port 5432. In pgAdmin's Query Tool, connect as an administrator and execute each statement separately. Replace the password with one you choose:

```sql
CREATE ROLE todo_learning_user WITH LOGIN PASSWORD 'choose_a_password';
```

```sql
CREATE DATABASE todo_learning OWNER todo_learning_user;
```

If the role or database already exists, keep using it instead of creating it again.

### 2. Configure environment variables

In PowerShell, from the project folder, copy the example only if you do not already have a `.env` file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set the database password in `DATABASE_URL`. If the password contains URL-reserved characters, URL-encode them.

Generate a session secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value on the `SESSION_SECRET` line in `.env`. Keep `.env` private; Git ignores it. Never share its contents.

### 3. Install packages and apply migrations

From the project folder:

```powershell
npm.cmd install
npm.cmd run migrate up
```

The migrations create the todos, users, and PostgreSQL session tables, then add todo ownership.

### 4. Start the app

Open two PowerShell terminals in the project folder.

In the first terminal:

```powershell
npm.cmd run server
```

In the second terminal:

```powershell
npm.cmd run dev
```

Open the Vite address printed in the second terminal, usually `http://localhost:5173`. Create an account or log in to use the Todo UI.

## API

The API listens at `http://localhost:3000`. The browser sends credentials so Express can receive the session cookie.

### Authentication endpoints

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{"email":"you@example.com","password":"at-least-8-chars"}` | `201` and user |
| `POST` | `/api/auth/login` | `{"email":"you@example.com","password":"your-password"}` | `200` and user |
| `GET` | `/api/auth/me` | None | `200` and user; `401` if logged out |
| `POST` | `/api/auth/logout` | None | `204` |

Passwords are hashed with bcrypt before storage. The browser receives a signed, HTTP-only cookie containing a session ID; PostgreSQL stores the session data. The cookie lasts one day, uses SameSite Lax, and is marked Secure in production, which requires HTTPS.

### Todo endpoints

All Todo endpoints require a valid login session.

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/api/todos` | Query parameters | `200` with the current user's paginated todos and page metadata |
| `POST` | `/api/todos` | `{"title":"Read a chapter"}` | `201` with the new todo |
| `PATCH` | `/api/todos/:id` | `{"completed":true}` | `200` with the updated todo |
| `DELETE` | `/api/todos/:id` | None | `204` |

Invalid request data returns `400`. Missing sessions return `401`. A todo that does not exist or belongs to another user returns `404`.

### Search, filters, sorting, and pages

The list endpoint accepts these optional query parameters:

| Parameter | Values | Default | Purpose |
| --- | --- | --- | --- |
| `q` | Text up to 100 characters | Empty | Case-insensitive title search |
| `status` | `all`, `active`, `completed` | `all` | Filter by completion state |
| `sortBy` | `id`, `title` | `id` | Choose the sort column |
| `order` | `asc`, `desc` | `asc` | Choose ascending or descending order |
| `page` | Positive integer up to 1,000,000 | `1` | Choose the result page |
| `pageSize` | Integer from 1 to 50 | `10` | Choose how many results to return |

Example: `GET /api/todos?q=chapter&status=active&sortBy=title&order=asc&page=1&pageSize=10` combines all filters. The response includes `items`, `total`, `page`, `pageSize`, and `totalPages`. A page beyond the last page is adjusted to the last available page.

## Data ownership

Each new todo stores its owner's ID in `todos.user_id`. List, update, and delete SQL statements include that ID, so one user cannot access another user's todos. A foreign key prevents an owner ID from referring to a nonexistent account.

Todos created before account ownership was added have no owner. The ownership migration preserves those rows, but authenticated API requests do not show them.

## Automated checks

Run the unit and frontend API-client checks from the project folder:

```powershell
npm.cmd test
```

The frontend check stubs `fetch`, so it does not need a running server. Unit checks exercise the request schemas.

The full API integration check creates temporary accounts and todos, so run it against a separate test database. Create an empty PostgreSQL database named `todo_learning_test`, then copy the example configuration and edit its database password and session secret:

```powershell
Copy-Item .env.test.example .env.test
npm.cmd run migrate:test up
npm.cmd run test:integration
```

The integration check registers two temporary users and covers login sessions, Todo create/list/update/delete, query validation, and ownership isolation. It deletes the temporary users afterward. Keep `.env.test` private; Git ignores it.

## Git and GitHub workflow

Git records snapshots of the project on your computer. GitHub hosts a remote copy and lets you review proposed changes through pull requests. `.gitignore` excludes dependencies, build output, logs, and local environment files so secrets are not added accidentally.

### Start tracking the project

Run these commands in PowerShell from the project folder. Initialize the repository once, then review the files before creating the first commit:

```powershell
git init -b main
git status
git add .
git diff --cached --stat
git commit -m "Build Todo app through stage 10"
```

`git add` stages selected changes, `git diff --cached` shows exactly what the next commit contains, and `git commit` saves that snapshot in local history. Check `git status` before and after committing.

### Send a change for review on GitHub

Create an empty GitHub repository, then replace the example remote URL with its URL:

```powershell
git remote add origin https://github.com/USERNAME/todo-app.git
git switch -c feature/short-description
# Make and review your changes
git status
git diff
git add path/to/changed-file
git diff --cached
git commit -m "Describe the change"
git push -u origin feature/short-description
```

On GitHub, open a pull request from the feature branch into `main`, review the diff, and merge after approval. Keep each branch focused on one change. Do not push `.env` or `.env.test`.

## Learning stages

- **Stages 0-3:** Architecture, React UI, Express REST API, and frontend/backend connection.
- **Stage 4:** PostgreSQL persistence and migrations.
- **Stage 5:** Route, controller, service, and repository layers.
- **Stage 6:** Request validation and predictable JSON errors.
- **Stage 7:** Registration, login, password hashing, sessions, and cookies.
- **Stage 8:** Per-user todo ownership and access control.
- **Stage 9:** Search, filtering, sorting, and pagination.
- **Stage 10:** Node's built-in test runner checks query validation, frontend request construction/errors, and the authenticated API against a separate PostgreSQL test database.
- **Stage 11:** Git ignore rules and documented local commit, branch, push, and pull request workflow.
- **Next - Stage 12:** Docker.

At each stage, the code is explained, a request is traced through the app, verification is performed, and a learning checkpoint is provided before continuing.
