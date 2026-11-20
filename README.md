# Study Orbit Planner

Open `index.html` in a modern web browser. The planner stores all changes in browser local storage (`localStorage`).

The entry screen welcomes you with an interactive orbit and prompts for your first task, then opens the planner.
- **Home**: Task list and 2-column Kanban board, weekly 7-day strip, Pomodoro focus clock, and focus blocks.
- **Timeline**: Chronological deadline stream categorized by university and self-study tracks.
- **Calendar**: Interactive full-month view with day-by-day deadline inspections.
- **Courses**: Course-level learning map showing next upcoming deadlines and completion rates.
- **Library**: Second-brain space for notes, ideas, plans, vault items, files, lectures, and readings.

## Canvas & Calendar Integrations

### 1. Canvas & Calendar (.ics) File Import
Click **↥ Import Canvas .ics** in the Home toolbar. Select your exported `.ics` file from Canvas (or your university calendar feed) to automatically parse all assignment deadlines, time zones, and course codes.

### 2. Google Calendar
Click **G Connect Google Calendar** in the Home toolbar:
- **Option 1 (Recommended & Works on `file:///`):** In Google Calendar, go to *Settings ⚙ → Import & export → Export*. Download the zip file, extract your `.ics` calendar file, and click **Upload Google Calendar .ics**.
- **Option 2 (Live OAuth Sync):** Enter an authorized Google Cloud OAuth 2.0 Web Client ID. *Note: Google OAuth requires running through a local web server (e.g. `http://localhost:8080`), as Google's authentication servers block direct `file:///` browser origins.*

### 3. Quick Text Import
Click **Import Canvas schedule** in the sidebar and paste one item per line in this format:

```text
course | title | YYYY-MM-DD | HH:MM
```

Example:
```text
ENGR210 | HW#12 — Energy | 2026-11-28 | 23:59
Self-study | Finish Module 4 | 2026-11-30 | 20:00
```

## Keyboard Shortcuts

- <kbd>n</kbd>: Focus the Quick Task input bar.
- <kbd>/</kbd>: Focus the Task Search input bar.
- <kbd>Esc</kbd>: Close any open modal dialog.
