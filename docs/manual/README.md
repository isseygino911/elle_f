# Arco — User Manuals

Four roles, four manuals. Find yourself in the table and read only your own.

> 中文版：[zh/README.md](zh/README.md)

| I am a… | My manual | What I can do |
|---|---|---|
| **Studio Owner** | [01-owner.md](01-owner.md) | Everything. Run the studio, manage teachers, students and settings. |
| **Teacher** | [02-teacher.md](02-teacher.md) | Teach my own students — homework, videos, messages, my schedule. |
| **Manager** | [03-manager.md](03-manager.md) | See how the studio is performing, as numbers only. |
| **Student** | [04-student.md](04-student.md) | Learn — watch, practise, hand work in, book lessons. |

---

## The role model in one page

Every person has exactly one role, and it decides what they see when they log in.

| | Owner | Teacher | Manager | Student |
|---|:---:|:---:|:---:|:---:|
| Sidebar sections | 10 | 9 | 2 | 6 |
| Studio settings & branding | ✅ | — | — | — |
| Invite people | all 3 roles | students only | — | — |
| See students | all | **own roster only** | ❌ never | ❌ never |
| Assign a student to a teacher | ✅ | — | — | — |
| Courses & homework | ✅ | ✅ | ❌ | enrolled only, published only |
| Videos | ✅ | own students | ❌ | own only |
| Messages | ✅ | own students | ❌ | own thread |
| Announcements | send, choose audience | send to own roster | **read metadata only** | receive |
| Bookings | pick a teacher's calendar | own calendar | ❌ | book from teacher's slots |
| Library | read + write | read + write | read | **read only** |
| Aggregate reporting | ✅ | — | ✅ | — |

### The one rule worth remembering

**A Manager is not a senior teacher.**

It's natural to assume Manager is the most powerful role. It isn't. A manager
sees *less* than a teacher, deliberately — lesson counts and workload totals,
but never a student's video, message or homework.

> A manager sees the **scoreboard**, not the **game**.

This is enforced by the server, not just hidden in the interface.

### Two things that surprise people

- **An owner-invited student has no teacher yet.** They land on nobody's roster
  and are invisible to every teacher until the owner assigns them. A
  *teacher*-invited student joins that teacher's roster automatically.
- **A message thread belongs to the student, not the sender.** There is one
  conversation per student, shared by their teacher and the owner. It is private
  from other students and from managers, but it is not private between staff.

---

## About these manuals

Written by walking the running application as each role in turn: signing up a
studio from scratch, inviting and registering every role, then using each
feature the way the person in that role would.

Screenshots are of the real interface and live in [`screenshots/`](screenshots/).

**Known environment limitation:** file uploads (library files, videos, homework
attachments) hand off directly to S3, which is not configured in a local
development environment. Those flows are documented from the form onward; the
final "file has landed" screenshots come from real usage, not local testing.
