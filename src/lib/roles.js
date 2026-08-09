// Frontend mirror of the backend's src/constants/roles.js. Keep the two in
// sync -- this file must never be the place a new rule is invented, only where
// the server's rules are reflected for rendering decisions.
//
// SECURITY NOTE: nothing here is a security boundary. The role comes from an
// unverified client-side decode of the JWT payload (see AuthContext), so it
// tells us what to DRAW, never what to ALLOW. The server re-checks every
// request; if these helpers were wrong, the UI would show a control that then
// fails with 403, not leak data.
//
// THE HIERARCHY
//   owner   -- one per organization. Sees everything in their org.
//   manager -- AGGREGATES ONLY. Per-teacher rollups, never an individual
//              student's surveys, videos or messages.
//   admin   -- a teacher. Sees only their own students. (Formerly 'elle'.)
//   student -- sees only themselves.
//
// WHY THESE HELPERS EXIST AT ALL
// The app used to branch on a single boolean:
//     const isElle = Boolean(user && user.role === 'elle')
// with `!isElle` meaning "is a student" in nine different components. Adding
// any third role to that shape silently drops it into the student branch --
// so an owner or a manager would have been shown the student UI. Every one of
// those sites now asks a specific question instead.

export const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  ADMIN: 'admin',
  STUDENT: 'student'
};

const roleOf = (user) => (user && user.role) || null;

// A teacher: owns a roster of students and does the day-to-day teaching work.
export const isAdmin = (user) => roleOf(user) === ROLES.ADMIN;

// The organization owner: full visibility across their own organization.
export const isOwner = (user) => roleOf(user) === ROLES.OWNER;

// The oversight role: metrics only, no individual student data.
export const isManager = (user) => roleOf(user) === ROLES.MANAGER;

export const isStudent = (user) => roleOf(user) === ROLES.STUDENT;

// May view an individual student's records -- rosters, surveys, videos,
// message threads. Mirrors CAN_READ_STUDENT_DETAIL on the server.
// Deliberately excludes manager.
export const canReadStudentDetail = (user) => isOwner(user) || isAdmin(user);

// May see cross-teacher aggregate reporting. Mirrors CAN_READ_AGGREGATES.
export const canReadAggregates = (user) => isOwner(user) || isManager(user);

// May reach a route that shows an individual student's content -- videos,
// survey detail, message threads. This is "everyone except manager", which is
// NOT the same question as canReadStudentDetail: a student belongs here
// (they see their own records) but not there (they can't see others').
//
// Used for route gating rather than rendering. The server is the real
// boundary and returns 403/404 for a manager on these paths regardless; this
// just stops the client from rendering a page that can only fail, which is
// what the nav already assumes (AppShell shows a manager one link).
export const canOpenStudentContent = (user) => Boolean(user) && !isManager(user);

// May send an announcement. Mirrors CAN_BROADCAST_ORG plus
// CAN_BROADCAST_ROSTER on the server -- an owner addresses the organization, a
// teacher their own roster.
//
// Deliberately excludes manager, who outranks a teacher but may not send. This
// is the same trap the server file warns about: any "senior enough" phrasing
// here would draw a compose form that can only 403.
export const canBroadcast = (user) => isOwner(user) || isAdmin(user);

// May choose WHO an announcement goes to. Owner only -- a teacher's audience is
// always their own students, so they are shown no selector. Mirrors
// CAN_BROADCAST_ORG.
export const canChooseBroadcastAudience = (user) => isOwner(user);

// May open the broadcast list: senders see their own outbox, owner and manager
// see the org's activity. Mirrors the server's GET /broadcasts gate, which is
// the union of the two send capabilities and CAN_READ_BROADCAST_OVERSIGHT.
export const canReadBroadcasts = (user) => canBroadcast(user) || isManager(user);

// Runs the teaching-side UI (student pickers, review queues, upload controls).
// This is the closest replacement for the old `isElle`, but note it is NOT
// interchangeable: `!canManageStudents(user)` does NOT mean "is a student",
// because a manager satisfies neither. Check isStudent(user) explicitly when
// you mean the student experience.
export const canManageStudents = (user) => isOwner(user) || isAdmin(user);
