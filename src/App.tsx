import { useEffect, useMemo, useState, type ReactNode } from "react";

type View = "dashboard" | "feed" | "search" | "detail" | "states";
type Status = "Completed" | "In progress" | "Blocked" | "Upcoming" | "Awaiting review";
type Priority = "Urgent" | "High" | "Medium" | "Low";
type Source = "Jira" | "GitHub" | "Slack" | "Email";
type FeedCategory = "All" | "Urgent" | "Blockers" | "Overdue" | "Upcoming" | "Snoozed" | "Completed";

type Teammate = {
  name: string;
  role: string;
  color: string;
};

type Activity = {
  actor: string;
  text: string;
  time: string;
  source: Source | "WorkRadar";
};

type Task = {
  id: number;
  title: string;
  description: string;
  project: string;
  assignee: string;
  status: Status;
  priority: Priority;
  due: string;
  dueDate: string;
  source: Source;
  reason: string;
  blocker?: string;
  completedToday?: boolean;
  snoozed?: boolean;
  snoozedUntil?: string;
  activity: Activity[];
};

const STORAGE_KEY = "workradar-mvp-tasks-v1";
const todayLabel = "Friday, June 20";

const teammates: Teammate[] = [
  { name: "Ana Torres", role: "Backend engineer", color: "violet" },
  { name: "Marcus Chen", role: "Frontend engineer", color: "blue" },
  { name: "Priya Shah", role: "Security engineer", color: "pink" },
  { name: "Lena Brooks", role: "Product engineer", color: "orange" },
  { name: "Omar Haddad", role: "Platform engineer", color: "green" },
  { name: "Imani Reed", role: "SRE", color: "cyan" },
  { name: "Nia Bennett", role: "QA engineer", color: "yellow" },
  { name: "Jordan Lee", role: "Engineering manager", color: "navy" },
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finalize partner API contract",
    description: "Confirm the final request schema and error states with the Payments platform team before implementation can continue.",
    project: "Payments API",
    assignee: "Ana Torres",
    status: "Blocked",
    priority: "Urgent",
    due: "Today",
    dueDate: "Jun 20",
    source: "Jira",
    reason: "Confirmed blocker on three downstream payment tasks.",
    blocker: "Waiting on the Payments platform team to confirm two breaking schema changes.",
    activity: [
      { actor: "Ana Torres", text: "Flagged unresolved partner schema changes.", time: "Today, 8:14 AM", source: "Jira" },
      { actor: "WorkRadar", text: "Raised priority because this blocks payment implementation work.", time: "Today, 8:16 AM", source: "WorkRadar" },
    ],
  },
  {
    id: 2,
    title: "Fix checkout session timeout",
    description: "Resolve the session renewal regression affecting long-running checkout flows.",
    project: "Checkout",
    assignee: "Marcus Chen",
    status: "In progress",
    priority: "Urgent",
    due: "2 days overdue",
    dueDate: "Jun 18",
    source: "GitHub",
    reason: "Overdue and linked to eight customer reports.",
    activity: [
      { actor: "Marcus Chen", text: "Pushed a renewal retry patch for review.", time: "Today, 9:05 AM", source: "GitHub" },
      { actor: "WorkRadar", text: "Kept urgent priority because the due date is overdue.", time: "Today, 9:08 AM", source: "WorkRadar" },
    ],
  },
  {
    id: 3,
    title: "Review authentication middleware PR",
    description: "Complete security and regression review for the new authentication middleware.",
    project: "Identity",
    assignee: "Priya Shah",
    status: "Awaiting review",
    priority: "High",
    due: "Today",
    dueDate: "Jun 20",
    source: "GitHub",
    reason: "Release branch is waiting for approval.",
    activity: [
      { actor: "Priya Shah", text: "Requested additional regression evidence before approval.", time: "Today, 8:58 AM", source: "GitHub" },
    ],
  },
  {
    id: 4,
    title: "Publish release 2.7 notes",
    description: "Publish customer-facing release notes for version 2.7.",
    project: "Release 2.7",
    assignee: "Lena Brooks",
    status: "Completed",
    priority: "Medium",
    due: "Done 9:42 AM",
    dueDate: "Jun 20",
    source: "Jira",
    reason: "Completed today.",
    completedToday: true,
    activity: [{ actor: "Lena Brooks", text: "Published release notes for version 2.7.", time: "Today, 9:42 AM", source: "Jira" }],
  },
  {
    id: 5,
    title: "Validate account schema migration",
    description: "Run post-migration validation queries and archive the rollout checklist.",
    project: "Data platform",
    assignee: "Omar Haddad",
    status: "Completed",
    priority: "High",
    due: "Done 10:15 AM",
    dueDate: "Jun 20",
    source: "GitHub",
    reason: "Completed today.",
    completedToday: true,
    activity: [{ actor: "Omar Haddad", text: "Completed post-migration validation queries.", time: "Today, 10:15 AM", source: "GitHub" }],
  },
  {
    id: 6,
    title: "Configure latency alert thresholds",
    description: "Tune alert thresholds against the last 30 days of production traffic.",
    project: "Observability",
    assignee: "Imani Reed",
    status: "Completed",
    priority: "Medium",
    due: "Done 11:03 AM",
    dueDate: "Jun 20",
    source: "Jira",
    reason: "Completed today.",
    completedToday: true,
    activity: [{ actor: "Imani Reed", text: "Configured revised latency alert thresholds.", time: "Today, 11:03 AM", source: "Jira" }],
  },
  {
    id: 7,
    title: "QA invoice export redesign",
    description: "Verify the revised invoice export flow across standard and enterprise accounts.",
    project: "Billing",
    assignee: "Nia Bennett",
    status: "In progress",
    priority: "Medium",
    due: "Tomorrow",
    dueDate: "Jun 21",
    source: "Jira",
    reason: "Customer-facing change due tomorrow.",
    activity: [{ actor: "Nia Bennett", text: "Started enterprise account export validation.", time: "Today, 10:40 AM", source: "Jira" }],
  },
  {
    id: 8,
    title: "Restore staging deploy credentials",
    description: "Rotate and validate credentials used by the staging deployment workflow.",
    project: "Developer platform",
    assignee: "Omar Haddad",
    status: "Blocked",
    priority: "High",
    due: "Today",
    dueDate: "Jun 20",
    source: "Slack",
    reason: "Prevents QA from testing the release.",
    blocker: "Security approval is still pending for the replacement service account.",
    activity: [{ actor: "Omar Haddad", text: "Reported staging deploy credential blocker.", time: "Today, 9:12 AM", source: "Slack" }],
  },
  {
    id: 9,
    title: "Investigate Android login crash",
    description: "Reproduce and patch the Android 15 crash reported during token refresh.",
    project: "Mobile",
    assignee: "Ana Torres",
    status: "In progress",
    priority: "High",
    due: "1 day overdue",
    dueDate: "Jun 19",
    source: "Jira",
    reason: "Overdue with rising error volume.",
    activity: [{ actor: "Ana Torres", text: "Narrowed crash reproduction to Android 15 token refresh.", time: "Today, 9:34 AM", source: "Jira" }],
  },
  {
    id: 10,
    title: "Update webhook retry guide",
    description: "Document the revised retry policy and integration examples.",
    project: "Developer docs",
    assignee: "Imani Reed",
    status: "Upcoming",
    priority: "Low",
    due: "Jun 23",
    dueDate: "Jun 23",
    source: "Email",
    reason: "Snoozed until the next planning window.",
    snoozed: true,
    snoozedUntil: "Monday",
    activity: [{ actor: "Jordan Lee", text: "Snoozed this documentation item until Monday planning.", time: "Today, 8:30 AM", source: "Email" }],
  },
  {
    id: 11,
    title: "Prepare release 2.8 go/no-go",
    description: "Gather readiness signals and open risks for the release decision.",
    project: "Release 2.8",
    assignee: "Marcus Chen",
    status: "Upcoming",
    priority: "High",
    due: "In 3 days",
    dueDate: "Jun 23",
    source: "Jira",
    reason: "Release deadline is within 72 hours.",
    activity: [{ actor: "Marcus Chen", text: "Created the release readiness checklist.", time: "Today, 8:47 AM", source: "Jira" }],
  },
  {
    id: 12,
    title: "Instrument onboarding completion",
    description: "Add analytics events for the new onboarding checklist.",
    project: "Growth",
    assignee: "Lena Brooks",
    status: "In progress",
    priority: "Low",
    due: "Jun 26",
    dueDate: "Jun 26",
    source: "GitHub",
    reason: "Active sprint commitment.",
    activity: [{ actor: "Lena Brooks", text: "Opened implementation branch for onboarding analytics.", time: "Today, 11:20 AM", source: "GitHub" }],
  },
  {
    id: 13,
    title: "Clean up feature flag inventory",
    description: "Identify stale flags and assign owners for removal.",
    project: "Developer platform",
    assignee: "Nia Bennett",
    status: "Upcoming",
    priority: "Medium",
    due: "Jun 27",
    dueDate: "Jun 27",
    source: "Jira",
    reason: "Scheduled for this sprint.",
    activity: [{ actor: "Nia Bennett", text: "Added the flag inventory audit to sprint work.", time: "Today, 9:50 AM", source: "Jira" }],
  },
  {
    id: 14,
    title: "Triage enterprise SSO escalation",
    description: "Review identity provider logs and prepare a customer-facing mitigation update.",
    project: "Enterprise SSO",
    assignee: "Priya Shah",
    status: "In progress",
    priority: "Urgent",
    due: "Today",
    dueDate: "Jun 20",
    source: "Slack",
    reason: "Critical customer escalation with same-day response expected.",
    activity: [{ actor: "Priya Shah", text: "Collected initial SSO logs from the customer escalation thread.", time: "Today, 10:05 AM", source: "Slack" }],
  },
];

const taskRef = (id: number) => `WRK-${1041 + id}`;
const sources: Source[] = ["Jira", "GitHub", "Slack", "Email"];
const statuses: Status[] = ["Completed", "In progress", "Blocked", "Upcoming", "Awaiting review"];
const priorities: Priority[] = ["Urgent", "High", "Medium", "Low"];
const teammateNames = teammates.map((person) => person.name);

function getPerson(name: string) {
  return teammates.find((person) => person.name === name) ?? teammates[teammates.length - 1];
}

function isOverdue(task: Task) {
  return task.due.toLowerCase().includes("overdue");
}

function isActive(task: Task) {
  return task.status !== "Completed" && !task.snoozed;
}

function priorityScore(task: Task) {
  const priority = { Urgent: 400, High: 300, Medium: 200, Low: 100 }[task.priority];
  const blocked = task.status === "Blocked" ? 500 : 0;
  const overdue = isOverdue(task) ? 350 : 0;
  const review = task.status === "Awaiting review" ? 80 : 0;
  const dueToday = task.due === "Today" ? 60 : 0;
  return blocked + overdue + priority + review + dueToday;
}

function searchText(task: Task) {
  return [
    taskRef(task.id),
    task.title,
    task.description,
    task.project,
    task.assignee,
    task.source,
    task.status,
    task.priority,
    task.reason,
    task.blocker ?? "",
  ].join(" ").toLowerCase();
}

function buildSummary(tasks: Task[]) {
  const completed = tasks.filter((task) => task.completedToday && task.status === "Completed");
  const active = tasks.filter(isActive).sort((a, b) => priorityScore(b) - priorityScore(a));
  const blocked = active.filter((task) => task.status === "Blocked");
  const overdue = active.filter(isOverdue);
  const top = active.slice(0, 3);
  const completedText = completed.length
    ? `${completed.length} item${completed.length === 1 ? "" : "s"} completed today: ${completed.map((task) => task.title).join(", ")}.`
    : "No completed work is recorded for today in the sample dataset.";
  const priorityText = top.length
    ? `Current priorities are ${top.map((task) => `${task.title} (${task.assignee})`).join(", ")}.`
    : "There are no active priorities after completed and snoozed items are excluded.";
  const riskText = [blocked.length ? `${blocked.length} confirmed blocker${blocked.length === 1 ? "" : "s"}` : "", overdue.length ? `${overdue.length} overdue item${overdue.length === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ");
  const blockerText = blocked.length
    ? `Blockers: ${blocked.map((task) => `${task.assignee} is blocked on ${task.title} because ${task.blocker}`).join(" ")}`
    : "No confirmed blockers are present in the active sample work.";
  const recommendation = blocked[0]
    ? `Recommended next action: unblock ${blocked[0].assignee} on ${blocked[0].title}.`
    : overdue[0]
      ? `Recommended next action: check progress on overdue work, starting with ${overdue[0].title}.`
      : top[0]
        ? `Recommended next action: keep ${top[0].title} moving because ${top[0].reason.toLowerCase()}`
        : "Recommended next action: review completed work or clear filters.";
  return `${completedText} ${priorityText} ${riskText ? `Risk signal: ${riskText}.` : "No overdue or blocker risk is currently visible."} ${blockerText} ${recommendation}`;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    radar: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    spark: <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M10.3 3.5 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.5a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    blocked: <><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    back: <path d="m15 18-6-6 6-6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></>,
    refresh: <><path d="M20 7h-5V2"/><path d="M20 7a9 9 0 1 0 1 9"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    inbox: <><path d="M4 4h16v13H4z"/><path d="M4 13h4l2 3h4l2-3h4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={`avatar avatar-${getPerson(name).color} ${small ? "avatar-small" : ""}`}>{name.split(" ").map((part) => part[0]).join("")}</span>;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function statusTone(status: Status) {
  return ({ Completed: "success", "In progress": "info", Blocked: "danger", Upcoming: "neutral", "Awaiting review": "warning" })[status];
}

function priorityTone(priority: Priority) {
  return ({ Urgent: "danger", High: "warning", Medium: "info", Low: "neutral" })[priority];
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="select-wrap"><span>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}><option value="All">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function SearchInput({ value, onChange, large = false }: { value: string; onChange: (value: string) => void; large?: boolean }) {
  return <label className={`search-input ${large ? "search-input-large" : ""}`}><Icon name="search" size={large ? 21 : 17}/><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search tasks, people, projects..." /><kbd>Ctrl K</kbd></label>;
}

function EmptyState({ title, text, action, onAction, type = "empty" }: { title: string; text: string; action?: string; onAction?: () => void; type?: "empty" | "error" | "blockers" }) {
  return <div className={`empty-state ${type}`}><span className="empty-icon"><Icon name={type === "error" ? "alert" : type === "blockers" ? "check" : "inbox"} size={23}/></span><h3>{title}</h3><p>{text}</p>{action && <button className={type === "error" ? "primary-btn" : "secondary-btn"} onClick={onAction}>{type === "error" && <Icon name="refresh" size={15}/>} {action}</button>}</div>;
}

function Sidebar({ view, setView, priorityCount }: { view: View; setView: (view: View) => void; priorityCount: number }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => setView("dashboard")}><span className="brand-mark"><Icon name="radar" size={21}/></span><span>WorkRadar</span></button>
    <nav aria-label="Workspace">
      <p className="nav-label">Workspace</p>
      <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><Icon name="grid"/><span>Overview</span></button>
      <button className={view === "feed" || view === "detail" ? "active" : ""} onClick={() => setView("feed")}><Icon name="radar"/><span>Priority Feed</span><em>{priorityCount}</em></button>
      <button className={view === "search" ? "active" : ""} onClick={() => setView("search")}><Icon name="search"/><span>Search</span></button>
      <p className="nav-label nav-label-second">Presentation</p>
      <button className={view === "states" ? "active" : ""} onClick={() => setView("states")}><Icon name="inbox"/><span>UI States</span></button>
    </nav>
    <div className="sidebar-foot">
      <div className="workspace-card"><div className="workspace-icon">NP</div><div><strong>Northstar Product</strong><span>Engineering / 8 people</span></div><Icon name="dots"/></div>
      <p>Sample workspace / No live integrations</p>
    </div>
  </aside>;
}

function Header({ view, search, setSearch, setView }: { view: View; search: string; setSearch: (value: string) => void; setView: (view: View) => void }) {
  const title = view === "dashboard" ? "Team Overview" : view === "feed" ? "Priority Feed" : view === "search" ? "Search" : view === "states" ? "Empty & error states" : "Work item";
  return <header className="topbar">
    <div><span className="eyebrow">Northstar Product / Engineering</span><h1>{title}</h1></div>
    <div className="topbar-actions">
      <label className="global-search" onClick={() => setView("search")}><Icon name="search" size={16}/><input aria-label="Search workspace" value={search} onChange={(event) => { setSearch(event.target.value); setView("search"); }} placeholder="Search workspace"/><kbd>Ctrl K</kbd></label>
      <button className="icon-btn" aria-label="Notifications"><Icon name="bell"/><i /></button>
      <div className="profile"><Avatar name="Jordan Lee"/><div><strong>Jordan Lee</strong><span>Engineering Manager</span></div></div>
    </div>
  </header>;
}

function TaskRow({ task, onOpen, onAssign, onDone, onSnooze, onUnsnooze, showActions = true }: { task: Task; onOpen: () => void; onAssign?: (assignee: string) => void; onDone?: () => void; onSnooze?: () => void; onUnsnooze?: () => void; showActions?: boolean }) {
  return <div className="task-row">
    <button className="task-main" onClick={onOpen}>
      <span className={`priority-line priority-${task.priority.toLowerCase()}`} />
      <span className="task-title"><strong>{task.title}</strong><small>{taskRef(task.id)} / {task.project} / {task.reason}</small></span>
      <span><Badge tone={priorityTone(task.priority)}>{task.priority}</Badge></span>
      <span><Badge tone={task.snoozed ? "warning" : statusTone(task.status)}>{task.snoozed ? "Snoozed" : task.status}</Badge></span>
      <span className="owner"><Avatar name={task.assignee} small/>{task.assignee}</span>
      <span className={`due ${isOverdue(task) ? "overdue" : ""}`}>{task.snoozed ? `Snoozed to ${task.snoozedUntil}` : task.due}</span>
      <span className="source">{task.source}</span>
      <Icon name="arrow" size={16}/>
    </button>
    {showActions && <div className="row-actions">
      {onAssign && <select aria-label={`Assign ${task.title}`} value={task.assignee} onChange={(event) => onAssign(event.target.value)}>{teammateNames.map((name) => <option key={name}>{name}</option>)}</select>}
      {onDone && task.status !== "Completed" && <button onClick={onDone}>Mark done</button>}
      {onSnooze && !task.snoozed && task.status !== "Completed" && <button onClick={onSnooze}>Snooze</button>}
      {onUnsnooze && task.snoozed && <button onClick={onUnsnooze}>Unsnooze</button>}
    </div>}
  </div>;
}

function Dashboard({ tasks, openTask, setView }: { tasks: Task[]; openTask: (task: Task) => void; setView: (view: View) => void }) {
  const active = tasks.filter(isActive);
  const completed = tasks.filter((task) => task.completedToday && task.status === "Completed").length;
  const progress = tasks.filter((task) => task.status === "In progress" && !task.snoozed).length;
  const blocked = active.filter((task) => task.status === "Blocked");
  const attention = active.filter((task) => isOverdue(task) || task.priority === "Urgent" || task.status === "Blocked").length;
  const priority = [...active].sort((a, b) => priorityScore(b) - priorityScore(a)).slice(0, 3);
  const activity = tasks.flatMap((task) => task.activity.map((item) => ({ ...item, task }))).slice(0, 5);
  const summary = buildSummary(tasks);

  return <div className="page dashboard">
    <div className="page-intro"><div><p>{todayLabel}</p><h2>Good morning, Jordan.</h2><span>Sample workspace. Know what matters and unblock what is next.</span></div><button className="secondary-btn" onClick={() => setView("feed")}><Icon name="external" size={16}/> Open feed</button></div>
    <section className="summary-card">
      <div className="summary-head"><div className="ai-mark"><Icon name="spark"/></div><div><h3>Daily Summary</h3><p><Icon name="clock" size={14}/> Deterministic fallback generated from current sample tasks</p></div><Badge tone="indigo">Rule-based summary</Badge></div>
      <div className="summary-copy"><p>{summary}</p></div>
      <div className="summary-actions"><strong>Recommended next steps</strong>{priority.slice(0, 2).map((task) => <button key={task.id} onClick={() => openTask(task)}>{task.title} <Icon name="arrow" size={14}/></button>)}</div>
    </section>
    <div className="kpi-grid">
      <div className="kpi"><span className="kpi-icon success"><Icon name="check"/></span><div><p>Completed Today</p><strong>{completed}</strong><small>Derived from sample tasks</small></div></div>
      <div className="kpi"><span className="kpi-icon info"><Icon name="clock"/></span><div><p>In Progress</p><strong>{progress}</strong><small>Active and not snoozed</small></div></div>
      <div className="kpi"><span className="kpi-icon warning"><Icon name="alert"/></span><div><p>Needs Attention</p><strong>{attention}</strong><small>{active.filter(isOverdue).length} overdue / {active.filter((task) => task.priority === "Urgent").length} urgent</small></div></div>
      <div className="kpi"><span className="kpi-icon danger"><Icon name="blocked"/></span><div><p>Blocked</p><strong>{blocked.length}</strong><small>Confirmed blockers</small></div></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel priorities-panel">
        <div className="section-head"><div><h3>Top priorities</h3><p>Ranked by blockers, overdue work, priority, and due date</p></div><button onClick={() => setView("feed")}>View feed <Icon name="arrow" size={15}/></button></div>
        <div className="priority-cards">{priority.length ? priority.map((task, index) => <button key={task.id} onClick={() => openTask(task)} className="priority-card"><span className="rank">0{index + 1}</span><div><strong>{task.title}</strong><p>{task.reason}</p><span className="meta"><Badge tone={priorityTone(task.priority)}>{task.priority}</Badge><Avatar name={task.assignee} small/>{task.assignee}<span>{task.due}</span></span></div><Icon name="arrow" size={17}/></button>) : <EmptyState title="No pending priorities." text="Completed and snoozed items are excluded from the active dashboard." action="Open search" onAction={() => setView("search")}/>}</div>
      </section>
      <section className="panel blockers-panel">
        <div className="section-head"><div><h3>Blocked teammates</h3><p>{blocked.length} people need help</p></div><Badge tone="danger">{blocked.length} blockers</Badge></div>
        {blocked.length ? blocked.map((task) => <button key={task.id} className="blocker-row" onClick={() => openTask(task)}><Avatar name={task.assignee}/><div><strong>{task.assignee}</strong><span>{task.title}</span><p>{task.blocker}</p></div><Icon name="arrow" size={16}/></button>) : <EmptyState type="blockers" title="No blockers identified." text="No confirmed blockers were found in active sample tasks."/>}
      </section>
      <section className="panel activity-panel">
        <div className="section-head"><div><h3>Recent activity</h3><p>Sample team updates</p></div><button aria-label="More activity options"><Icon name="dots"/></button></div>
        <div className="timeline">{activity.map((event, index) => <div key={`${event.task.id}-${index}`}><span className={`event-icon ${event.task.status === "Completed" ? "done" : event.task.status === "Blocked" ? "blocked" : "comment"}`}><Icon name={event.task.status === "Completed" ? "check" : event.task.status === "Blocked" ? "blocked" : "users"} size={14}/></span><p><strong>{event.actor}</strong> {event.text}<small>{event.time} / {event.source}</small></p></div>)}</div>
      </section>
    </div>
  </div>;
}

function PriorityFeed({ tasks, openTask, updateTask }: { tasks: Task[]; openTask: (task: Task) => void; updateTask: (id: number, patch: Partial<Task>, activityText: string) => void }) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [owner, setOwner] = useState("All");
  const [source, setSource] = useState("All");
  const [category, setCategory] = useState<FeedCategory>("All");

  const filtered = tasks
    .filter((task) => !query || searchText(task).includes(query.toLowerCase()))
    .filter((task) => priority === "All" || task.priority === priority)
    .filter((task) => status === "All" || task.status === status)
    .filter((task) => owner === "All" || task.assignee === owner)
    .filter((task) => source === "All" || task.source === source)
    .filter((task) => {
      if (category === "Snoozed") return !!task.snoozed;
      if (category === "Completed") return task.status === "Completed";
      if (category === "Urgent") return isActive(task) && task.priority === "Urgent";
      if (category === "Blockers") return isActive(task) && task.status === "Blocked";
      if (category === "Overdue") return isActive(task) && isOverdue(task);
      if (category === "Upcoming") return isActive(task) && !isOverdue(task) && task.status !== "Blocked";
      return isActive(task);
    })
    .sort((a, b) => priorityScore(b) - priorityScore(a));

  const groups = [
    { title: "Urgent work", note: "Critical risks and same-day escalations", tasks: filtered.filter((task) => task.priority === "Urgent" && isActive(task)) },
    { title: "Blockers", note: "Waiting on a person or dependency", tasks: filtered.filter((task) => task.status === "Blocked" && task.priority !== "Urgent" && isActive(task)) },
    { title: "Overdue", note: "Past the expected completion date", tasks: filtered.filter((task) => isOverdue(task) && task.priority !== "Urgent" && task.status !== "Blocked" && isActive(task)) },
    { title: category === "Snoozed" ? "Snoozed" : category === "Completed" ? "Completed" : "Upcoming and review work", note: "Visible after higher-risk work", tasks: filtered.filter((task) => category === "Snoozed" ? task.snoozed : category === "Completed" ? task.status === "Completed" : isActive(task) && task.priority !== "Urgent" && task.status !== "Blocked" && !isOverdue(task)) },
  ];
  const clear = () => { setQuery(""); setPriority("All"); setStatus("All"); setOwner("All"); setSource("All"); setCategory("All"); };

  return <div className="page">
    <div className="page-intro feed-intro"><div><p>{todayLabel}</p><h2>What needs attention next</h2><span>Deterministically ranked from sample due dates, dependencies, priority, and status.</span></div><Badge tone="indigo"><Icon name="spark" size={14}/> Rule-based ranking</Badge></div>
    <div className="filter-card"><SearchInput value={query} onChange={setQuery}/><div className="filters"><SelectField label="Category" value={category} onChange={(value) => setCategory(value as FeedCategory)} options={["Urgent", "Blockers", "Overdue", "Upcoming", "Snoozed", "Completed"]}/><SelectField label="Priority" value={priority} onChange={setPriority} options={priorities}/><SelectField label="Status" value={status} onChange={setStatus} options={statuses}/><SelectField label="Assignee" value={owner} onChange={setOwner} options={teammateNames}/><SelectField label="Source" value={source} onChange={setSource} options={sources}/></div></div>
    <div className="feed-labels"><span>Work item</span><span>Priority</span><span>Status</span><span>Owner</span><span>Due date</span><span>Source</span></div>
    {filtered.length === 0 ? <EmptyState title="No pending priorities match." text="Completed and snoozed work is preserved. Change filters to find it again." action="Clear filters" onAction={clear}/> : groups.map((group) => group.tasks.length > 0 && <section className="feed-group" key={group.title}><div className="group-head"><h3>{group.title} <span>{group.tasks.length}</span></h3><p>{group.note}</p></div><div className="task-list">{group.tasks.map((task) => <TaskRow key={task.id} task={task} onOpen={() => openTask(task)} onAssign={(assignee) => updateTask(task.id, { assignee }, `Assigned to ${assignee}.`)} onDone={() => updateTask(task.id, { status: "Completed", completedToday: true, due: "Done just now", blocker: undefined, snoozed: false, snoozedUntil: undefined }, "Marked completed.")} onSnooze={() => updateTask(task.id, { snoozed: true, snoozedUntil: "Monday" }, "Snoozed until Monday.")} onUnsnooze={() => updateTask(task.id, { snoozed: false, snoozedUntil: undefined }, "Restored to active feed.")}/>)}</div></section>)}
  </div>;
}

function ItemDetail({ task, updateTask, goBack, backLabel }: { task: Task; updateTask: (id: number, patch: Partial<Task>, activityText: string) => void; goBack: () => void; backLabel: string }) {
  const [message, setMessage] = useState("");
  const act = (patch: Partial<Task>, text: string) => { updateTask(task.id, patch, text); setMessage(text); window.setTimeout(() => setMessage(""), 2200); };
  return <div className="page detail-page">
    {message && <div className="toast"><Icon name="check" size={17}/>{message}</div>}
    <button className="back-link" onClick={goBack}><Icon name="back" size={16}/> Back to {backLabel}</button>
    <div className="detail-header">
      <div><div className="detail-badges"><span className="task-reference">{taskRef(task.id)}</span><Badge tone={priorityTone(task.priority)}>{task.priority} priority</Badge><Badge tone={task.snoozed ? "warning" : statusTone(task.status)}>{task.snoozed ? "Snoozed" : task.status}</Badge><span>{task.project}</span></div><h2>{task.title}</h2><p>{task.description}</p></div>
      <div className="detail-actions"><label className="assign-control"><span>Assign</span><select value={task.assignee} onChange={(event) => act({ assignee: event.target.value }, `Assigned to ${event.target.value}.`)}>{teammateNames.map((name) => <option key={name}>{name}</option>)}</select></label>{task.snoozed ? <button className="secondary-btn" onClick={() => act({ snoozed: false, snoozedUntil: undefined }, "Restored to active feed.")}><Icon name="refresh" size={16}/> Unsnooze</button> : task.status !== "Completed" && <button className="secondary-btn" onClick={() => act({ snoozed: true, snoozedUntil: "Monday" }, "Snoozed until Monday.")}><Icon name="clock" size={16}/> Snooze</button>}{task.status !== "Completed" && <button className="primary-btn" onClick={() => act({ status: "Completed", completedToday: true, due: "Done just now", blocker: undefined, snoozed: false, snoozedUntil: undefined }, "Task marked as completed.")}><Icon name="check" size={17}/> Mark done</button>}</div>
    </div>
    <div className="detail-grid">
      <div>
        {task.blocker && <section className="blocker-callout"><span><Icon name="blocked"/></span><div><Badge tone="danger">Confirmed blocker</Badge><h3>What is holding this up</h3><p>{task.blocker}</p><small>Reported in sample activity. No live {task.source} integration is connected.</small></div></section>}
        <section className="panel detail-section"><h3>Description</h3><p>{task.description}</p><div className="description-note"><Icon name="spark" size={17}/><p><strong>Why this is prioritized</strong><span>{task.reason} Ranking is rule-based using only sample status, due date, priority, and dependency data.</span></p></div></section>
        <section className="panel detail-section"><div className="section-head"><div><h3>Activity</h3><p>{task.activity.length} sample updates</p></div></div><div className="detail-timeline">{task.activity.map((item, index) => <div key={index}>{item.actor === "WorkRadar" ? <span className="system-avatar"><Icon name="radar" size={15}/></span> : <Avatar name={item.actor} small/>}<p><strong>{item.actor}</strong> {item.text}<span>{item.time} / {item.source}</span></p></div>)}</div></section>
      </div>
      <aside className="panel properties"><h3>Properties</h3><dl><div><dt>Task ID</dt><dd>{taskRef(task.id)}</dd></div><div><dt>Assignee</dt><dd><Avatar name={task.assignee} small/>{task.assignee}</dd></div><div><dt>Status</dt><dd><Badge tone={statusTone(task.status)}>{task.status}</Badge></dd></div><div><dt>Priority</dt><dd><Badge tone={priorityTone(task.priority)}>{task.priority}</Badge></dd></div><div><dt>Due date</dt><dd>{task.dueDate}</dd></div><div><dt>Snoozed</dt><dd>{task.snoozed ? `Yes, until ${task.snoozedUntil}` : "No"}</dd></div><div><dt>Project</dt><dd>{task.project}</dd></div><div><dt>Source</dt><dd><span className="source-box">{task.source[0]}</span>{task.source}<Icon name="external" size={14}/></dd></div></dl><div className="source-disclaimer"><Icon name="alert" size={16}/><p>Sample record only. No live {task.source} connection or LLM API key is required.</p></div></aside>
    </div>
  </div>;
}

function SearchPage({ tasks, openTask, initialQuery }: { tasks: Task[]; openTask: (task: Task) => void; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [owner, setOwner] = useState("All");
  const [source, setSource] = useState("All");
  const results = tasks
    .filter((task) => !query || searchText(task).includes(query.toLowerCase()))
    .filter((task) => status === "All" || task.status === status)
    .filter((task) => priority === "All" || task.priority === priority)
    .filter((task) => owner === "All" || task.assignee === owner)
    .filter((task) => source === "All" || task.source === source)
    .sort((a, b) => priorityScore(b) - priorityScore(a));
  const clear = () => { setQuery(""); setStatus("All"); setPriority("All"); setOwner("All"); setSource("All"); };
  return <div className="page search-page">
    <div className="search-hero"><p>Workspace search</p><h2>Find the work that matters</h2><span>Search sample titles, descriptions, projects, assignees, status, source labels, and blocker text.</span><SearchInput value={query} onChange={setQuery} large/></div>
    <div className="search-layout">
      <aside className="search-filters"><div><Icon name="sliders" size={17}/><h3>Filters</h3>{(query || status !== "All" || priority !== "All" || owner !== "All" || source !== "All") && <button onClick={clear}>Clear</button>}</div><SelectField label="Status" value={status} onChange={setStatus} options={statuses}/><SelectField label="Priority" value={priority} onChange={setPriority} options={priorities}/><SelectField label="Assignee" value={owner} onChange={setOwner} options={teammateNames}/><SelectField label="Source" value={source} onChange={setSource} options={sources}/></aside>
      <main className="search-results"><div className="result-head"><div><h3>{query ? `Results for "${query}"` : "All sample work"}</h3><p>{results.length} {results.length === 1 ? "result" : "results"} found</p></div><select aria-label="Sort search results"><option>Sort: Risk first</option><option>Sort: Due date</option><option>Sort: Priority</option></select></div>{results.length ? <div className="search-list">{results.map((task) => <TaskRow key={task.id} task={task} onOpen={() => openTask(task)} showActions={false}/>)}</div> : <EmptyState title="No matching work found." text="Try another search term or remove one of your filters." action="Clear filters" onAction={clear}/>}</main>
    </div>
  </div>;
}

function StatesPage() {
  const [retrying, setRetrying] = useState(false);
  return <div className="page states-page">
    <div className="page-intro"><div><p>Component library</p><h2>System states</h2><span>Reusable feedback patterns for the WorkRadar MVP.</span></div></div>
    <div className="states-grid">
      <section className="state-card"><header><Badge tone="success">Empty state</Badge><span>Priority Feed</span></header><EmptyState title="You are all caught up." text="There are no pending priorities for your team right now." action="View completed work"/></section>
      <section className="state-card"><header><Badge tone="neutral">No results</Badge><span>Search</span></header><EmptyState title="No matching work found." text="Try another search term or remove one of your filters." action="Clear filters"/></section>
      <section className="state-card"><header><Badge tone="info">Resolved state</Badge><span>Dashboard</span></header><EmptyState type="blockers" title="No blockers identified." text="No confirmed blockers were found in the sample team activity."/></section>
      <section className="state-card"><header><Badge tone="danger">Error state</Badge><span>Global</span></header>{retrying ? <div className="loading-mini"><span/><span/><span/><p>Retrying sample activity...</p></div> : <EmptyState type="error" title="We could not load the team activity" text="This demo retries against the bundled mock dataset, so valid sample data can recover immediately." action="Retry" onAction={() => { setRetrying(true); window.setTimeout(() => setRetrying(false), 1200); }}/>}</section>
      <section className="state-card skeleton-state"><header><Badge tone="neutral">Loading state</Badge><span>Dashboard</span></header><div className="skeleton"><div className="sk-head"><i/><p><b/><span/></p></div><strong/><strong/><div className="sk-grid"><i/><i/><i/></div></div></section>
    </div>
  </div>;
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) as Partial<Task>[] : null;
      return parsed?.every((task) => task.id && task.assignee && Array.isArray(task.activity)) ? parsed as Task[] : initialTasks;
    } catch {
      return initialTasks;
    }
  });
  const [selectedId, setSelectedId] = useState(initialTasks[0].id);
  const [previousView, setPreviousView] = useState<View>("feed");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedId) ?? tasks[0], [tasks, selectedId]);
  const activeCount = tasks.filter(isActive).length;
  const updateTask = (id: number, patch: Partial<Task>, activityText: string) => {
    setTasks((current) => current.map((task) => {
      if (task.id !== id) return task;
      return {
        ...task,
        ...patch,
        activity: [{ actor: "Jordan Lee", text: activityText, time: "Just now", source: "WorkRadar" }, ...task.activity],
      };
    }));
  };
  const openTask = (task: Task) => {
    setSelectedId(task.id);
    setPreviousView(view === "detail" ? previousView : view);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const backLabel = previousView === "dashboard" ? "overview" : previousView === "search" ? "search results" : "priority feed";

  return <div className="app-shell">
    <Sidebar view={view} setView={setView} priorityCount={activeCount}/>
    <div className="main-shell">
      <Header view={view} search={globalSearch} setSearch={setGlobalSearch} setView={setView}/>
      {view === "dashboard" && <Dashboard tasks={tasks} openTask={openTask} setView={setView}/>}
      {view === "feed" && <PriorityFeed tasks={tasks} openTask={openTask} updateTask={updateTask}/>}
      {view === "detail" && <ItemDetail task={selectedTask} updateTask={updateTask} goBack={() => setView(previousView)} backLabel={backLabel}/>}
      {view === "search" && <SearchPage tasks={tasks} openTask={openTask} initialQuery={globalSearch}/>}
      {view === "states" && <StatesPage/>}
    </div>
  </div>;
}
