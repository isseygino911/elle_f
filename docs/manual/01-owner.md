# Arco — Studio Owner Manual

*Role: **Owner**. You created the studio, so you can see and do everything in it.*

> 中文版：[zh/01-owner.md](zh/01-owner.md)

This guide walks the whole setup in the order you will actually do it: create the
studio, invite your people, put a teacher in front of each student, then run the
day-to-day.

---

## 1. Create your studio

Go to **/register-organization**. One form creates both the studio and your own
owner account.

![Create your organization](screenshots/signup-01-create-org-empty.jpg)

| Field | What to put |
|---|---|
| Organization name | Your studio's name. Everyone in the studio sees this in the sidebar. |
| Your name | Your own name. |
| Email | Becomes your login. |
| Password | At least 8 characters. |

![Filled in](screenshots/signup-02-create-org-filled.jpg)

Press **Create organization**. Arco confirms with *"Account created. Please log in."*
and drops you on the login screen — signing up does not log you in automatically.

![Account created](screenshots/signup-03-login-account-created.jpg)

Log in with the email and password you just chose.

### Your studio is private

Everything you create — students, videos, messages, files — is visible only to
people inside your studio. Other studios using Arco cannot see any of it.

---

## 2. The dashboard

This is your home screen. A brand-new studio is empty, which is expected.

![Owner dashboard](screenshots/owner-01-dashboard.jpg)

Four counters run across the top: **Videos to review**, **Unread messages**,
**Homework due**, **Sessions next 24h**. Below them sit **Tasks**, **Upcoming
bookings** and **Active courses**.

Your sidebar has ten sections, numbered 01–10. Only the owner sees all ten —
Invitations and Organization are yours alone.

---

## 3. Brand the studio — Organization

**Sidebar → Organization (10).** Owner-only.

![Organization settings](screenshots/owner-02-organization-top.jpg)

Three things to set:

- **Organization name** — edit it and press *Save changes*.
- **Brand logo** — PNG, JPEG or WebP up to 2MB. Until you upload one, your studio
  name is the only brand mark, and the "Show organization name next to the logo"
  checkbox stays disabled.
- **Accent color** — twelve themes: Lime, Violet, Ocean, Coral, Amber, Forest,
  Rose, Cyan, Teal, Indigo, Plum, Slate.

![Accent colors](screenshots/owner-03-organization-accent-colors.jpg)

Click any swatch and it applies instantly for **everyone in the studio** —
there is no separate save step, just a green *"Accent color updated."*

![Ocean applied](screenshots/owner-04-accent-changed-ocean.jpg)

---

## 4. Invite your people — Invitations

**Sidebar → Invitations (09).** Owner-only. This is the only way anyone else
joins your studio.

![Invitations](screenshots/owner-05-invite-form.jpg)

Press **+ Invite**, choose the role, optionally type the person's name so you can
recognise the invitation later, then **Generate invitation link**.

### Which role to choose

![Role options](screenshots/owner-06-invite-role-options.jpg)

| Role | Arco's own description | Use it for |
|---|---|---|
| **Student** | *"Joins your roster. You become their teacher."* | Anyone taking lessons. |
| **Teacher (admin)** | *"A teacher with their own roster of students."* | Staff who teach. |
| **Manager** | *"Sees aggregate reporting only, never individual students."* | Oversight, front desk, a parent trustee. |

> **A Manager is not a senior teacher.** They see totals and counts, never a
> student's video, message or homework. Think scoreboard, not game.

### Sending the link

![Invitation created](screenshots/owner-07-invitation-created-teacher.jpg)

Arco does **not** email the invitation. It shows you a link and you send it
yourself — email, WhatsApp, however you like.

> **Copy it now.** The link is shown once and is never stored. If you lose it,
> your only option is to issue a fresh invitation.

The left column tracks **Pending** and **Accepted** counts. Click any invitation
to see its status, role, creation date and expiry.

![Invitation detail](screenshots/owner-10-invitation-detail.jpg)

**Invitations expire after 7 days.** An expired or unused invitation costs you
nothing — just issue another one.

### What the invitee sees

![Accepting an invitation](screenshots/shared-01-accept-invite-register.jpg)

They open your link, fill in name, email and password, and press *Create account*.
You get a notification when they accept.

---

## 5. Put a teacher in front of every student

This step is easy to miss and it matters.

**Sidebar → Students (02)**, then click a student.

![Student with no teacher](screenshots/owner-11-student-detail-no-teacher.jpg)

A student invited by you starts with **no teacher**, and Arco warns you plainly:

> *This student is on no teacher's roster and is not visible to any teacher.*

Until you fix this, no teacher can see or teach them.

Pick a teacher from **Assigned teacher** — the number in brackets is how many
students that teacher already has — then press **Save assignment**.

> The change is not saved until you press that button. Navigating away first
> silently discards it.

![Teacher assigned](screenshots/owner-12-student-assigned-teacher.jpg)

The warning disappears. Come back here whenever a student changes teacher, or
when a teacher leaves — deleting a teacher leaves their students unassigned
rather than deleting them.

Each student's record also carries four tabs: **Bookings, Courses, Homework, Videos**.

---

## 6. Courses and homework

**Sidebar → Courses (03).** Filter by **All / Active / Archived**.

Press **+ New course**:

![New course](screenshots/owner-13-new-course-form.jpg)

- **Course title** — required.
- **Teacher** — who will set homework for this course.
- **Description** — optional.

![Course created](screenshots/owner-14-course-created.jpg)

The course page has a **Curriculum** (its homework, in order) and an **Enrolled
students** panel, plus *New homework*, *Add cover*, *Archive* and *Delete course*.

To enrol someone, press the person icon beside *Enrolled students*, pick the
student and press **Enroll**. They immediately see the course and its published
homework.

![Student enrolled](screenshots/owner-15-course-student-enrolled.jpg)

**Archive** keeps a finished course and its history without cluttering the active
list. **Delete** removes it permanently.

---

## 7. Shared files — Library

**Sidebar → Library (04).** Everyone in the studio can read the library; only
owners and teachers can add to it.

![Library](screenshots/owner-16-library-empty.jpg)

Create a category by typing a name under **New category** and pressing **+**.
Files with no category land in *Uncategorized*. The search box at the top
searches every file.

Press **Upload** to add a file:

![Upload form](screenshots/owner-17-library-upload-form.jpg)

Documents, images, archives, audio or video, **up to 500 MB**. Give it a title
(required), choose or create a category, and optionally describe it.

---

## 8. Announcements

**Sidebar → Announcements (08).** One message to a whole group at once. Unlike
Messages, this is one-way — nobody replies to it.

Press **+ Announce**. As owner you choose the audience:

![Choose audience](screenshots/owner-18-announcement-audience.jpg)

| Send to | Reaches |
|---|---|
| **Students** | Every student in the studio. |
| **Teachers** | Every teacher. |
| **Everyone** | Every teacher and every student. |

*(Teachers can also announce, but only to their own students — the audience
picker is yours alone. Managers can read announcements but not send them.)*

Write a subject and message, then **Send announcement**.

![Announcement sent](screenshots/owner-19-announcement-sent.jpg)

The **Delivery** panel records how many people it reached, the audience, who sent
it and when. Note that "Everyone" means teachers and students — managers are
deliberately not included.

---

## 9. Messages

**Sidebar → Messages (07).** Private one-to-one conversations with a student.

The list shows each student and whether your last message was read. Click a
student to open the thread, type, and press **Send**.

![Message sent](screenshots/owner-21-message-sent.jpg)

The right-hand panel shows message count and the time of the last one. Managers
can never see these conversations.

---

## 10. Videos

**Sidebar → Videos (05).** Practice videos students upload and lesson videos you
share, filterable by **type** and **status**. Open one to comment on it.

---

## 11. Bookings

**Sidebar → Bookings (06).** Lesson scheduling and the availability calendar.

Because an owner has no teaching calendar of their own, the page starts by
asking **whose** calendar you are looking at:

![Bookings as owner](screenshots/owner-20-bookings-fixed.jpg)

Pick a name under **Teacher** and everything below it — open slots and the
availability grid — switches to that teacher. It defaults to your first
teacher, so you normally land on a working calendar without touching it. If you
have not invited a teacher yet, Arco says so rather than showing an empty grid.

*(Teachers do not see this picker. They only ever have one calendar — their
own — so Arco selects it for them.)*

### Availability

All times are **Eastern Time (America/New_York)**. View by **Week** or
**Month**, and move with the arrows or **Today**.

- **Click an empty area** to add a window. You can make it recurring ("Every
  Thursday") or a one-off for a single date.
- **Click an existing block** to edit or delete it.
- The legend marks blocks as **Recurring**, **Added** or **Blocked**.

![Adding availability](screenshots/owner-26-availability-dialog.jpg)

Saved windows appear on the grid straight away, and on that teacher's own
Bookings page when they log in.

![Availability saved](screenshots/owner-27-availability-saved.jpg)

> **Blocking never cancels.** Blocking a time only stops *new* bookings being
> made in it. A lesson already booked in that slot stays booked — cancel it
> from the bookings list if you need it gone.

### Booking a lesson for a student

Pick the day with **Previous day / Next day**, choose the **student**, then
click one of the open slot buttons. The lesson appears under *Your upcoming
bookings*, where it can be joined (once it is close enough) or cancelled.

## 12. Everyday bits

### Tasks

A private to-do list on your dashboard. **+ Add task** takes a title, an optional
student to attach it to, and an optional due date. **Mark done** clears it.

![Task created](screenshots/owner-25-task-created.jpg)

### Notifications

The bell above your name. Invitation acceptances, new submissions and similar
events land here. **Mark read** one at a time, or **Mark all read**.

![Notifications](screenshots/owner-22-notifications.jpg)

### Language and logging out

Click your name at the bottom of the sidebar. Arco speaks **English** and
**中文** — switching is instant. **Log out** is in the same menu.

![Profile menu](screenshots/owner-23-profile-menu-language.jpg)

---

## Your setup checklist

1. Create the studio and log in.
2. Set the name, logo and accent colour in **Organization**.
3. Invite your **teachers** first.
4. Invite your **students**.
5. **Assign every student to a teacher** — otherwise nobody can teach them.
6. Create **courses** and enrol students.
7. Upload shared handouts to the **Library**.
8. Send a welcome **announcement**.

![Dashboard in use](screenshots/owner-24-dashboard-populated.jpg)
