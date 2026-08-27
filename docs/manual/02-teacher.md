# Arco — Teacher Manual

*Role: **Teacher** (called "admin" internally). You teach your own students and
run your own schedule.*

> 中文版：[zh/02-teacher.md](zh/02-teacher.md)

Arco is built around one loop: set homework → the student hands it in → you give
feedback. Everything else supports that.

---

## 1. Getting in

Your studio owner sends you an invitation link. Open it, choose a name, email
and password, and press *Create account*.

![Accepting an invitation](screenshots/shared-01-accept-invite-register.jpg)

Then log in. Arco does not log you in automatically after signing up.

---

## 2. Your dashboard

![Teacher dashboard](screenshots/teacher-01-dashboard.jpg)

Four counters: **Videos to review**, **Unread messages**, **Homework due**,
**Sessions next 24h**. Below: **Tasks**, **Upcoming bookings**, **Active courses**.

Your sidebar has nine sections. Compared with the owner you have **Invitations**
but no **Organization** — studio branding is the owner's job.

> **Tasks are shared.** The task list is the *studio's*, not yours alone. A task
> the owner adds appears on your dashboard too. Use **+ Add task** for anything
> the studio needs doing, and **Mark done** when it is finished.

---

## 3. Your students

**Sidebar → Students (02).** You see **only your own students** — never another
teacher's.

![Your roster](screenshots/teacher-12-roster-two-students.jpg)

Click a student for their record, filed under four tabs: **Bookings, Courses,
Homework, Videos**.

![A student record](screenshots/teacher-02-student-detail.jpg)

> You cannot move a student to a different teacher — no "assign teacher" control
> appears for you. Reassignment is an ownership decision; ask your owner.

### Getting a student onto your roster

Two ways, and the difference matters:

| Who invites | What happens |
|---|---|
| **You** (Invitations → Invite) | They join **your** roster automatically. You are their teacher from the moment they accept. |
| **The owner** | They start with *no* teacher, and the owner has to assign them to you before you can see them at all. |

**Sidebar → Invitations (09)**, press **+ Invite**, optionally type a name, then
**Generate invitation link**.

![Inviting a student](screenshots/teacher-09-invite-student-only.jpg)

You get no role dropdown — a teacher can only ever invite students. Copy the
link and send it yourself; it is shown once and expires after 7 days.

---

## 4. Courses and homework

**Sidebar → Courses (03).** You see the courses you teach.

Open a course to find its **Curriculum** (the homework, in order) and its
**Enrolled students**. To enrol someone, press the person icon beside *Enrolled
students* and pick them.

### Setting homework

Press **+ New homework**.

![New homework](screenshots/teacher-03-new-homework-form.jpg)

| Field | Notes |
|---|---|
| **Title** | Required. What the student sees in their list. |
| **Instructions** | What the student should do. |
| **Reference link** | Optional — a recording, a score, a page to work from. |
| **Due date** | Optional. |
| **Attempts allowed** | Blank means unlimited. |

Then choose **what this homework accepts**. Tick everything the student may hand
in — they send them together in one submission.

![Submission types](screenshots/teacher-04-homework-accepts.jpg)

- **A written answer** — the student types their response.
- **File attachments** — a scan, a photo, a document, an audio or video file.
- **A camera recording** — the student records a take in the browser. For a
  music studio this is usually the one that matters.

![Filled in](screenshots/teacher-05-homework-filled.jpg)

### Draft, then publish

New homework is saved as a **Draft**. Arco is explicit about what that means:

> *This homework is still a draft, so nobody can hand anything in yet.*

![A draft](screenshots/teacher-06-homework-draft.jpg)

Nothing reaches your students until you press **Publish**. Use the draft state to
write the assignment over several sittings, or to prepare a term's work in
advance and release it week by week.

![Published](screenshots/teacher-07-homework-published.jpg)

Once published, the badge turns **Published**, students can submit, and the
button becomes **Return to draft** — publishing is reversible.

Submitted work collects under **Submitted work** on the same page, where you
open each attempt and give feedback.

---

## 5. Videos

**Sidebar → Videos (05).** Practice videos your students send you, and lesson
videos you share with them. Filter by **type** and **status**, then open one to
watch and comment.

To add one, press **+ Upload video**:

![Uploading a video](screenshots/teacher-10-video-upload-form.jpg)

- **Record with your camera** — records in the browser; it asks permission first.
- **Or choose a video file** — MP4, WebM or QuickTime, up to **2 GiB**.
- **Type** — **Class** (a lesson video) or **Practice**.
- **Student** — optional, if the video belongs to one person.

---

## 6. Messages

**Sidebar → Messages (07).** Private conversations with your students. The list
shows each student and whether anything is unread.

![A conversation](screenshots/teacher-11-message-thread.jpg)

> **A thread belongs to the student, not to you.** There is one conversation per
> student, and the owner shares it. A message the owner sent will appear in your
> thread with their name on it, and your replies are visible to them. Treat it
> as a studio conversation with that student rather than a private channel.

Managers can never see any of this.

---

## 7. Announcements

**Sidebar → Announcements (08).** One message to your whole roster at once — a
one-way notice, not a conversation.

Press **+ Announce**, write a subject and message, then **Send announcement**.

![An announcement](screenshots/teacher-08-announcement-sent.jpg)

You get **no audience picker**. Arco states plainly where it goes:

> *This goes to every student on your roster.*

Only the owner can choose to send to teachers or to the whole studio. The
**Delivery** panel afterwards records how many people it reached and when. Your
list shows only announcements you sent.

---

## 8. Your schedule — Bookings

**Sidebar → Bookings (06).** Two jobs: publish when you are free, and book
lessons into that time.

All times are **Eastern Time (America/New_York)**, and slots are shown in **two
timezones** so a student abroad reads the same row correctly.

### Publishing your availability

Under **Availability**, view by **Week** or **Month**.

- **Click an empty area** to add a window. Choose **Every &lt;weekday&gt;** for a
  recurring rule, or a single date for a one-off.
- **Click a block** to edit or delete it.
- The legend marks **Recurring**, **Added** and **Blocked** time.

> **Blocking never cancels.** Blocking time stops *new* bookings only. A lesson
> already booked in that time stays booked — cancel it from the list if you need
> it gone.

Your owner can also edit your availability on your behalf; the result is the
same calendar you see here.

### Booking a lesson

Move to the day with **Previous day / Next day**. Your open slots appear as
buttons:

![Open slots](screenshots/teacher-13-open-slots-dual-tz.jpg)

Choose the **student**, then click a slot.

![Booked](screenshots/teacher-14-booking-made.jpg)

The lesson moves to **Your upcoming bookings**, the slot disappears from the
open list, and a **Next booking** card highlights the soonest one. When it is
close enough to start, a **Join** link appears — the lesson is held as a video
call in the browser. The ✕ cancels a booking.

---

## 9. Library

**Sidebar → Library (04).** Shared handouts, sheet music and files for the whole
studio — everyone can read it, and you can add to it.

Create a category by typing a name under **New category** and pressing **+**.
Press **Upload** to add a file: documents, images, archives, audio or video, up
to **500 MB**, with a title and an optional description.

---

## 10. Everyday bits

- **Notifications** — the bell above your name: new submissions, accepted
  invitations and similar. **Mark read**, or **Mark all read**.
- **Language** — click your name at the bottom of the sidebar: **English** or
  **中文**, switching instantly.
- **Log out** — same menu.

---

## A typical first week

1. Accept your invitation and log in.
2. **Invitations** → invite your students (they land on your roster directly).
3. **Bookings** → click the grid to publish your weekly availability.
4. **Courses** → open your course, enrol your students.
5. **+ New homework** → write it, tick what it accepts, then **Publish**.
6. **Announcements** → tell your roster what to bring.
7. Watch the dashboard for *Videos to review* and *Unread messages*.
