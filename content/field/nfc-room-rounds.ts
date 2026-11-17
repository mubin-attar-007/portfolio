import type { FieldReport } from "./types";
import { AGENT_DIRECTION, WALKTHROUGH } from "./shared";

/**
 * NFC room rounds — FINAL-SPEC §8.2, the "published by default" material only.
 * Held back until the owner approves: every figure (the sync-guard threshold
 * among them), month and provider; the limits; every security incident.
 * "Built by others" stays generic.
 */
export const nfcRoomRounds: FieldReport = {
  slug: "nfc-room-rounds",
  published: false,
  name: "NFC room rounds",
  headline: "Room rounds recorded with a tap at the door",
  domain: "Long-term care operations",
  summary:
    "A phone app, web portal and API that let long-term-care staff record room rounds with a physical NFC tap, while nurses and administrators plan coverage, follow each shift's status as it happens, handle missed or excused rounds and export reports.",
  pills: [{ status: "in-use", label: "In use on care floors" }],
  credit: "One of two engineers on the system. I ran the iOS and Android store releases.",
  problem: {
    body: [
      "Facilities run scheduled room rounds across shifts, floors and staff. During a shift, supervisors need to see which rooms are covered, due, completed or missed. Afterwards, managers need a timestamped, shift-dated record to follow up on missed coverage.",
      "A tap records that someone was at the door. It is not evidence of care quality, or of how long they stayed, and this report says so.",
    ],
    users: [
      "Care staff on personal or shared floor phones",
      "Nurses and shift supervisors",
      "Administrators and directors of nursing",
    ],
  },
  constraints: [
    {
      constraint: "A check-in must mean someone was at the door",
      forced: "A physical NFC tap is required; links cannot complete a check-in.",
      checked: "The server checks the tag, the round state and the due window.",
    },
    {
      constraint: "Older builds stay installed while new ones are in store review",
      forced: "New API fields are opt-in and legacy fields are kept.",
      checked: "An app-version header records which builds are in use.",
    },
    {
      constraint: "Feeds from facility systems can be empty or partial",
      forced: "Guards run before any write, and validation failures alert admins.",
      checked: "The sync refuses empty feeds and runs that would discharge too many residents at once.",
    },
    {
      constraint: "History must survive edits",
      forced: "Completed and missed history is never deleted; check-in snapshots are never rewritten.",
      checked: "Integration suites.",
    },
    {
      constraint: "Phones are shared",
      forced: "Floor-phone accounts; a skip made on a floor phone needs the staff member's own name.",
      checked: "The floor-account integration suite.",
    },
    {
      constraint: "Shifts cross midnight",
      forced: "Per-facility time zones, with each shift dated by its start.",
      checked: "Facility-time utilities with tests.",
    },
  ],
  constraintsNote: "Runs in the cloud; there is no offline mode. No compliance certification is claimed.",
  built: [
    {
      title: "Mobile",
      items: [
        "Connected the app to the real API",
        "Ran the iOS and Android store releases",
        "Required a physical tap, removing link check-ins",
        "Disabled cleartext HTTP",
        "Device and app-version reporting, push alerts, a skip-round flow with a reason and note, and floor-phone support",
        "Fixed the iOS NFC session handling",
      ],
    },
    {
      title: "API",
      items: [
        "Push alerts with delivery receipts, reminders and targeted escalation",
        "Shared floor-phone accounts and staff app-activity reporting",
        "Per-minute room occupancy records",
        "An Excused state and round pauses with admin review, plus limits on staff skips",
        "The guard against mass discharges in the resident sync",
        "Resident names returned only as “Last, F.”",
        "A dry-run mode for the portal's NFC demo",
      ],
    },
    {
      title: "Portal",
      items: [
        "Server-side reports with Excel and PDF exports",
        "A staff app-activity report",
        "Skip review on the shift status board",
        "Screen-size scaling",
      ],
    },
    { title: "Docs", items: ["A generator for the staff user manual"] },
  ],
  others: [
    "A colleague built multi-tenant organisations and facility isolation, the cloud infrastructure, the support workspace, staff role management, the original backend and most portal screens, and the end-to-end portal tests.",
    "An earlier developer started the mobile app as a UI scaffold.",
  ],
  howBuilt: AGENT_DIRECTION,
  sketch: {
    title: "Rounds, end to end",
    zones: [
      { label: "Room door", nodes: ["NFC tag"] },
      { label: "Phone · iOS and Android", nodes: ["Rounds list", "Scan", "Skip with a reason", "Push alerts"] },
      {
        label: "Cloud",
        nodes: [
          "API · rounds, check-ins, alerts, reports",
          "Scheduler · every minute",
          "Managed PostgreSQL",
          "Static portal · nurses and administrators",
        ],
      },
      { label: "Facility systems", nodes: ["Resident feed", "Roster"] },
    ],
    crossings: [
      { label: "Physical tap", direction: "forward" },
      { label: "HTTPS · tag, round state and due window checked on the server", direction: "forward" },
      { label: "Guarded sync · empty feeds and mass discharges change nothing", direction: "back" },
    ],
    notes: ["Lock-screen alerts show room numbers only."],
  },
  moreSketches: [],
  trace: [
    {
      title: "The phone reads the tag",
      body: "A physical tap at the door. Links and URL-programmed tags cannot complete a check-in.",
      focus: { zone: 0, node: 0, crossing: 0 },
    },
    {
      title: "The API finds the open round",
      body: "It looks up the staff member's open round for that room.",
      focus: { zone: 2, node: 0, crossing: 1 },
    },
    {
      title: "The server checks, then completes the round",
      body: "Tag, round state and due window are checked on the server before anything is written.",
      focus: { zone: 2, node: 0 },
    },
    {
      title: "A check-in snapshot is written once",
      body: "The log entry snapshots room, resident and staff. Later edits never rewrite it.",
      focus: { zone: 2, node: 2 },
    },
    {
      title: "The scheduler raises missed-round alerts",
      body: "Every minute it checks what is due, and escalates only to nurses and admins.",
      focus: { zone: 2, node: 1 },
    },
  ],
  boundary: [
    { data: "Resident names", direction: "leaves", path: "API → app", rule: "Only as “Last, F.”" },
    { data: "Lock-screen alerts", direction: "leaves", path: "Push service → phone", rule: "Room numbers only." },
    { data: "Check-ins", direction: "enters", path: "Phone → API", rule: "Validated on the server." },
    {
      data: "Resident and roster data",
      direction: "enters",
      path: "Facility systems → API",
      rule: "Guarded: empty feeds and mass discharges change nothing.",
    },
  ],
  deployment: [
    {
      title: "Runs on",
      body: "Installed builds on compatible phones. The portal sits behind a CDN; API containers behind a load balancer; managed PostgreSQL in private subnets; a managed sign-in service. Migrations run as a one-off task before the service starts.",
    },
    { title: "Ships via", body: "Cloud builds for both app stores, with build numbers tracked." },
    { title: "Older versions", body: "Opt-in API fields keep older builds working while a new one is in review." },
  ],
  incidents: [
    {
      id: "ios-reader",
      title: "The iOS reader restarted under its own scan sheet",
      broke: "Scans failed on iPhone with a duplicate-session error.",
      cause:
        "iOS marks the app inactive while the system NFC sheet is open. The scan code treated that as leaving the app, tore the session down, and restarted it before the old one had cleared.",
      change:
        "Scanning stops only when the app goes to the background, with a short retry while the old session closes and a plain timeout message.",
      guard: "Session-lifecycle unit tests; the team adopted that build.",
    },
    {
      id: "link-check-ins",
      title: "Links could complete a check-in",
      broke: "URL-programmed tags, or any opened link, could deep-link into the scan screen and complete a round.",
      cause: "A deep-link handler and a URL fallback were left over from the browser-based prototype.",
      change:
        "Removed both, so a physical tap is required. Cleartext HTTP was disabled, with tag hosts kept so existing tags still open the app.",
      guard: "Server-side checks.",
    },
    {
      id: "missed-history",
      title: "Missed rounds disappeared from history",
      broke: "Missed rounds were deleted when a room went vacant or a schedule changed.",
      cause: "Regeneration replaced every round, not just future ones.",
      change:
        "Only rounds that have not happened yet are replaced; schedules that own history are archived, not deleted; resident details were removed from exports.",
      guard: "Integration suites.",
    },
    {
      id: "store-builds",
      title: "Store builds broke after a patch update",
      broke: "Cloud store builds failed even though the project's health check passed.",
      cause:
        "The refresh resolved an animation library that needed a newer companion package than the SDK allowed, so the strict install rejected the lockfile.",
      change: "Pinned the exact versions the previous release used. No broken build reached the stores.",
      guard: "Exact pins for that pair.",
    },
    {
      id: "absent-residents",
      title: "Absent residents counted as missed rounds",
      broke: "Rounds for residents who had moved, been discharged or were away counted as missed.",
      cause: "The model had no state for “not due because nobody is there”.",
      change:
        "An Excused state and round pauses (who, when, why, until when; nothing deleted); compliance computed as completed ÷ (completed + missed); staff skips limited to their own shift, with admin review; the resident sync excuses rooms residents left and refuses runs that would discharge too many at once.",
      guard: "Integration suites; older builds never see the new states.",
    },
  ],
  decisions: [
    {
      choice: "A physical tap over links",
      instead: "URL check-ins",
      reason: "A check-in must mean presence at the door.",
      tradeoff: "Needs installed native builds and compatible phones.",
    },
    {
      choice: "Opt-in API fields",
      instead: "Changing responses",
      reason: "Older builds stay in the field during store review.",
      tradeoff: "Legacy fields kept longer.",
    },
    {
      choice: "Never delete history; excuse instead",
      instead: "Deleting or rewriting rounds",
      reason: "Managers follow up from the record.",
      tradeoff: "More states to reason about.",
    },
    {
      choice: "Names as “Last, F.” and room-only lock screens",
      instead: "Full names",
      reason: "Phones are shared and lock screens are public.",
      tradeoff: "Staff open the app to see who.",
    },
  ],
  verification: {
    checks: [
      "Unit tests in all three apps",
      "The three PostgreSQL integration suites I wrote, opt-in and run only against a disposable database whose name is checked",
      "The SDK health check",
      "App-store review",
    ],
    notMeasured: ["Facility, floor or staff counts", "Rounds per day", "Compliance rates"],
  },
  outcome: {
    proves: [
      "iOS and Android releases shipped through both stores' review in 2026.",
      "The store build source consolidated into one repository with the API and portal.",
    ],
    notShown: ["Usage", "Facilities", "Changes in missed rounds"],
  },
  walkthrough: WALKTHROUGH,
};
