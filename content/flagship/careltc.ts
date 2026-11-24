import { AWS, USAGE } from "./shared";
import type { Flagship, Screenshot } from "./types";

/**
 * CareLTC — Sevina Technologies' room-rounding platform for long-term care:
 * an iOS and Android app, an admin portal and an API with a scheduler.
 * Sources: the discovery dossier (§1–§8), the facts verified at the captured
 * commit, and the capture manifest. The credit is the owner's sentence, word
 * for word (`credit.role`), and nothing on the page attributes work by git
 * history or names anyone else. No security incident is told.
 *
 * Claims discipline: a tap is not proof of presence or of care (“in the
 * mobile app” wherever check-ins are described); no certification is claimed.
 */

const DIR = "/showcase/careltc";

const PORTAL = {
  liveStatus: {
    src: `${DIR}/portal-live-status.webp`,
    width: 1600,
    height: 1000,
    alt: "CareLTC's live floor status on a dummy facility: counters for occupied, completed, due-now and missed rooms, floor and status filters, the 1st floor's room cards and an 85% completion ring.",
    title: "Live floor status",
    proves: "Every occupied room by floor with its round state: completed, due now, missed, paused or excused, and the share of the shift completed so far.",
    frame: "browser",
  },
  missedAlerts: {
    src: `${DIR}/portal-missed-alerts.webp`,
    width: 1600,
    height: 1000,
    alt: "Live status filtered to missed rooms, with the notifications panel listing a paused room and four missed-round alerts.",
    title: "Missed rounds and their alerts",
    proves: "Each missed round raises an alert for nurses and admins, and a CNA's skip shows who paused the rounds and until when.",
    frame: "browser",
  },
  pausedRoom: {
    src: `${DIR}/portal-paused-room.webp`,
    width: 1600,
    height: 1000,
    alt: "The live round details for room 118: status Paused, the note 'Resident at hospital', a Resume rounds button and a timeline of Excused rounds.",
    title: "Paused, so excused, not missed",
    proves: "Room 118's rounds are paused while the resident is at hospital. They show as Excused with the reason and who paused them, and Resume rounds brings back what can still be done.",
    frame: "browser",
  },
  skipReview: {
    src: `${DIR}/portal-skip-review.webp`,
    width: 1600,
    height: 1000,
    alt: "Live status with the Skips to review panel: room 205's resident out at an appointment, skipped from the floor 2 phone, with Approve and Reject buttons.",
    title: "Skips wait for review",
    proves: "A CNA's skip from a shared floor phone, with its reason and note, waits for an admin to approve or reject it. A rejected skip becomes missed without a false escalation.",
    frame: "browser",
  },
  schedules: {
    src: `${DIR}/portal-schedules.webp`,
    width: 1600,
    height: 1000,
    alt: "Rounding schedules: six active schedules and the edit form for the 1st floor day shift, every 2 hours with a 30-minute grace period and 10 minutes between rooms.",
    title: "Rounding schedules",
    proves: "Each floor and shift gets its first round, frequency, grace period and spacing between rooms, with a preview that updates before anything is saved.",
    frame: "browser",
  },
  reports: {
    src: `${DIR}/portal-reports.webp`,
    width: 1600,
    height: 1000,
    alt: "Reports on seeded dummy data: rounds with an outcome, completed, missed, excused, a compliance card, export buttons, a 7-day trend and missed rounds by date.",
    title: "Compliance, computed on the server",
    proves: "Compliance is completed ÷ (completed + missed), with excused rounds left out, plus a 7-day trend and Excel and PDF exports. Every number here is seeded dummy data.",
    frame: "browser",
  },
  nfcDryRun: {
    src: `${DIR}/portal-nfc-dry-run.webp`,
    width: 1600,
    height: 1000,
    alt: "The virtual NFC demo: a simulated CNA and a room tag, and the result 'Demo complete, nothing saved: 129 would be checked in by CNA Demo 3'.",
    title: "A demo that saves nothing",
    proves: "The virtual tap runs the real checks for a chosen CNA and room and shows what the app would record. Nothing is saved, so a demo can never change live status or reports.",
    frame: "browser",
  },
} satisfies Record<string, Screenshot>;

const MOBILE = {
  floorHome: {
    src: `${DIR}/mobile-floor-home.webp`,
    width: 780,
    height: 1688,
    alt: "The CareLTC app on a shared floor phone: 'Good morning, Floor 1', a check-in button, counters for rounds due now, missed and completed, and the floor's rounds.",
    title: "A floor phone's home",
    proves: "A shared floor phone covers every occupied room on its floor across all shifts, with what is due, missed and done, and one button to check in.",
    frame: "phone",
  },
  roundsDue: {
    src: `${DIR}/mobile-rounds-due.webp`,
    width: 780,
    height: 1688,
    alt: "The 1st floor rounds list filtered to Due now: rooms 129 and 110, each with its assigned CNA and its scheduled and due times.",
    title: "Rounds due now",
    proves: "Due, missed and upcoming rounds for the floor, each with its room, who it is assigned to and its check-in window.",
    frame: "phone",
  },
  roundDetails: {
    src: `${DIR}/mobile-round-details.webp`,
    width: 780,
    height: 1688,
    alt: "Round details for room 129: due now, assigned to CNA Demo 3, its schedule and times, an Open NFC scanner button and a link asking 'Can't do this round?'.",
    title: "Scan the tag, or say why not",
    proves: "A round leads to the NFC scanner, or to “Can't do this round?” when the resident is away.",
    frame: "phone",
  },
  skipReason: {
    src: `${DIR}/mobile-skip-reason.webp`,
    width: 780,
    height: 1688,
    alt: "The skip form: only this round or the rest of the shift, a list of reasons with 'Resident out' selected, a note and the CNA's own name.",
    title: "A skip needs a reason",
    proves: "Skipping one round or the rest of a shift takes a reason, a note and, on a shared phone, the CNA's own name.",
    frame: "phone",
  },
  skippedRounds: {
    src: `${DIR}/mobile-skipped-rounds.webp`,
    width: 780,
    height: 1688,
    alt: "The rounds list with a Skipped rounds section: room 118 excused while the resident is at hospital, with a 'Resident is back' button, and room 129 waiting for admin review.",
    title: "Skipped rounds stay on record",
    proves: "Skipped rounds stay listed as Excused with the reason and who skipped them, and “Resident is back: resume rounds” brings them back.",
    frame: "phone",
  },
  signIn: {
    src: `${DIR}/mobile-sign-in.webp`,
    width: 780,
    height: 1688,
    alt: "The CareLTC app's sign-in screen, with a floor phone's example address filled in.",
    title: "One sign-in for a shared phone",
    proves: "Staff sign in with an account their administrator issues; a floor phone signs in once for the whole floor.",
    frame: "phone",
  },
} satisfies Record<string, Screenshot>;

export const careltc: Flagship = {
  slug: "careltc",
  name: "CareLTC",
  headline: "Room rounds, recorded with a tap at the door",
  summary:
    "NFC room rounds for long-term care: staff tap the tag at each door on iOS or Android, the server checks the round, and nurses follow every floor live.",
  definition: "NFC room rounds for long-term care, on iOS, Android and a web portal.",
  domain: "Long-term care operations",
  updated: "2026-11-17",
  credit: {
    role: "I lead CareLTC and did the main engineering work, and I still maintain it and ship new features.",
  },
  figures: [
    { value: USAGE.careltc.figure, label: USAGE.careltc.label, source: "approved-usage" },
    { value: "500", label: "tests passed across the API, portal and app", source: "verification" },
    { value: "1.1.11", label: "the current app, through App Store and Google Play review", source: "verification" },
  ],
  problem: {
    body: [
      "Long-term care facilities run scheduled room rounds across floors, shifts and staff. During a shift, nurses need to see which rooms are covered, due, missed or excused. Afterwards, managers need a timestamped record to follow up on missed coverage.",
      "Residents go to hospital, move or are discharged, so a round nobody could do must not count as missed, and history must never be deleted. A tap records that someone was at the door. It is not evidence of the care given or of how long they stayed, and this page does not claim it.",
    ],
    users: [
      "CNAs on their own phones or on a shared floor phone",
      "Nurses and shift supervisors",
      "Administrators and directors of nursing",
    ],
  },
  constraints: [
    {
      constraint: "A check-in must come from the room's tag",
      forced: "In the mobile app a check-in happens only after a tag is read in an open scan session; links cannot complete one.",
      checked: "The server checks the tag, the person, the shift and the round's window before anything is written.",
    },
    {
      constraint: "Older builds stay installed while new ones wait in store review",
      forced: "New API fields are opt-in, and legacy fields keep their meaning.",
      checked: "Tests that an older app never sees a state it does not understand.",
    },
    {
      constraint: "Facility feeds can be empty or partial",
      forced: "Guards run before any write; a sync that would discharge too many residents changes nothing.",
      checked: "Sync tests: too many discharges change nothing and alert admins once.",
    },
    {
      constraint: "History must survive edits",
      forced: "Completed and missed rounds never change; schedules that own history are archived, not deleted.",
      checked: "PostgreSQL integration suites.",
    },
    {
      constraint: "Phones are shared and lock screens are public",
      forced: "Floor-phone accounts, resident names sent only as “Last, F.”, and lock screens that name rooms only.",
      checked: "Floor-account and alert integration tests.",
    },
    {
      constraint: "Shifts cross midnight",
      forced: "Planning in each facility's own time zone, stored in UTC; a night shift keeps its service date after midnight.",
      checked: "Facility-time and overnight tests.",
    },
  ],
  constraintsNote: "Runs in the cloud; there is no offline mode. A tap is not proof of presence or of care, and no compliance certification is claimed.",
  built: [
    {
      title: "Mobile app",
      icon: "mobile",
      items: [
        "NFC reading on iOS and Android, hardened for real devices, with copyable scan diagnostics",
        "Check-ins from a physical tap only, with link check-ins removed",
        "“Can't do this round?”: skip one round or the rest of the shift, with a reason and a note",
        "Push alerts with tap-to-open routing, and device and app-version reporting",
        "Every store release from 1.1.8 to 1.1.11, built from the monorepo",
      ],
    },
    {
      title: "API",
      icon: "api",
      items: [
        "The alerting pipeline: grouped push, reminders, and escalation only when no supervisor has looked",
        "The Excused state and round pauses, with admin review of staff skips",
        "The permission check behind check-ins and skips, and floor-aware tag resolution",
        "The mass-discharge guard in the hourly resident sync",
        "Floor-phone accounts, room occupancy recorded every minute, and “Last, F.” names everywhere",
        "Opt-in fields, so older store builds keep working",
      ],
    },
    {
      title: "Portal",
      icon: "portal",
      items: [
        "Server-side compliance reports with Excel and PDF exports",
        "The staff app-activity report",
        "Skip review on the live status board, and the NFC demo dry run",
        "Readable sizes at normal zoom, checked at 22 window sizes",
      ],
    },
    { title: "Docs", icon: "docs", items: ["A generator for the staff user manual, with QR codes"] },
  ],
  sketch: {
    title: "Rounds, end to end",
    zones: [
      // A non-breaking hyphen: the narrow zone breaks the label between words only.
      { label: "Room door", nodes: ["NFC tag · 10‑character code"] },
      { label: "Phone · iOS and Android", nodes: ["Rounds list", "Scan session", "Skip with a reason", "Push alerts"] },
      {
        label: "AWS",
        nodes: [
          "NestJS API on Amazon ECS (Fargate)",
          "Scheduler · every minute, in facility time",
          "Amazon RDS for PostgreSQL",
          "Portal on Amazon S3 and CloudFront",
          "Sign-in with Amazon Cognito",
        ],
      },
      { label: "Facility systems", nodes: ["Resident feed", "Staff roster"] },
    ],
    crossings: [
      { label: "A physical tap, inside an open scan session", direction: "forward" },
      { label: "HTTPS · tag, person, shift and window checked on the server", direction: "forward" },
      { label: "Guarded sync · empty feeds and mass discharges change nothing", direction: "back" },
    ],
    notes: ["Lock-screen alerts name room numbers and floors only."],
  },
  moreSketches: [],
  trace: [
    {
      title: "The phone reads the tag",
      body: "A physical tap inside an open scan session, through a native reader on iOS and on Android. Links cannot complete a check-in.",
      focus: { zone: 0, node: 0, crossing: 0 },
    },
    {
      title: "The API finds the open round",
      body: "It finds the room by its tag in the user's facility, checks the room has a resident, and returns the latest open round, including last night's while a night shift is still running.",
      focus: { zone: 2, node: 0, crossing: 1 },
    },
    {
      title: "The server checks, then completes the round",
      body: "One ordered chain of checks: the round, the room, whether this person may work it, its state, its window and the tag. Then a conditional update in one transaction, so a double tap completes once.",
      focus: { zone: 2, node: 0 },
    },
    {
      title: "A check-in snapshot is written once",
      body: "The audit row records the room, floor, shift, resident and staff member at that moment. Later edits never rewrite it.",
      focus: { zone: 2, node: 2 },
    },
    {
      title: "The scheduler raises missed-round alerts",
      body: "Every minute, in each facility's time zone, it opens rounds, marks overdue ones missed, alerts the right people and escalates only when no supervisor has looked.",
      focus: { zone: 2, node: 1 },
    },
    {
      title: "The hourly sync excuses empty rooms",
      body: "A resident in hospital, away or discharged turns the room's open rounds into Excused, never deleted. A feed that would discharge too many residents at once changes nothing.",
      focus: { zone: 3, node: 0, crossing: 2 },
    },
  ],
  boundary: [
    { data: "Resident names", direction: "leaves", path: "API → app and portal", rule: "Only as “Last, F.”; full names stay in the database." },
    { data: "Lock-screen alerts", direction: "leaves", path: "Push service → phone", rule: "Room numbers and floors only." },
    { data: "Check-ins", direction: "enters", path: "Phone → API", rule: "Checked on the server before anything is written." },
    { data: "Resident and roster data", direction: "enters", path: "Facility systems → API", rule: "Guarded: empty feeds and mass discharges change nothing." },
  ],
  deployment: [
    {
      title: "Runs on AWS",
      body: "The NestJS API runs on Amazon ECS with AWS Fargate behind an Application Load Balancer, with Amazon RDS for PostgreSQL in private subnets and TLS verified. The portal is served from a private Amazon S3 bucket through Amazon CloudFront, Amazon Cognito owns sign-in, secrets live in AWS Secrets Manager, logs go to Amazon CloudWatch, and the stack is defined in AWS CloudFormation.",
    },
    {
      title: "How a release ships",
      body: "Mobile builds go through EAS to App Store Connect and Google Play. API releases roll: the running task keeps serving until the new one passes its health check, and migrations run first, compatible with the running version.",
    },
    {
      title: "Older versions keep working",
      body: "New API fields are opt-in, so every installed build keeps working while a new one waits in store review.",
    },
  ],
  incidents: [
    {
      id: "ios-session",
      title: "iPhone scans failed under their own scan sheet",
      broke: "Every iPhone scan failed with a “Duplicated registration” error.",
      cause:
        "iOS marks the app inactive while the system NFC sheet is open. The scan screen treated that as leaving the app, tore down the session that had opened the sheet, and restarted before the system had released it.",
      change: "Scanning stops only when the app really goes to the background, with a bounded retry for that one native error and a sheet timeout treated as normal.",
      guard: "Seven session-lifecycle unit tests. Shipped in iOS build 14.",
    },
    {
      id: "store-rejection",
      title: "App Store review rejected a build",
      broke: "App Store review rejected the binary (ITMS-90778).",
      cause: "The build requested an NFC entitlement value Apple does not allow.",
      change: "Dropped that entitlement from the config plugin; tags are still read through the reader session.",
      guard: "Store-specific changes live in config plugins, reviewed with each release.",
    },
    {
      id: "link-check-ins",
      title: "Opening a link could check a round in",
      broke: "Opening a tag's link through an Android intent or a deep link could complete a check-in.",
      cause: "A deep-link path completed check-ins.",
      change: "Removed it: in the mobile app, a check-in happens only after a tag is read in a scan session.",
      guard: "The server still checks the code, the person, the round and its window.",
    },
    {
      id: "missed-history",
      title: "Missed rounds disappeared from history",
      broke: "Missed rounds vanished when a room went vacant or a schedule was edited.",
      cause: "A clean-up deleted rounds that were really compliance history.",
      change: "Only rounds that have not happened yet are replaced, and schedules that own history are archived, not deleted.",
      guard: "PostgreSQL integration suites.",
    },
    {
      id: "demo-live-data",
      title: "A demonstration could change live data",
      broke: "The admin's virtual NFC tap could complete a real round that was due.",
      cause: "The demo ran the real check-in path.",
      change: "A dry run: the same lookups as a real tap, and nothing saved.",
      guard: "A test that the demo writes nothing; earlier demo rounds are left out of reports.",
    },
    {
      id: "partial-feed",
      title: "A partial feed could empty a building",
      broke: "An empty or partial resident feed could mark many residents as having left their rooms.",
      cause: "The sync trusted whatever list it received.",
      change: "A run that would discharge more than max(5, 20%) of active residents changes nothing and alerts admins.",
      guard: "Sync tests: too many discharges change nothing and alert once; a few in a small facility are allowed.",
    },
  ],
  decisions: [
    {
      choice: "A physical tap over links",
      instead: "Check-ins from a URL",
      reason: "A check-in should come from the room's own tag.",
      tradeoff: "Needs installed native builds and NFC-capable phones.",
    },
    {
      choice: "Opt-in API fields",
      instead: "Changing responses in place",
      reason: "Older builds stay in use while a new one waits in store review.",
      tradeoff: "Legacy fields are kept longer.",
    },
    {
      choice: "Excuse, never delete",
      instead: "Deleting or rewriting rounds",
      reason: "Managers follow up from the record, and compliance must leave out rounds nobody could do.",
      tradeoff: "More states to reason about.",
    },
    {
      choice: "“Last, F.” names and room-only lock screens",
      instead: "Full names everywhere",
      reason: "Phones are shared and lock screens are public.",
      tradeoff: "Staff open the app to see who.",
    },
    {
      choice: "Refuse a suspicious sync",
      instead: "Trusting the feed",
      reason: "A feed outage looks exactly like a wave of discharges.",
      tradeoff: "A real mass discharge needs a deliberate manual sync.",
    },
    {
      choice: "Conditional updates instead of locks",
      instead: "A distributed lock across API instances",
      reason: "Every API instance runs the scheduler; claiming a reminder before sending it, and updating only from the expected state, makes each step happen once.",
      tradeoff: "Every write has to state the state it expects.",
    },
  ],
  verification: {
    suites: [
      {
        value: "369",
        label: "API tests passed, in 39 files",
        method: "Unit tests plus four integration suites against a throwaway PostgreSQL, run on 17 Nov 2026 in a sandbox.",
      },
      {
        value: "97",
        label: "portal tests passed, in 20 files",
        method: "Vitest with Testing Library, run on 17 Nov 2026.",
      },
      {
        value: "34",
        label: "mobile app tests passed, in 8 files",
        method: "Vitest on the NFC, scan-session, skip and push modules, run on 17 Nov 2026.",
      },
    ],
    checks: [
      "The server's chain of checks on every check-in and skip",
      "PostgreSQL integration suites for floor phones, alerts and pauses, run only against a disposable database",
      "App Store and Google Play review for every release from 1.1.8 to 1.1.11",
      "Lint, type checks and tests in every app before a release",
      "Playwright end-to-end tests for the portal",
    ],
    notMeasured: [
      "Changes in missed rounds at a facility",
      "Rounds recorded per day",
      "Time saved for nurses",
      "That a tap proves presence, or the quality of care",
    ],
  },
  outcome: {
    proves: [
      `Room rounds recorded by a physical tap in the mobile app and checked on the server, used by ${USAGE.careltc.sentence}.`,
      "iOS and Android releases shipped through store review, from 1.1.8 to 1.1.11, with older builds kept working.",
      "Missed, paused and excused rounds kept as history, never deleted.",
    ],
    notShown: ["Facility names or resident data", "Changes in missed rounds or in care", "That a tap proves presence"],
  },
  highlights: [
    {
      id: "ios-nfc",
      title: "The iOS scan that restarted under itself",
      body: "iOS marks an app inactive while its NFC sheet is open, and the scanner tore down its own session. It now stops only in the background, with a bounded retry for that one error.",
      art: { kind: "timeline", items: ["Scans fail: duplicated registration", "Cause: inactive under the sheet", "Change: stop only in the background"] },
      wide: true,
    },
    {
      id: "physical-tap",
      title: "A check-in starts at the door",
      body: "In the mobile app a round completes only after the room's tag is read in an open scan session.",
      art: { kind: "badge", title: "Room 204", lines: ["✓ Round recorded", "tap at the door"] },
    },
    {
      id: "guard-chain",
      title: "The server decides, not the phone",
      body: "One ordered chain checks the room, the person and shift, the window and the tag, then completes the round once.",
      art: { kind: "checks", items: ["Room on", "Person and shift", "Window open", "Tag matches"] },
    },
    {
      id: "excused",
      title: "Excused, never deleted",
      body: "A pause records who, why and until when, and turns only still-open rounds into Excused. Compliance leaves them out.",
      art: { kind: "flow", nodes: ["Scheduled", "Paused", "Excused"], hot: 2 },
    },
    {
      id: "discharge-guard",
      title: "A partial feed changes nothing",
      body: "The hourly sync refuses a run that would discharge more than max(5, 20%) of active residents, and tells admins why.",
      art: {
        kind: "bars",
        items: [
          { label: "Leaving", value: 84 },
          { label: "Limit", value: 38 },
        ],
        note: "run refused · nothing changed",
      },
    },
    {
      id: "privacy",
      title: "Lock screens name rooms, not residents",
      body: "Every API sends resident names as “Last, F.”, the database keeps the full name, and push text lists room numbers only.",
      art: { kind: "reply", question: "Round due now", answer: "Room 204 on 2nd Floor · check in by 10:20 AM", cite: "Room numbers only" },
    },
    {
      id: "midnight",
      title: "Shifts that cross midnight",
      body: "Planning runs in each facility's own time zone and is stored in UTC. A night shift that began yesterday still belongs to yesterday after midnight.",
      art: { kind: "terminal", running: "22:00 facility time → UTC…", done: "the night shift keeps its service date" },
      wide: true,
    },
    {
      id: "escalation",
      title: "Escalate only when nobody looked",
      body: "A missed round alerts the right people in one grouped push, and escalates only if no supervisor opened the alert within 30 minutes.",
      art: { kind: "flow", nodes: ["Missed", "30 minutes", "Supervisors"], hot: 1 },
    },
    {
      id: "opt-in",
      title: "Older builds keep working",
      body: "New states and alert types are opt-in, so a build already in the stores never meets a value it does not understand.",
      art: { kind: "checks", items: ["1.1.10 · unchanged", "1.1.11 · asks for Excused"] },
    },
    {
      id: "dry-run",
      title: "A demo that saves nothing",
      body: "The admin's virtual tap runs the same lookups as a real one and saves nothing, so a demo never changes live status.",
      art: { kind: "terminal", running: "virtual tap at room 101…", done: "would be checked in · nothing saved" },
    },
  ],
  excerpts: [
    {
      id: "ios-nfc-session",
      title: "The iOS NFC session fix",
      story:
        "On iPhones every scan failed with “Duplicated registration”: the system NFC sheet made the app inactive, and the screen tore down and restarted the very session that had opened that sheet. The fix keeps the session alive unless the app really goes to the background, and retries that one native error a bounded number of times, stopping if the screen closes.",
      file: "mobile/nfc/ios-session.ts",
      lang: "ts",
      code: `// iOS reports the app as \`inactive\` while the system "Ready to Scan" sheet is
// on screen. Stopping the scan on \`inactive\` tears down the very session that
// opened the sheet, so only a real move to the background stops NFC scanning.
export function keepsNfcScanRunning(state: AppStateStatus | null | undefined): boolean {
  return state !== 'background';
}

export function isDuplicateRegistrationError(error: unknown): boolean {
  const text = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /duplicated registration/i.test(text);
}

// Core NFC clears a finished session asynchronously. Starting the next session
// before that completes fails with "Duplicated registration", so wait briefly
// and try again instead of reporting a scanner failure.
export async function startWhenPreviousSessionClosed<T>(
  start: () => Promise<T>,
  { attempts = 6, delayMs = 300, shouldContinue = () => true }:
    { attempts?: number; delayMs?: number; shouldContinue?: () => boolean } = {},
): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await start();
    } catch (error) {
      if (attempt >= attempts || !isDuplicateRegistrationError(error) || !shouldContinue()) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}`,
    },
    {
      id: "work-a-round",
      title: "Server-side validation of a tap",
      story:
        "The phone never decides what it may complete: the server applies one rule to check-ins and skips alike, so a shared floor phone works only its floor and a CNA works only an assigned room in a shift they are rostered for. It is the “may this person work it” step of the ordered chain of checks every tap goes through, and it runs before anything is written.",
      file: "api/rounds/rounds.service.ts",
      lang: "ts",
      code: `/**
 * Whether this user may work (check in or skip) a round: a floor phone only
 * on its floor; a CNA only on their assigned room and rostered shift.
 */
async assertCanWorkRound(user: AuthenticatedUser, round: WorkableRound) {
  const coverageFloor = this.coverageFloor(user);
  if (coverageFloor) {
    if (round.room.floor !== coverageFloor) {
      throw new ForbiddenException(this.otherFloorMessage(round.room.floor, coverageFloor));
    }
  } else if (user.role === UserRole.STAFF) {
    const assignmentModeActive = (await this.prisma.roomCnaAssignment.count({
      where: { facilityId: user.facilityId, serviceDate: round.serviceDate },
    })) > 0;
    if (assignmentModeActive && round.assignedCaregiverId && round.assignedCaregiverId !== user.id) {
      throw new ForbiddenException('This room is assigned to another CNA for this shift');
    }
    const assignments = await this.prisma.dailyStaffAssignment.findMany({
      where: { facilityId: user.facilityId, userId: user.id, serviceDate: round.serviceDate },
      select: { externalShiftId: true, shiftName: true },
    });
    const shift = round.schedule?.shift ?? null;
    const matchesRoster = shift && assignments.some((assignment) =>
      (shift.externalShiftId !== null && assignment.externalShiftId === shift.externalShiftId)
      || assignment.shiftName.trim().toLowerCase() === shift.name.trim().toLowerCase());
    if (assignments.length && !matchesRoster) throw new ForbiddenException('This round is outside your scheduled shift');
  }
}`,
    },
    {
      id: "discharge-guard",
      title: "A sync that refuses to empty the building",
      story:
        "A partial feed from the records system looks like dozens of discharges, and acting on it would excuse rounds across the building. The hourly sync now refuses any run that would move more than max(5, 20%) of active residents out of their rooms, changes nothing, and tells admins, at most once every six hours.",
      file: "api/sync/resident-sync.service.ts",
      lang: "ts",
      code: `/**
 * The automatic resident sync skips a run that would discharge more residents
 * than this at once (a feed outage or partial list, not real discharges).
 */
export function residentSyncDischargeLimit(activeResidents: number) {
  return Math.max(5, Math.ceil(activeResidents * 0.2));
}

// … in syncResidents(facilityId), after the feed has been fetched and validated:
const sourceMrns = new Set(facilityResidents.map((resident) => String(resident.mrn ?? '').trim()).filter(Boolean));
const active = await this.prisma.resident.findMany({ where: { facilityId, isActive: true }, select: { mrn: true } });
const leaving = active.filter((resident) => !sourceMrns.has(resident.mrn)).length;
const limit = residentSyncDischargeLimit(active.length);
if (leaving > limit) {
  await this.warnAdmins( // in-portal alert, at most once every 6 hours per facility
    facilityId,
    'Resident sync paused',
    \`The resident feed has no active room record for \${leaving} of \${active.length} residents (the automatic limit is \${limit}). Nothing was changed.\`,
  );
  return { skipped: 'TOO_MANY_DISCHARGES' as const, leaving, limit };
}
return this.importResidents(facilityId, facility.timezone, facilityResidents, facilitySourceResidents);`,
    },
    {
      id: "excused-rounds",
      title: "Excused rounds: a pause covers rounds, and nothing is deleted",
      story:
        "When a resident is in hospital, away or discharged, deleting their rounds would erase the record, and leaving them would create false misses. A third outcome, Excused, records who, why and until when, turns only still-open rounds into EXCUSED, gives back what can still be done when the pause ends, and turns a rejected skip into MISSED while keeping its link to the pause.",
      file: "api/rounds/round-pauses.ts",
      lang: "ts",
      code: `/** A one-round skip covers exactly that round; a period covers every round still open when it starts and opening before it ends. */
export function pauseCoversRound(pause: PauseWindow, round: { id?: string; scheduledAt: Date; dueAt: Date }) {
  if (pause.roundId) return pause.roundId === round.id;
  return round.dueAt > pause.startsAt && (!pause.endsAt || round.scheduledAt < pause.endsAt);
}

/** Excuses the room's not-yet-done rounds that a pause covers. */
export function excuseRoundsForPause(db: Db, facilityId: string, pause: PauseWindow, now: Date) {
  // The round can cross its deadline after the request was validated. Check
  // the clock again immediately before the database update.
  const openAfter = new Date(Math.max(pause.startsAt.getTime(), now.getTime(), Date.now()));
  return db.round.updateMany({
    where: pause.roundId
      ? { id: pause.roundId, facilityId, state: RoundState.SCHEDULED, dueAt: { gt: openAfter } }
      : { facilityId, roomId: pause.roomId, state: RoundState.SCHEDULED, dueAt: { gt: openAfter }, ...(pause.endsAt ? { scheduledAt: { lt: pause.endsAt } } : {}) },
    data: { state: RoundState.EXCUSED, pauseId: pause.id },
  });
}

/** Rounds still open come back; ended ones stay excused, or become missed when a CNA skip is rejected. */
export async function releaseRounds(db: Db, pauseId: string, now: Date, endedWindows: 'EXCUSED' | 'MISSED') {
  const restored = await db.round.updateMany({ where: { pauseId, state: RoundState.EXCUSED, dueAt: { gt: now } }, data: { state: RoundState.SCHEDULED, pauseId: null } });
  let missedIds: string[] = [];
  if (endedWindows === 'MISSED') {
    const ended = await db.round.findMany({ where: { pauseId, state: RoundState.EXCUSED, dueAt: { lte: now } }, select: { id: true } });
    missedIds = ended.map((round) => round.id);
    if (missedIds.length) await db.round.updateMany({ where: { id: { in: missedIds }, state: RoundState.EXCUSED }, data: { state: RoundState.MISSED } });
  }
  return { restored: restored.count, missedIds };
}`,
    },
    {
      id: "escalation",
      title: "Escalate only when no supervisor has looked",
      story:
        "Escalation used to page everyone whenever a round stayed missed, even when a nurse was already dealing with it. It now goes to Admins and Nurses only, and only if none of them has opened or cleared the alert within 30 minutes; in the same change, reminders are claimed before sending, so two API instances during a rolling deploy cannot notify a CNA twice.",
      file: "api/notifications/notifications.service.ts",
      lang: "ts",
      code: `/**
 * A missed round cannot be checked in afterwards, so the escalation asks a
 * supervisor to follow up. It goes to Admins and Nurses only, and only when
 * none of them has opened or cleared the missed-round alert in time.
 */
async createEscalations(escalationMinutes: number, now = new Date()) {
  const cutoff = new Date(now.getTime() - escalationMinutes * 60_000);
  const candidates = await this.prisma.round.findMany({
    where: {
      state: RoundState.MISSED,
      dueAt: { gte: this.oldestAlertableDueAt(now), lte: cutoff },
      notifications: { none: { type: NotificationType.ROUND_ESCALATED } },
    },
    include: { ...alertRoundInclude, notifications: {
      where: { type: NotificationType.ROUND_MISSED, OR: [{ readAt: { not: null } }, { dismissedAt: { not: null } }] },
      select: { recipientId: true },
    } },
    take: 500,
  });
  const audience = new RoundAudience(this.prisma);
  const deliveries: Delivery[] = [];
  let escalated = 0;
  for (const { notifications: reviewed, ...round } of candidates) {
    const supervisors = await audience.supervisors(round.facilityId);
    if (reviewed.some((alert) => supervisors.includes(alert.recipientId))) continue;
    const created = await this.createAlerts(round, NotificationType.ROUND_ESCALATED, supervisors, alertText(NotificationType.ROUND_ESCALATED, round, escalationMinutes));
    if (created.length) escalated += 1;
    deliveries.push(...created);
  }
  await this.sendPhoneAlerts(NotificationType.ROUND_ESCALATED, deliveries, now);
  return escalated;
}`,
    },
  ],
  hero: {
    primary: PORTAL.liveStatus,
    secondary: MOBILE.floorHome,
    caption: "The admin portal's live floor status and a floor phone's home screen, both on dummy data.",
  },
  gallery: [
    {
      id: "portal",
      label: "Portal",
      shots: [
        PORTAL.liveStatus,
        PORTAL.missedAlerts,
        PORTAL.pausedRoom,
        PORTAL.skipReview,
        PORTAL.schedules,
        PORTAL.reports,
        PORTAL.nfcDryRun,
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      shots: [MOBILE.floorHome, MOBILE.roundsDue, MOBILE.roundDetails, MOBILE.skipReason, MOBILE.skippedRounds, MOBILE.signIn],
    },
  ],
  recordings: [
    {
      id: "portal-demo",
      label: "Admin portal",
      title: "The admin portal, on a dummy facility",
      src: `${DIR}/portal-demo.webm`,
      poster: `${DIR}/portal-demo.webp`,
      captions: `${DIR}/portal-demo.vtt`,
      width: 1440,
      height: 900,
      duration: 75.16,
      frame: "browser",
      alt: "Screen recording of the CareLTC admin portal on a dummy facility: live floor status, missed-round alerts, a paused room, reports and the NFC dry run.",
      summary: "Live status by floor, missed-round alerts, a room paused while its resident is at hospital, the compliance report, and a virtual tap that saves nothing.",
      scenes: [
        { start: 0, end: 2, text: "The portal signs in on a local demo stack with dummy data." },
        { start: 2, end: 10, text: "Live floor status: every occupied room by floor, with its round state." },
        { start: 10, end: 16, text: "The Missed filter and the alerts bell: each missed round raises an alert for nurses and admins." },
        { start: 16, end: 56, text: "Room 118: rounds paused until resumed while the resident is at hospital. They show as Excused, not Missed, with who paused them and why." },
        { start: 56, end: 64, text: "Reports: compliance is completed ÷ (completed + missed), with excused rounds left out. The figures are seeded dummy data." },
        { start: 64, end: 69, text: "The virtual NFC demo runs the real checks for a tap at room 101." },
        { start: 69, end: 75.16, text: "Demo complete, nothing saved: it shows what the app would record, without changing any round, report or check-in." },
      ],
    },
  ],
  stack: {
    groups: [
      {
        label: "Mobile app",
        items: ["Expo", "React Native", "Expo Router", "react-native-nfc-manager", "expo-notifications", "TypeScript", "Vitest", "EAS Build and Submit"],
      },
      {
        label: "API",
        items: ["Node.js", "NestJS", "Prisma", "PostgreSQL", "class-validator", "Swagger", "Vitest", "Supertest"],
      },
      {
        label: "Portal",
        items: ["React", "Vite", "TanStack Router and Query", "Tailwind CSS", "Recharts", "ExcelJS", "jsPDF", "Playwright"],
      },
    ],
    aws: [AWS.ecs, AWS.fargate, AWS.ecr, AWS.alb, AWS.rds, AWS.s3, AWS.cloudfront, AWS.cognito, AWS.secrets, AWS.cloudwatch, AWS.cloudformation, AWS.vpc, AWS.iam],
  },
  card: {
    body: "Care staff record each round with a tap at the door on iOS or Android; nurses follow every floor live and follow up on missed rounds.",
    tech: "Expo and React Native · NestJS · PostgreSQL · AWS: ECS on Fargate, RDS, Cognito, CloudFront",
  },
};
