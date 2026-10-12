# WorkRadar MVP

WorkRadar is a sample AI-powered work intelligence dashboard for engineering managers and team leads. It consolidates daily priorities, blockers, recent activity, search, and task actions into one React workspace.

## Features

- Dashboard with deterministic daily summary, KPI cards, top priorities, blocked teammates, and recent sample activity.
- Priority Feed with transparent rule-based ranking for urgent work, blockers, overdue items, upcoming work, snoozed items, and completed work.
- Task detail view reachable from the dashboard, feed, and search results.
- Search across task IDs, titles, descriptions, projects, assignees, source labels, status, priority, reasons, and blocker text.
- Filters for status, priority, assignee, source, and feed category.
- Working task actions: assign, mark done, snooze, and unsnooze.
- Local persistence with `localStorage`, so changes survive browser refreshes.
- Empty, loading, resolved, and retryable error states using the bundled mock dataset.

## Technology Stack

- React 19
- TypeScript 5.7
- Vite 8
- Tailwind CSS v4 via `@tailwindcss/vite`
- Figma Make Vite plugins

## Project Structure

- `src/main.tsx` mounts the React app and imports global styles.
- `src/App.tsx` contains the WorkRadar MVP screens, shared mock data, derived metrics, task actions, and persistence.
- `src/index.css` contains Tailwind import, global styles, and the Figma Make visual system.
- `vite.config.ts` configures React, Tailwind, Figma Make plugins, and the `@` alias.
- `package.json` defines build, dev, preview, and format scripts.

## Prerequisites

- Node.js matching `.mise.toml`
- pnpm if following the original scaffold, or npm as a fallback

## Installation

```bash
pnpm install
```

If `pnpm` is not available:

```bash
npm install
```

## Local Startup

Figma Make normally starts the Vite dev server automatically on `$PORT`, defaulting to `8443`.

Manual command:

```bash
pnpm run dev
```

Fallback:

```bash
npm run dev
```

## Mock Data And Persistence

The app uses 14 fictional tasks and 8 fictional teammates. The dataset includes completed work, in-progress tasks, urgent tasks, overdue work, blockers, awaiting-review work, upcoming tasks, and snoozed work.

Task state changes are stored in browser `localStorage` under `workradar-mvp-tasks-v1`. Clearing site data resets the app to the bundled sample dataset.

## AI Summary Behavior

No live LLM integration is configured. The daily summary is explicitly labelled as a deterministic rule-based fallback. It is generated from the current task dataset and only references completed work, priorities, overdue items, blockers, and next actions that exist in the sample data.

No API key or external credentials are required.

## Manual Testing

1. Open the dashboard and verify KPI counts match the visible sample task states.
2. Open a dashboard priority, blocker, or search result and confirm the detail view shows the correct task.
3. Search by title, description, project, assignee, and source.
4. Combine search with status, priority, assignee, and source filters.
5. Assign a task to a different teammate and verify the dashboard, feed, search, and detail view update.
6. Mark a task done and verify it leaves active priority sections while remaining searchable.
7. Snooze a task and verify it leaves the active feed, appears under the Snoozed category, and can be unsnoozed.
8. Use Clear Filters and retry controls to verify recovery behavior.
9. Refresh the browser and confirm task changes persist.

## Known Limitations

- Slack, Jira, GitHub, and email are represented by source labels only.
- The summary is deterministic rather than LLM-generated.
- There is no backend, authentication, multi-user sync, or live integration layer.
- Automated tests are not included in the scaffold.

## Submission Packaging

To submit as source, include the project directory with `src`, `public`, `.figma`, configuration files, lockfile, and this README. Exclude generated directories such as `node_modules` and `dist`.
