# Arco — Manager Manual

*Role: **Manager**. You see how the studio is performing, as numbers.*

> 中文版：[zh/03-manager.md](zh/03-manager.md)

This is a short manual, and that is the point. Your role has one screen that
matters and a deliberately narrow view of everything else.

---

## 1. The one rule worth reading first

**A Manager is not a senior teacher.**

It is natural to assume Manager is the most powerful role — it usually is in
other software. In Arco it is not. A manager sees *less* than a teacher, on
purpose.

You can see how many lessons happened, how many students are active, and how
each teacher's workload is tracking. You can **never** open a student's video,
read a message, or see the text of somebody's homework.

> Think of it as: a manager sees the **scoreboard**, not the **game**.

This is not a matter of screens being hidden from you. The restriction is
enforced by the server: even if you typed the address of a student's page
directly, the data would not be sent.

---

## 2. Getting in

Your studio owner sends you an invitation link — only an owner can create a
manager. Open it, set a name, email and password, then log in.

![Accepting an invitation](screenshots/shared-01-accept-invite-register.jpg)

---

## 3. Your dashboard

This is your main screen, and very nearly your only one.

![Manager dashboard](screenshots/manager-01-dashboard.jpg)

### The four counters

| Counter | What it counts |
|---|---|
| **Teachers** | Teachers in the studio. |
| **Students** | Students across every teacher. |
| **Upcoming sessions** | Lessons booked and still to happen. |
| **Videos to review** | Student videos waiting for a teacher's feedback. |

*Videos to review* is the one to watch. A number that climbs week on week means
work is arriving faster than teachers are getting through it.

### Task progress

The studio's shared to-do list as a percentage — how many tasks are done out of
the total, and how many are still open. You see the progress bar, not the
individual tasks.

### By teacher

One row per teacher: **Students**, **Upcoming**, **Completed**, **Videos to
review**, **Unread**.

This is your workload view. It answers "is anyone overloaded, and is anyone
falling behind on feedback?" without exposing a single student's work.

> Note what this table contains: teacher names and counts. **No student names
> appear anywhere on your dashboard** — not in the table, not behind it, not in
> the underlying data your browser receives.

---

## 4. Announcements

**Sidebar → Announcements (02).** Your only other section.

You see every announcement sent in the studio — by the owner and by every
teacher — with who sent it, which audience, and how many people it reached.

![An announcement as a manager](screenshots/manager-03-announcement-redacted.jpg)

What you do **not** see is the message itself. Where the text would be, Arco
says:

> *You can see that an announcement was sent and how far it reached. The message
> itself stays between the sender and their students.*

The **Delivery** panel still gives you the useful part: recipient count,
audience, sender and timestamp.

You cannot send announcements. There is no *Announce* button for a manager —
that belongs to owners and teachers.

---

## 5. Notifications

The bell above your name carries studio events at the same level of detail —
for example *"Broadcast sent to 1 student"*, with the subject line and sender,
never the contents.

![Notifications](screenshots/manager-04-notifications.jpg)

**Mark read** clears one; **Mark all read** clears everything.

---

## 6. What you cannot reach

If you follow a link or type an address for a section outside your role, Arco
tells you plainly rather than showing a broken page:

![No access](screenshots/manager-02-no-access.jpg)

| Section | Manager access |
|---|---|
| Dashboard | ✅ Aggregate figures only |
| Announcements | ✅ Metadata and delivery counts, never the message text |
| Notifications | ✅ Event and counts |
| Library | ✅ Shared studio files (see below) |
| Students | ❌ No access |
| Courses & homework | ❌ No access |
| Videos | ❌ No access |
| Messages | ❌ No access |
| Bookings | ❌ No access |
| Invitations | ❌ No access |
| Organization settings | ❌ Owner only |

### The one exception: the Library

The shared Library — handouts, sheet music, studio files — is readable by
everyone in the studio, managers included. It is not in your sidebar, but it is
not blocked either.

This is a deliberate distinction, not an oversight. The Library holds material
the studio publishes to everybody; it never holds a particular student's work.
A student's own submissions, videos and messages remain closed to you.

---

## 7. Everyday bits

- **Language** — click your name at the bottom of the sidebar to switch between
  **English** and **中文**.
- **Log out** — same menu.

---

## What to look at, and when

- **Weekly:** *Videos to review* per teacher. A rising number is the earliest
  sign feedback is slipping.
- **Weekly:** *Unread* per teacher — messages from students going unanswered.
- **Monthly:** *Students* per teacher, for workload balance across the studio.
- **Ongoing:** *Task progress*, for whether studio admin is actually getting done.

If a number prompts a question about a specific student, that conversation goes
to the owner or the teacher. By design, you cannot answer it from here.
