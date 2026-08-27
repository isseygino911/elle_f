// GENERATED — do not edit by hand.
// Source: docs/manual/*.md and docs/manual/zh/*.md
// Rebuild: python3 docs/manual/build-content.py
//
// Block nodes, not HTML strings: ManualPage renders them with real
// components, so nothing here is injected as markup.

export const MANUAL_SECTIONS = [
  {
    "key": "overview",
    "en": "Overview",
    "zh": "总览"
  },
  {
    "key": "owner",
    "en": "Studio Owner",
    "zh": "机构所有者"
  },
  {
    "key": "teacher",
    "en": "Teacher",
    "zh": "教师"
  },
  {
    "key": "manager",
    "en": "Manager",
    "zh": "主管"
  },
  {
    "key": "student",
    "en": "Student",
    "zh": "学生"
  }
]

export const MANUAL_CONTENT = {
  "en": {
    "overview": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — User Manuals"
      },
      {
        "k": "p",
        "c": "Four roles, four manuals. Find yourself in the table and read only your own."
      },
      {
        "k": "table",
        "head": [
          "I am a…",
          "What I can do"
        ],
        "rows": [
          [
            [
              {
                "t": "Studio Owner",
                "b": true
              }
            ],
            "Everything. Run the studio, manage teachers, students and settings."
          ],
          [
            [
              {
                "t": "Teacher",
                "b": true
              }
            ],
            "Teach my own students — homework, videos, messages, my schedule."
          ],
          [
            [
              {
                "t": "Manager",
                "b": true
              }
            ],
            "See how the studio is performing, as numbers only."
          ],
          [
            [
              {
                "t": "Student",
                "b": true
              }
            ],
            "Learn — watch, practise, hand work in, book lessons."
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "The role model in one page"
      },
      {
        "k": "p",
        "c": "Every person has exactly one role, and it decides what they see when they log in."
      },
      {
        "k": "table",
        "head": [
          [],
          "Owner",
          "Teacher",
          "Manager",
          "Student"
        ],
        "rows": [
          [
            "Sidebar sections",
            "10",
            "9",
            "2",
            "6"
          ],
          [
            "Studio settings & branding",
            "✅",
            "—",
            "—",
            "—"
          ],
          [
            "Invite people",
            "all 3 roles",
            "students only",
            "—",
            "—"
          ],
          [
            "See students",
            "all",
            [
              {
                "t": "own roster only",
                "b": true
              }
            ],
            "❌ never",
            "❌ never"
          ],
          [
            "Assign a student to a teacher",
            "✅",
            "—",
            "—",
            "—"
          ],
          [
            "Courses & homework",
            "✅",
            "✅",
            "❌",
            "enrolled only, published only"
          ],
          [
            "Videos",
            "✅",
            "own students",
            "❌",
            "own only"
          ],
          [
            "Messages",
            "✅",
            "own students",
            "❌",
            "own thread"
          ],
          [
            "Announcements",
            "send, choose audience",
            "send to own roster",
            [
              {
                "t": "read metadata only",
                "b": true
              }
            ],
            "receive"
          ],
          [
            "Bookings",
            "pick a teacher's calendar",
            "own calendar",
            "❌",
            "book from teacher's slots"
          ],
          [
            "Library",
            "read + write",
            "read + write",
            "read",
            [
              {
                "t": "read only",
                "b": true
              }
            ]
          ],
          [
            "Aggregate reporting",
            "✅",
            "—",
            "✅",
            "—"
          ]
        ],
        "align": [
          "left",
          "center",
          "center",
          "center",
          "center"
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "The one rule worth remembering"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "A Manager is not a senior teacher.",
            "b": true
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "It's natural to assume Manager is the most powerful role. It isn't. A manager sees "
          },
          {
            "t": "less",
            "i": true
          },
          {
            "t": " than a teacher, deliberately — lesson counts and workload totals, but never a student's video, message or homework."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "A manager sees the "
              },
              {
                "t": "scoreboard",
                "b": true
              },
              {
                "t": ", not the "
              },
              {
                "t": "game",
                "b": true
              },
              {
                "t": "."
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "This is enforced by the server, not just hidden in the interface."
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Two things that surprise people"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "An owner-invited student has no teacher yet.",
              "b": true
            },
            {
              "t": " They land on nobody's roster and are invisible to every teacher until the owner assigns them. A "
            },
            {
              "t": "teacher",
              "i": true
            },
            {
              "t": "-invited student joins that teacher's roster automatically."
            }
          ],
          [
            {
              "t": "A message thread belongs to the student, not the sender.",
              "b": true
            },
            {
              "t": " There is one conversation per student, shared by their teacher and the owner. It is private from other students and from managers, but it is not private between staff."
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "About these manuals"
      },
      {
        "k": "p",
        "c": "Written by walking the running application as each role in turn: signing up a studio from scratch, inviting and registering every role, then using each feature the way the person in that role would."
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Screenshots are of the real interface and live in "
          },
          {
            "t": "`screenshots/`"
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Known environment limitation:",
            "b": true
          },
          {
            "t": " file uploads (library files, videos, homework attachments) hand off directly to S3, which is not configured in a local development environment. Those flows are documented from the form onward; the final \"file has landed\" screenshots come from real usage, not local testing."
          }
        ]
      }
    ],
    "owner": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — Studio Owner Manual"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Role: ",
            "i": true
          },
          {
            "t": "Owner",
            "i": true
          },
          {
            "t": ". You created the studio, so you can see and do everything in it.",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "This guide walks the whole setup in the order you will actually do it: create the studio, invite your people, put a teacher in front of each student, then run the day-to-day."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. Create your studio"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Go to "
          },
          {
            "t": "/register-organization",
            "b": true
          },
          {
            "t": ". One form creates both the studio and your own owner account."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/signup-01-create-org-empty.jpg",
        "cap": "Create your organization"
      },
      {
        "k": "table",
        "head": [
          "Field",
          "What to put"
        ],
        "rows": [
          [
            "Organization name",
            "Your studio's name. Everyone in the studio sees this in the sidebar."
          ],
          [
            "Your name",
            "Your own name."
          ],
          [
            "Email",
            "Becomes your login."
          ],
          [
            "Password",
            "At least 8 characters."
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/signup-02-create-org-filled.jpg",
        "cap": "Filled in"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "Create organization",
            "b": true
          },
          {
            "t": ". Arco confirms with "
          },
          {
            "t": "\"Account created. Please log in.\"",
            "i": true
          },
          {
            "t": " and drops you on the login screen — signing up does not log you in automatically."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/signup-03-login-account-created.jpg",
        "cap": "Account created"
      },
      {
        "k": "p",
        "c": "Log in with the email and password you just chose."
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Your studio is private"
      },
      {
        "k": "p",
        "c": "Everything you create — students, videos, messages, files — is visible only to people inside your studio. Other studios using Arco cannot see any of it."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. The dashboard"
      },
      {
        "k": "p",
        "c": "This is your home screen. A brand-new studio is empty, which is expected."
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-01-dashboard.jpg",
        "cap": "Owner dashboard"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Four counters run across the top: "
          },
          {
            "t": "Videos to review",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Unread messages",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Homework due",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Sessions next 24h",
            "b": true
          },
          {
            "t": ". Below them sit "
          },
          {
            "t": "Tasks",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Upcoming bookings",
            "b": true
          },
          {
            "t": " and "
          },
          {
            "t": "Active courses",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": "Your sidebar has ten sections, numbered 01–10. Only the owner sees all ten — Invitations and Organization are yours alone."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. Brand the studio — Organization"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Organization (10).",
            "b": true
          },
          {
            "t": " Owner-only."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-02-organization-top.jpg",
        "cap": "Organization settings"
      },
      {
        "k": "p",
        "c": "Three things to set:"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Organization name",
              "b": true
            },
            {
              "t": " — edit it and press "
            },
            {
              "t": "Save changes",
              "i": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Brand logo",
              "b": true
            },
            {
              "t": " — PNG, JPEG or WebP up to 2MB. Until you upload one, your studio name is the only brand mark, and the \"Show organization name next to the logo\" checkbox stays disabled."
            }
          ],
          [
            {
              "t": "Accent color",
              "b": true
            },
            {
              "t": " — twelve themes: Lime, Violet, Ocean, Coral, Amber, Forest, Rose, Cyan, Teal, Indigo, Plum, Slate."
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-03-organization-accent-colors.jpg",
        "cap": "Accent colors"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Click any swatch and it applies instantly for "
          },
          {
            "t": "everyone in the studio",
            "b": true
          },
          {
            "t": " — there is no separate save step, just a green "
          },
          {
            "t": "\"Accent color updated.\"",
            "i": true
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-04-accent-changed-ocean.jpg",
        "cap": "Ocean applied"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. Invite your people — Invitations"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Invitations (09).",
            "b": true
          },
          {
            "t": " Owner-only. This is the only way anyone else joins your studio."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-05-invite-form.jpg",
        "cap": "Invitations"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "+ Invite",
            "b": true
          },
          {
            "t": ", choose the role, optionally type the person's name so you can recognise the invitation later, then "
          },
          {
            "t": "Generate invitation link",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Which role to choose"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-06-invite-role-options.jpg",
        "cap": "Role options"
      },
      {
        "k": "table",
        "head": [
          "Role",
          "Arco's own description",
          "Use it for"
        ],
        "rows": [
          [
            [
              {
                "t": "Student",
                "b": true
              }
            ],
            [
              {
                "t": "\"Joins your roster. You become their teacher.\"",
                "i": true
              }
            ],
            "Anyone taking lessons."
          ],
          [
            [
              {
                "t": "Teacher (admin)",
                "b": true
              }
            ],
            [
              {
                "t": "\"A teacher with their own roster of students.\"",
                "i": true
              }
            ],
            "Staff who teach."
          ],
          [
            [
              {
                "t": "Manager",
                "b": true
              }
            ],
            [
              {
                "t": "\"Sees aggregate reporting only, never individual students.\"",
                "i": true
              }
            ],
            "Oversight, front desk, a parent trustee."
          ]
        ],
        "align": [
          "left",
          "left",
          "left"
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "A Manager is not a senior teacher.",
                "b": true
              },
              {
                "t": " They see totals and counts, never a student's video, message or homework. Think scoreboard, not game."
              }
            ]
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Sending the link"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-07-invitation-created-teacher.jpg",
        "cap": "Invitation created"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Arco does "
          },
          {
            "t": "not",
            "b": true
          },
          {
            "t": " email the invitation. It shows you a link and you send it yourself — email, WhatsApp, however you like."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "Copy it now.",
                "b": true
              },
              {
                "t": " The link is shown once and is never stored. If you lose it, your only option is to issue a fresh invitation."
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The left column tracks "
          },
          {
            "t": "Pending",
            "b": true
          },
          {
            "t": " and "
          },
          {
            "t": "Accepted",
            "b": true
          },
          {
            "t": " counts. Click any invitation to see its status, role, creation date and expiry."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-10-invitation-detail.jpg",
        "cap": "Invitation detail"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Invitations expire after 7 days.",
            "b": true
          },
          {
            "t": " An expired or unused invitation costs you nothing — just issue another one."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "What the invitee sees"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "Accepting an invitation"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "They open your link, fill in name, email and password, and press "
          },
          {
            "t": "Create account",
            "i": true
          },
          {
            "t": ". You get a notification when they accept."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. Put a teacher in front of every student"
      },
      {
        "k": "p",
        "c": "This step is easy to miss and it matters."
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Students (02)",
            "b": true
          },
          {
            "t": ", then click a student."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-11-student-detail-no-teacher.jpg",
        "cap": "Student with no teacher"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "A student invited by you starts with "
          },
          {
            "t": "no teacher",
            "b": true
          },
          {
            "t": ", and Arco warns you plainly:"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "This student is on no teacher's roster and is not visible to any teacher.",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "Until you fix this, no teacher can see or teach them."
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Pick a teacher from "
          },
          {
            "t": "Assigned teacher",
            "b": true
          },
          {
            "t": " — the number in brackets is how many students that teacher already has — then press "
          },
          {
            "t": "Save assignment",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": "The change is not saved until you press that button. Navigating away first silently discards it."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-12-student-assigned-teacher.jpg",
        "cap": "Teacher assigned"
      },
      {
        "k": "p",
        "c": "The warning disappears. Come back here whenever a student changes teacher, or when a teacher leaves — deleting a teacher leaves their students unassigned rather than deleting them."
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Each student's record also carries four tabs: "
          },
          {
            "t": "Bookings, Courses, Homework, Videos",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. Courses and homework"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Courses (03).",
            "b": true
          },
          {
            "t": " Filter by "
          },
          {
            "t": "All / Active / Archived",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "+ New course",
            "b": true
          },
          {
            "t": ":"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-13-new-course-form.jpg",
        "cap": "New course"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Course title",
              "b": true
            },
            {
              "t": " — required."
            }
          ],
          [
            {
              "t": "Teacher",
              "b": true
            },
            {
              "t": " — who will set homework for this course."
            }
          ],
          [
            {
              "t": "Description",
              "b": true
            },
            {
              "t": " — optional."
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-14-course-created.jpg",
        "cap": "Course created"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The course page has a "
          },
          {
            "t": "Curriculum",
            "b": true
          },
          {
            "t": " (its homework, in order) and an "
          },
          {
            "t": "Enrolled students",
            "b": true
          },
          {
            "t": " panel, plus "
          },
          {
            "t": "New homework",
            "i": true
          },
          {
            "t": ", "
          },
          {
            "t": "Add cover",
            "i": true
          },
          {
            "t": ", "
          },
          {
            "t": "Archive",
            "i": true
          },
          {
            "t": " and "
          },
          {
            "t": "Delete course",
            "i": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "To enrol someone, press the person icon beside "
          },
          {
            "t": "Enrolled students",
            "i": true
          },
          {
            "t": ", pick the student and press "
          },
          {
            "t": "Enroll",
            "b": true
          },
          {
            "t": ". They immediately see the course and its published homework."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-15-course-student-enrolled.jpg",
        "cap": "Student enrolled"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Archive",
            "b": true
          },
          {
            "t": " keeps a finished course and its history without cluttering the active list. "
          },
          {
            "t": "Delete",
            "b": true
          },
          {
            "t": " removes it permanently."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. Shared files — Library"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Library (04).",
            "b": true
          },
          {
            "t": " Everyone in the studio can read the library; only owners and teachers can add to it."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-16-library-empty.jpg",
        "cap": "Library"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Create a category by typing a name under "
          },
          {
            "t": "New category",
            "b": true
          },
          {
            "t": " and pressing "
          },
          {
            "t": "+",
            "b": true
          },
          {
            "t": ". Files with no category land in "
          },
          {
            "t": "Uncategorized",
            "i": true
          },
          {
            "t": ". The search box at the top searches every file."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "Upload",
            "b": true
          },
          {
            "t": " to add a file:"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-17-library-upload-form.jpg",
        "cap": "Upload form"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Documents, images, archives, audio or video, "
          },
          {
            "t": "up to 500 MB",
            "b": true
          },
          {
            "t": ". Give it a title (required), choose or create a category, and optionally describe it."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "8. Announcements"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Announcements (08).",
            "b": true
          },
          {
            "t": " One message to a whole group at once. Unlike Messages, this is one-way — nobody replies to it."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "+ Announce",
            "b": true
          },
          {
            "t": ". As owner you choose the audience:"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-18-announcement-audience.jpg",
        "cap": "Choose audience"
      },
      {
        "k": "table",
        "head": [
          "Send to",
          "Reaches"
        ],
        "rows": [
          [
            [
              {
                "t": "Students",
                "b": true
              }
            ],
            "Every student in the studio."
          ],
          [
            [
              {
                "t": "Teachers",
                "b": true
              }
            ],
            "Every teacher."
          ],
          [
            [
              {
                "t": "Everyone",
                "b": true
              }
            ],
            "Every teacher and every student."
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "(Teachers can also announce, but only to their own students — the audience picker is yours alone. Managers can read announcements but not send them.)",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Write a subject and message, then "
          },
          {
            "t": "Send announcement",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-19-announcement-sent.jpg",
        "cap": "Announcement sent"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The "
          },
          {
            "t": "Delivery",
            "b": true
          },
          {
            "t": " panel records how many people it reached, the audience, who sent it and when. Note that \"Everyone\" means teachers and students — managers are deliberately not included."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "9. Messages"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Messages (07).",
            "b": true
          },
          {
            "t": " Private one-to-one conversations with a student."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The list shows each student and whether your last message was read. Click a student to open the thread, type, and press "
          },
          {
            "t": "Send",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-21-message-sent.jpg",
        "cap": "Message sent"
      },
      {
        "k": "p",
        "c": "The right-hand panel shows message count and the time of the last one. Managers can never see these conversations."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "10. Videos"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Videos (05).",
            "b": true
          },
          {
            "t": " Practice videos students upload and lesson videos you share, filterable by "
          },
          {
            "t": "type",
            "b": true
          },
          {
            "t": " and "
          },
          {
            "t": "status",
            "b": true
          },
          {
            "t": ". Open one to comment on it."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "11. Bookings"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Bookings (06).",
            "b": true
          },
          {
            "t": " Lesson scheduling and the availability calendar."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Because an owner has no teaching calendar of their own, the page starts by asking "
          },
          {
            "t": "whose",
            "b": true
          },
          {
            "t": " calendar you are looking at:"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-20-bookings-fixed.jpg",
        "cap": "Bookings as owner"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Pick a name under "
          },
          {
            "t": "Teacher",
            "b": true
          },
          {
            "t": " and everything below it — open slots and the availability grid — switches to that teacher. It defaults to your first teacher, so you normally land on a working calendar without touching it. If you have not invited a teacher yet, Arco says so rather than showing an empty grid."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "(Teachers do not see this picker. They only ever have one calendar — their own — so Arco selects it for them.)",
            "i": true
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Availability"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "All times are "
          },
          {
            "t": "Eastern Time (America/New_York)",
            "b": true
          },
          {
            "t": ". View by "
          },
          {
            "t": "Week",
            "b": true
          },
          {
            "t": " or "
          },
          {
            "t": "Month",
            "b": true
          },
          {
            "t": ", and move with the arrows or "
          },
          {
            "t": "Today",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Click an empty area",
              "b": true
            },
            {
              "t": " to add a window. You can make it recurring (\"Every Thursday\") or a one-off for a single date."
            }
          ],
          [
            {
              "t": "Click an existing block",
              "b": true
            },
            {
              "t": " to edit or delete it."
            }
          ],
          [
            {
              "t": "The legend marks blocks as "
            },
            {
              "t": "Recurring",
              "b": true
            },
            {
              "t": ", "
            },
            {
              "t": "Added",
              "b": true
            },
            {
              "t": " or "
            },
            {
              "t": "Blocked",
              "b": true
            },
            {
              "t": "."
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-26-availability-dialog.jpg",
        "cap": "Adding availability"
      },
      {
        "k": "p",
        "c": "Saved windows appear on the grid straight away, and on that teacher's own Bookings page when they log in."
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-27-availability-saved.jpg",
        "cap": "Availability saved"
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "Blocking never cancels.",
                "b": true
              },
              {
                "t": " Blocking a time only stops "
              },
              {
                "t": "new",
                "i": true
              },
              {
                "t": " bookings being made in it. A lesson already booked in that slot stays booked — cancel it from the bookings list if you need it gone."
              }
            ]
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Booking a lesson for a student"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Pick the day with "
          },
          {
            "t": "Previous day / Next day",
            "b": true
          },
          {
            "t": ", choose the "
          },
          {
            "t": "student",
            "b": true
          },
          {
            "t": ", then click one of the open slot buttons. The lesson appears under "
          },
          {
            "t": "Your upcoming bookings",
            "i": true
          },
          {
            "t": ", where it can be joined (once it is close enough) or cancelled."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "12. Everyday bits"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Tasks"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "A private to-do list on your dashboard. "
          },
          {
            "t": "+ Add task",
            "b": true
          },
          {
            "t": " takes a title, an optional student to attach it to, and an optional due date. "
          },
          {
            "t": "Mark done",
            "b": true
          },
          {
            "t": " clears it."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-25-task-created.jpg",
        "cap": "Task created"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Notifications"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The bell above your name. Invitation acceptances, new submissions and similar events land here. "
          },
          {
            "t": "Mark read",
            "b": true
          },
          {
            "t": " one at a time, or "
          },
          {
            "t": "Mark all read",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-22-notifications.jpg",
        "cap": "Notifications"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Language and logging out"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Click your name at the bottom of the sidebar. Arco speaks "
          },
          {
            "t": "English",
            "b": true
          },
          {
            "t": " and "
          },
          {
            "t": "中文",
            "b": true
          },
          {
            "t": " — switching is instant. "
          },
          {
            "t": "Log out",
            "b": true
          },
          {
            "t": " is in the same menu."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-23-profile-menu-language.jpg",
        "cap": "Profile menu"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "Your setup checklist"
      },
      {
        "k": "ol",
        "items": [
          "Create the studio and log in.",
          [
            {
              "t": "Set the name, logo and accent colour in "
            },
            {
              "t": "Organization",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Invite your "
            },
            {
              "t": "teachers",
              "b": true
            },
            {
              "t": " first."
            }
          ],
          [
            {
              "t": "Invite your "
            },
            {
              "t": "students",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Assign every student to a teacher",
              "b": true
            },
            {
              "t": " — otherwise nobody can teach them."
            }
          ],
          [
            {
              "t": "Create "
            },
            {
              "t": "courses",
              "b": true
            },
            {
              "t": " and enrol students."
            }
          ],
          [
            {
              "t": "Upload shared handouts to the "
            },
            {
              "t": "Library",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Send a welcome "
            },
            {
              "t": "announcement",
              "b": true
            },
            {
              "t": "."
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-24-dashboard-populated.jpg",
        "cap": "Dashboard in use"
      }
    ],
    "teacher": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — Teacher Manual"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Role: ",
            "i": true
          },
          {
            "t": "Teacher",
            "i": true
          },
          {
            "t": " (called \"admin\" internally). You teach your own students and run your own schedule.",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "Arco is built around one loop: set homework → the student hands it in → you give feedback. Everything else supports that."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. Getting in"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Your studio owner sends you an invitation link. Open it, choose a name, email and password, and press "
          },
          {
            "t": "Create account",
            "i": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "Accepting an invitation"
      },
      {
        "k": "p",
        "c": "Then log in. Arco does not log you in automatically after signing up."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. Your dashboard"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-01-dashboard.jpg",
        "cap": "Teacher dashboard"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Four counters: "
          },
          {
            "t": "Videos to review",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Unread messages",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Homework due",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Sessions next 24h",
            "b": true
          },
          {
            "t": ". Below: "
          },
          {
            "t": "Tasks",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Upcoming bookings",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Active courses",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Your sidebar has nine sections. Compared with the owner you have "
          },
          {
            "t": "Invitations",
            "b": true
          },
          {
            "t": " but no "
          },
          {
            "t": "Organization",
            "b": true
          },
          {
            "t": " — studio branding is the owner's job."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "Tasks are shared.",
                "b": true
              },
              {
                "t": " The task list is the "
              },
              {
                "t": "studio's",
                "i": true
              },
              {
                "t": ", not yours alone. A task the owner adds appears on your dashboard too. Use "
              },
              {
                "t": "+ Add task",
                "b": true
              },
              {
                "t": " for anything the studio needs doing, and "
              },
              {
                "t": "Mark done",
                "b": true
              },
              {
                "t": " when it is finished."
              }
            ]
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. Your students"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Students (02).",
            "b": true
          },
          {
            "t": " You see "
          },
          {
            "t": "only your own students",
            "b": true
          },
          {
            "t": " — never another teacher's."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-12-roster-two-students.jpg",
        "cap": "Your roster"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Click a student for their record, filed under four tabs: "
          },
          {
            "t": "Bookings, Courses, Homework, Videos",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-02-student-detail.jpg",
        "cap": "A student record"
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": "You cannot move a student to a different teacher — no \"assign teacher\" control appears for you. Reassignment is an ownership decision; ask your owner."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Getting a student onto your roster"
      },
      {
        "k": "p",
        "c": "Two ways, and the difference matters:"
      },
      {
        "k": "table",
        "head": [
          "Who invites",
          "What happens"
        ],
        "rows": [
          [
            [
              {
                "t": "You",
                "b": true
              },
              {
                "t": " (Invitations → Invite)"
              }
            ],
            [
              {
                "t": "They join "
              },
              {
                "t": "your",
                "b": true
              },
              {
                "t": " roster automatically. You are their teacher from the moment they accept."
              }
            ]
          ],
          [
            [
              {
                "t": "The owner",
                "b": true
              }
            ],
            [
              {
                "t": "They start with "
              },
              {
                "t": "no",
                "i": true
              },
              {
                "t": " teacher, and the owner has to assign them to you before you can see them at all."
              }
            ]
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Invitations (09)",
            "b": true
          },
          {
            "t": ", press "
          },
          {
            "t": "+ Invite",
            "b": true
          },
          {
            "t": ", optionally type a name, then "
          },
          {
            "t": "Generate invitation link",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-09-invite-student-only.jpg",
        "cap": "Inviting a student"
      },
      {
        "k": "p",
        "c": "You get no role dropdown — a teacher can only ever invite students. Copy the link and send it yourself; it is shown once and expires after 7 days."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. Courses and homework"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Courses (03).",
            "b": true
          },
          {
            "t": " You see the courses you teach."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Open a course to find its "
          },
          {
            "t": "Curriculum",
            "b": true
          },
          {
            "t": " (the homework, in order) and its "
          },
          {
            "t": "Enrolled students",
            "b": true
          },
          {
            "t": ". To enrol someone, press the person icon beside "
          },
          {
            "t": "Enrolled students",
            "i": true
          },
          {
            "t": " and pick them."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Setting homework"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "+ New homework",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-03-new-homework-form.jpg",
        "cap": "New homework"
      },
      {
        "k": "table",
        "head": [
          "Field",
          "Notes"
        ],
        "rows": [
          [
            [
              {
                "t": "Title",
                "b": true
              }
            ],
            "Required. What the student sees in their list."
          ],
          [
            [
              {
                "t": "Instructions",
                "b": true
              }
            ],
            "What the student should do."
          ],
          [
            [
              {
                "t": "Reference link",
                "b": true
              }
            ],
            "Optional — a recording, a score, a page to work from."
          ],
          [
            [
              {
                "t": "Due date",
                "b": true
              }
            ],
            "Optional."
          ],
          [
            [
              {
                "t": "Attempts allowed",
                "b": true
              }
            ],
            "Blank means unlimited."
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Then choose "
          },
          {
            "t": "what this homework accepts",
            "b": true
          },
          {
            "t": ". Tick everything the student may hand in — they send them together in one submission."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-04-homework-accepts.jpg",
        "cap": "Submission types"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "A written answer",
              "b": true
            },
            {
              "t": " — the student types their response."
            }
          ],
          [
            {
              "t": "File attachments",
              "b": true
            },
            {
              "t": " — a scan, a photo, a document, an audio or video file."
            }
          ],
          [
            {
              "t": "A camera recording",
              "b": true
            },
            {
              "t": " — the student records a take in the browser. For a music studio this is usually the one that matters."
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-05-homework-filled.jpg",
        "cap": "Filled in"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Draft, then publish"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "New homework is saved as a "
          },
          {
            "t": "Draft",
            "b": true
          },
          {
            "t": ". Arco is explicit about what that means:"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "This homework is still a draft, so nobody can hand anything in yet.",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-06-homework-draft.jpg",
        "cap": "A draft"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Nothing reaches your students until you press "
          },
          {
            "t": "Publish",
            "b": true
          },
          {
            "t": ". Use the draft state to write the assignment over several sittings, or to prepare a term's work in advance and release it week by week."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-07-homework-published.jpg",
        "cap": "Published"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Once published, the badge turns "
          },
          {
            "t": "Published",
            "b": true
          },
          {
            "t": ", students can submit, and the button becomes "
          },
          {
            "t": "Return to draft",
            "b": true
          },
          {
            "t": " — publishing is reversible."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Submitted work collects under "
          },
          {
            "t": "Submitted work",
            "b": true
          },
          {
            "t": " on the same page, where you open each attempt and give feedback."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. Videos"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Videos (05).",
            "b": true
          },
          {
            "t": " Practice videos your students send you, and lesson videos you share with them. Filter by "
          },
          {
            "t": "type",
            "b": true
          },
          {
            "t": " and "
          },
          {
            "t": "status",
            "b": true
          },
          {
            "t": ", then open one to watch and comment."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "To add one, press "
          },
          {
            "t": "+ Upload video",
            "b": true
          },
          {
            "t": ":"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-10-video-upload-form.jpg",
        "cap": "Uploading a video"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Record with your camera",
              "b": true
            },
            {
              "t": " — records in the browser; it asks permission first."
            }
          ],
          [
            {
              "t": "Or choose a video file",
              "b": true
            },
            {
              "t": " — MP4, WebM or QuickTime, up to "
            },
            {
              "t": "2 GiB",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Type",
              "b": true
            },
            {
              "t": " — "
            },
            {
              "t": "Class",
              "b": true
            },
            {
              "t": " (a lesson video) or "
            },
            {
              "t": "Practice",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Student",
              "b": true
            },
            {
              "t": " — optional, if the video belongs to one person."
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. Messages"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Messages (07).",
            "b": true
          },
          {
            "t": " Private conversations with your students. The list shows each student and whether anything is unread."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-11-message-thread.jpg",
        "cap": "A conversation"
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "A thread belongs to the student, not to you.",
                "b": true
              },
              {
                "t": " There is one conversation per student, and the owner shares it. A message the owner sent will appear in your thread with their name on it, and your replies are visible to them. Treat it as a studio conversation with that student rather than a private channel."
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "Managers can never see any of this."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. Announcements"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Announcements (08).",
            "b": true
          },
          {
            "t": " One message to your whole roster at once — a one-way notice, not a conversation."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Press "
          },
          {
            "t": "+ Announce",
            "b": true
          },
          {
            "t": ", write a subject and message, then "
          },
          {
            "t": "Send announcement",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-08-announcement-sent.jpg",
        "cap": "An announcement"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "You get "
          },
          {
            "t": "no audience picker",
            "b": true
          },
          {
            "t": ". Arco states plainly where it goes:"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "This goes to every student on your roster.",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Only the owner can choose to send to teachers or to the whole studio. The "
          },
          {
            "t": "Delivery",
            "b": true
          },
          {
            "t": " panel afterwards records how many people it reached and when. Your list shows only announcements you sent."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "8. Your schedule — Bookings"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Bookings (06).",
            "b": true
          },
          {
            "t": " Two jobs: publish when you are free, and book lessons into that time."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "All times are "
          },
          {
            "t": "Eastern Time (America/New_York)",
            "b": true
          },
          {
            "t": ", and slots are shown in "
          },
          {
            "t": "two timezones",
            "b": true
          },
          {
            "t": " so a student abroad reads the same row correctly."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Publishing your availability"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Under "
          },
          {
            "t": "Availability",
            "b": true
          },
          {
            "t": ", view by "
          },
          {
            "t": "Week",
            "b": true
          },
          {
            "t": " or "
          },
          {
            "t": "Month",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Click an empty area",
              "b": true
            },
            {
              "t": " to add a window. Choose "
            },
            {
              "t": "Every &lt;weekday&gt;",
              "b": true
            },
            {
              "t": " for a recurring rule, or a single date for a one-off."
            }
          ],
          [
            {
              "t": "Click a block",
              "b": true
            },
            {
              "t": " to edit or delete it."
            }
          ],
          [
            {
              "t": "The legend marks "
            },
            {
              "t": "Recurring",
              "b": true
            },
            {
              "t": ", "
            },
            {
              "t": "Added",
              "b": true
            },
            {
              "t": " and "
            },
            {
              "t": "Blocked",
              "b": true
            },
            {
              "t": " time."
            }
          ]
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "Blocking never cancels.",
                "b": true
              },
              {
                "t": " Blocking time stops "
              },
              {
                "t": "new",
                "i": true
              },
              {
                "t": " bookings only. A lesson already booked in that time stays booked — cancel it from the list if you need it gone."
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "Your owner can also edit your availability on your behalf; the result is the same calendar you see here."
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Booking a lesson"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Move to the day with "
          },
          {
            "t": "Previous day / Next day",
            "b": true
          },
          {
            "t": ". Your open slots appear as buttons:"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-13-open-slots-dual-tz.jpg",
        "cap": "Open slots"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Choose the "
          },
          {
            "t": "student",
            "b": true
          },
          {
            "t": ", then click a slot."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-14-booking-made.jpg",
        "cap": "Booked"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The lesson moves to "
          },
          {
            "t": "Your upcoming bookings",
            "b": true
          },
          {
            "t": ", the slot disappears from the open list, and a "
          },
          {
            "t": "Next booking",
            "b": true
          },
          {
            "t": " card highlights the soonest one. When it is close enough to start, a "
          },
          {
            "t": "Join",
            "b": true
          },
          {
            "t": " link appears — the lesson is held as a video call in the browser. The ✕ cancels a booking."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "9. Library"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Library (04).",
            "b": true
          },
          {
            "t": " Shared handouts, sheet music and files for the whole studio — everyone can read it, and you can add to it."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Create a category by typing a name under "
          },
          {
            "t": "New category",
            "b": true
          },
          {
            "t": " and pressing "
          },
          {
            "t": "+",
            "b": true
          },
          {
            "t": ". Press "
          },
          {
            "t": "Upload",
            "b": true
          },
          {
            "t": " to add a file: documents, images, archives, audio or video, up to "
          },
          {
            "t": "500 MB",
            "b": true
          },
          {
            "t": ", with a title and an optional description."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "10. Everyday bits"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Notifications",
              "b": true
            },
            {
              "t": " — the bell above your name: new submissions, accepted invitations and similar. "
            },
            {
              "t": "Mark read",
              "b": true
            },
            {
              "t": ", or "
            },
            {
              "t": "Mark all read",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Language",
              "b": true
            },
            {
              "t": " — click your name at the bottom of the sidebar: "
            },
            {
              "t": "English",
              "b": true
            },
            {
              "t": " or "
            },
            {
              "t": "中文",
              "b": true
            },
            {
              "t": ", switching instantly."
            }
          ],
          [
            {
              "t": "Log out",
              "b": true
            },
            {
              "t": " — same menu."
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "A typical first week"
      },
      {
        "k": "ol",
        "items": [
          "Accept your invitation and log in.",
          [
            {
              "t": "Invitations",
              "b": true
            },
            {
              "t": " → invite your students (they land on your roster directly)."
            }
          ],
          [
            {
              "t": "Bookings",
              "b": true
            },
            {
              "t": " → click the grid to publish your weekly availability."
            }
          ],
          [
            {
              "t": "Courses",
              "b": true
            },
            {
              "t": " → open your course, enrol your students."
            }
          ],
          [
            {
              "t": "+ New homework",
              "b": true
            },
            {
              "t": " → write it, tick what it accepts, then "
            },
            {
              "t": "Publish",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Announcements",
              "b": true
            },
            {
              "t": " → tell your roster what to bring."
            }
          ],
          [
            {
              "t": "Watch the dashboard for "
            },
            {
              "t": "Videos to review",
              "i": true
            },
            {
              "t": " and "
            },
            {
              "t": "Unread messages",
              "i": true
            },
            {
              "t": "."
            }
          ]
        ]
      }
    ],
    "manager": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — Manager Manual"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Role: ",
            "i": true
          },
          {
            "t": "Manager",
            "i": true
          },
          {
            "t": ". You see how the studio is performing, as numbers.",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "This is a short manual, and that is the point. Your role has one screen that matters and a deliberately narrow view of everything else."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. The one rule worth reading first"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "A Manager is not a senior teacher.",
            "b": true
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "It is natural to assume Manager is the most powerful role — it usually is in other software. In Arco it is not. A manager sees "
          },
          {
            "t": "less",
            "i": true
          },
          {
            "t": " than a teacher, on purpose."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "You can see how many lessons happened, how many students are active, and how each teacher's workload is tracking. You can "
          },
          {
            "t": "never",
            "b": true
          },
          {
            "t": " open a student's video, read a message, or see the text of somebody's homework."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "Think of it as: a manager sees the "
              },
              {
                "t": "scoreboard",
                "b": true
              },
              {
                "t": ", not the "
              },
              {
                "t": "game",
                "b": true
              },
              {
                "t": "."
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "This is not a matter of screens being hidden from you. The restriction is enforced by the server: even if you typed the address of a student's page directly, the data would not be sent."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. Getting in"
      },
      {
        "k": "p",
        "c": "Your studio owner sends you an invitation link — only an owner can create a manager. Open it, set a name, email and password, then log in."
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "Accepting an invitation"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. Your dashboard"
      },
      {
        "k": "p",
        "c": "This is your main screen, and very nearly your only one."
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-01-dashboard.jpg",
        "cap": "Manager dashboard"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "The four counters"
      },
      {
        "k": "table",
        "head": [
          "Counter",
          "What it counts"
        ],
        "rows": [
          [
            [
              {
                "t": "Teachers",
                "b": true
              }
            ],
            "Teachers in the studio."
          ],
          [
            [
              {
                "t": "Students",
                "b": true
              }
            ],
            "Students across every teacher."
          ],
          [
            [
              {
                "t": "Upcoming sessions",
                "b": true
              }
            ],
            "Lessons booked and still to happen."
          ],
          [
            [
              {
                "t": "Videos to review",
                "b": true
              }
            ],
            "Student videos waiting for a teacher's feedback."
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Videos to review",
            "i": true
          },
          {
            "t": " is the one to watch. A number that climbs week on week means work is arriving faster than teachers are getting through it."
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Task progress"
      },
      {
        "k": "p",
        "c": "The studio's shared to-do list as a percentage — how many tasks are done out of the total, and how many are still open. You see the progress bar, not the individual tasks."
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "By teacher"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "One row per teacher: "
          },
          {
            "t": "Students",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Upcoming",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Completed",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Videos to review",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Unread",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": "This is your workload view. It answers \"is anyone overloaded, and is anyone falling behind on feedback?\" without exposing a single student's work."
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "Note what this table contains: teacher names and counts. "
              },
              {
                "t": "No student names appear anywhere on your dashboard",
                "b": true
              },
              {
                "t": " — not in the table, not behind it, not in the underlying data your browser receives."
              }
            ]
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. Announcements"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Announcements (02).",
            "b": true
          },
          {
            "t": " Your only other section."
          }
        ]
      },
      {
        "k": "p",
        "c": "You see every announcement sent in the studio — by the owner and by every teacher — with who sent it, which audience, and how many people it reached."
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-03-announcement-redacted.jpg",
        "cap": "An announcement as a manager"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "What you do "
          },
          {
            "t": "not",
            "b": true
          },
          {
            "t": " see is the message itself. Where the text would be, Arco says:"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "You can see that an announcement was sent and how far it reached. The message itself stays between the sender and their students.",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The "
          },
          {
            "t": "Delivery",
            "b": true
          },
          {
            "t": " panel still gives you the useful part: recipient count, audience, sender and timestamp."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "You cannot send announcements. There is no "
          },
          {
            "t": "Announce",
            "i": true
          },
          {
            "t": " button for a manager — that belongs to owners and teachers."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. Notifications"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "The bell above your name carries studio events at the same level of detail — for example "
          },
          {
            "t": "\"Broadcast sent to 1 student\"",
            "i": true
          },
          {
            "t": ", with the subject line and sender, never the contents."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-04-notifications.jpg",
        "cap": "Notifications"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Mark read",
            "b": true
          },
          {
            "t": " clears one; "
          },
          {
            "t": "Mark all read",
            "b": true
          },
          {
            "t": " clears everything."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. What you cannot reach"
      },
      {
        "k": "p",
        "c": "If you follow a link or type an address for a section outside your role, Arco tells you plainly rather than showing a broken page:"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-02-no-access.jpg",
        "cap": "No access"
      },
      {
        "k": "table",
        "head": [
          "Section",
          "Manager access"
        ],
        "rows": [
          [
            "Dashboard",
            "✅ Aggregate figures only"
          ],
          [
            "Announcements",
            "✅ Metadata and delivery counts, never the message text"
          ],
          [
            "Notifications",
            "✅ Event and counts"
          ],
          [
            "Library",
            "✅ Shared studio files (see below)"
          ],
          [
            "Students",
            "❌ No access"
          ],
          [
            "Courses & homework",
            "❌ No access"
          ],
          [
            "Videos",
            "❌ No access"
          ],
          [
            "Messages",
            "❌ No access"
          ],
          [
            "Bookings",
            "❌ No access"
          ],
          [
            "Invitations",
            "❌ No access"
          ],
          [
            "Organization settings",
            "❌ Owner only"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "The one exception: the Library"
      },
      {
        "k": "p",
        "c": "The shared Library — handouts, sheet music, studio files — is readable by everyone in the studio, managers included. It is not in your sidebar, but it is not blocked either."
      },
      {
        "k": "p",
        "c": "This is a deliberate distinction, not an oversight. The Library holds material the studio publishes to everybody; it never holds a particular student's work. A student's own submissions, videos and messages remain closed to you."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. Everyday bits"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Language",
              "b": true
            },
            {
              "t": " — click your name at the bottom of the sidebar to switch between "
            },
            {
              "t": "English",
              "b": true
            },
            {
              "t": " and "
            },
            {
              "t": "中文",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Log out",
              "b": true
            },
            {
              "t": " — same menu."
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "What to look at, and when"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Weekly:",
              "b": true
            },
            {
              "t": " "
            },
            {
              "t": "Videos to review",
              "i": true
            },
            {
              "t": " per teacher. A rising number is the earliest sign feedback is slipping."
            }
          ],
          [
            {
              "t": "Weekly:",
              "b": true
            },
            {
              "t": " "
            },
            {
              "t": "Unread",
              "i": true
            },
            {
              "t": " per teacher — messages from students going unanswered."
            }
          ],
          [
            {
              "t": "Monthly:",
              "b": true
            },
            {
              "t": " "
            },
            {
              "t": "Students",
              "i": true
            },
            {
              "t": " per teacher, for workload balance across the studio."
            }
          ],
          [
            {
              "t": "Ongoing:",
              "b": true
            },
            {
              "t": " "
            },
            {
              "t": "Task progress",
              "i": true
            },
            {
              "t": ", for whether studio admin is actually getting done."
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": "If a number prompts a question about a specific student, that conversation goes to the owner or the teacher. By design, you cannot answer it from here."
      }
    ],
    "student": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — Student Manual"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Role: ",
            "i": true
          },
          {
            "t": "Student",
            "i": true
          },
          {
            "t": ". You're here to learn: watch, practise, hand work in, and book lessons.",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "Everything you see in Arco is your own. You cannot see other students, and they cannot see you — even if you share a teacher."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. Getting in"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Your teacher or the studio owner sends you an invitation link. Open it, choose a name, email and password, and press "
          },
          {
            "t": "Create account",
            "i": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "Accepting an invitation"
      },
      {
        "k": "p",
        "c": "Then log in — signing up does not log you in automatically."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. Your dashboard"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-01-dashboard.jpg",
        "cap": "Student dashboard"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Three counters across the top: "
          },
          {
            "t": "Homework due",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Sessions next 24h",
            "b": true
          },
          {
            "t": ", and "
          },
          {
            "t": "Unread messages",
            "b": true
          },
          {
            "t": ". The homework counter tells you the window too — "
          },
          {
            "t": "\"due · 14 days\"",
            "i": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Your "
          },
          {
            "t": "Next session",
            "b": true
          },
          {
            "t": " sits in the green band, with the date and time shown in "
          },
          {
            "t": "two timezones",
            "b": true
          },
          {
            "t": " so there's no confusion if you and your teacher are in different countries. There's a "
          },
          {
            "t": "Cancel",
            "b": true
          },
          {
            "t": " button right there if you can't make it."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Below that: "
          },
          {
            "t": "Homework due",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Upcoming bookings",
            "b": true
          },
          {
            "t": ", "
          },
          {
            "t": "Tasks",
            "b": true
          },
          {
            "t": ", and "
          },
          {
            "t": "Awaiting review",
            "b": true
          },
          {
            "t": " (practice videos your teacher hasn't commented on yet)."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "The "
              },
              {
                "t": "Upcoming bookings",
                "b": true
              },
              {
                "t": " panel lists your "
              },
              {
                "t": "later",
                "i": true
              },
              {
                "t": " lessons. Your very next one is already the green band at the top, so with only one lesson booked this panel correctly reads \"No upcoming bookings\". It isn't a mistake."
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "Your sidebar has six sections."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. Your courses and homework"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Courses (02).",
            "b": true
          },
          {
            "t": " The courses you are enrolled in. Your teacher enrols you — you can't join one yourself."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-02-course-curriculum.jpg",
        "cap": "Your courses"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Open a course to see its "
          },
          {
            "t": "Curriculum",
            "b": true
          },
          {
            "t": " — the homework in order, numbered, each with its due date."
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "You only see homework your teacher has "
              },
              {
                "t": "published",
                "b": true
              },
              {
                "t": ". Anything still being drafted is invisible to you until they release it."
              }
            ]
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "Handing work in"
      },
      {
        "k": "p",
        "c": "Click a piece of homework."
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-03-homework-detail.jpg",
        "cap": "A piece of homework"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "At the top: the instructions, an "
          },
          {
            "t": "Open reference",
            "b": true
          },
          {
            "t": " link if your teacher attached one (a recording, a score, a page to work from), the due date, and how many attempts you're allowed."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Under "
          },
          {
            "t": "Your work",
            "b": true
          },
          {
            "t": ", you'll see only the ways your teacher chose to accept:"
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Your answer",
              "b": true
            },
            {
              "t": " — type your response."
            }
          ],
          [
            {
              "t": "Attach files",
              "b": true
            },
            {
              "t": " — a scan, a photo, a document, an audio or video file. You can attach more than one."
            }
          ],
          [
            {
              "t": "Record a take",
              "b": true
            },
            {
              "t": " — record straight from your camera in the browser, if your teacher enabled it."
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Fill in what applies and press "
          },
          {
            "t": "Hand in",
            "b": true
          },
          {
            "t": ". You can use several at once — they go together as one submission."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-04-submitted.jpg",
        "cap": "Handed in"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Afterwards you'll see "
          },
          {
            "t": "Attempt 1 · Submitted",
            "b": true
          },
          {
            "t": " with the date. Two useful things then happen:"
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "You can "
            },
            {
              "t": "edit your answer",
              "b": true
            },
            {
              "t": " and press "
            },
            {
              "t": "Save changes",
              "i": true
            },
            {
              "t": " — handy for a typo or an afterthought."
            }
          ],
          [
            {
              "t": "If you have attempts left, a fresh form appears below for another go. The header tells you the limit ("
            },
            {
              "t": "\"Attempts allowed: 3\"",
              "i": true
            },
            {
              "t": ")."
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": "Your teacher's feedback appears on this same page once they've reviewed it."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. Practice videos"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Videos (04).",
            "b": true
          },
          {
            "t": " The videos you've sent your teacher, and lesson videos they've shared with you. "
          },
          {
            "t": "Awaiting review",
            "i": true
          },
          {
            "t": " on your dashboard counts the ones your teacher hasn't commented on yet."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "To add one, press "
          },
          {
            "t": "+ Upload video",
            "b": true
          },
          {
            "t": ":"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-06-video-upload.jpg",
        "cap": "Uploading a practice video"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Record with your camera",
              "b": true
            },
            {
              "t": " — records in the browser; it will ask permission."
            }
          ],
          [
            {
              "t": "Or choose a video file",
              "b": true
            },
            {
              "t": " — MP4, WebM or QuickTime, up to "
            },
            {
              "t": "2 GiB",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Give it a "
            },
            {
              "t": "title",
              "b": true
            },
            {
              "t": "."
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Your video is always filed as "
          },
          {
            "t": "practice, uploaded as yourself",
            "b": true
          },
          {
            "t": " — there's nothing to choose. Only you and your teacher can see it."
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. Lessons"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Bookings (05).",
            "b": true
          },
          {
            "t": " Your lessons, and your teacher's free slots."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-01-dashboard.jpg",
        "cap": "Your bookings"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Your upcoming bookings",
              "b": true
            },
            {
              "t": " on the left, each marked "
            },
            {
              "t": "Scheduled",
              "i": true
            },
            {
              "t": ", with "
            },
            {
              "t": "✕",
              "b": true
            },
            {
              "t": " to cancel."
            }
          ],
          [
            {
              "t": "Available slots",
              "b": true
            },
            {
              "t": " on the right. Move between days with "
            },
            {
              "t": "Previous day",
              "b": true
            },
            {
              "t": " and "
            },
            {
              "t": "Next day",
              "b": true
            },
            {
              "t": ", then click a time to book it."
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Times always appear in "
          },
          {
            "t": "both timezones",
            "b": true
          },
          {
            "t": " (for example "
          },
          {
            "t": "8:00 AM ET / 8:00 PM China",
            "i": true
          },
          {
            "t": ") — read whichever is yours."
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "When a lesson is close enough to start, a "
          },
          {
            "t": "Join",
            "b": true
          },
          {
            "t": " link appears. The lesson happens as a video call in your browser; there's nothing to install."
          }
        ]
      },
      {
        "k": "p",
        "c": "You don't set availability — those slots come from your teacher's calendar."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. Messages"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Messages (06).",
            "b": true
          },
          {
            "t": " One private conversation with your studio. It opens straight into the thread — there's no list to pick from, because you have only one."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-05-messages.jpg",
        "cap": "Your messages"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Each message is labelled with who sent it. Both your "
          },
          {
            "t": "teacher",
            "b": true
          },
          {
            "t": " and the "
          },
          {
            "t": "studio owner",
            "b": true
          },
          {
            "t": " can write here, and both can read your replies — so treat it as talking to the studio rather than to one person. Type at the bottom and press "
          },
          {
            "t": "Send",
            "b": true
          },
          {
            "t": "."
          }
        ]
      },
      {
        "k": "p",
        "c": "Managers can never read these messages."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. Library"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Sidebar → Library (03).",
            "b": true
          },
          {
            "t": " Shared handouts, sheet music and files the studio has published for everyone."
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-07-library-readonly.jpg",
        "cap": "The library"
      },
      {
        "k": "p",
        "c": "Browse by category or use the search box. You can read and download anything here, but only teachers and owners can add files."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "8. Everyday bits"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "Notifications",
              "b": true
            },
            {
              "t": " — the bell above your name: new homework, feedback, announcements. "
            },
            {
              "t": "Mark read",
              "b": true
            },
            {
              "t": ", or "
            },
            {
              "t": "Mark all read",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Language",
              "b": true
            },
            {
              "t": " — click your name at the bottom of the sidebar: "
            },
            {
              "t": "English",
              "b": true
            },
            {
              "t": " or "
            },
            {
              "t": "中文",
              "b": true
            },
            {
              "t": "."
            }
          ],
          [
            {
              "t": "Log out",
              "b": true
            },
            {
              "t": " — same menu."
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "What's private, and what isn't"
      },
      {
        "k": "p",
        "c": "Worth knowing exactly where you stand:"
      },
      {
        "k": "table",
        "head": [
          "Thing",
          "Who can see it"
        ],
        "rows": [
          [
            "Your homework submissions",
            "You and your teacher"
          ],
          [
            "Your practice videos",
            "You and your teacher"
          ],
          [
            "Your messages",
            "You, your teacher, and the studio owner"
          ],
          [
            "Your bookings",
            "You and your teacher"
          ],
          [
            [
              {
                "t": "Other students",
                "b": true
              }
            ],
            [
              {
                "t": "Not visible to you — and you're not visible to them",
                "b": true
              }
            ]
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": "Even a student who shares your teacher cannot see your work, your videos, your messages, or that you exist. Managers see totals for the studio, never your work."
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "Your typical week"
      },
      {
        "k": "ol",
        "items": [
          "Check the dashboard — homework due, next lesson.",
          [
            {
              "t": "Courses",
              "b": true
            },
            {
              "t": " → open this week's homework, read the instructions."
            }
          ],
          [
            {
              "t": "Practise, then "
            },
            {
              "t": "Hand in",
              "b": true
            },
            {
              "t": " — written notes, a file, or a recorded take."
            }
          ],
          [
            {
              "t": "Videos",
              "b": true
            },
            {
              "t": " → send a practice video if your teacher asked for one."
            }
          ],
          [
            {
              "t": "Bookings",
              "b": true
            },
            {
              "t": " → book next week's lesson from your teacher's free slots."
            }
          ],
          [
            {
              "t": "Messages",
              "b": true
            },
            {
              "t": " → ask anything you got stuck on."
            }
          ]
        ]
      }
    ]
  },
  "zh": {
    "overview": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — 使用手册"
      },
      {
        "k": "p",
        "c": "四种身份，四本手册。在下表中找到自己，只读属于你的那一本。"
      },
      {
        "k": "table",
        "head": [
          "我的身份",
          "我可以做什么"
        ],
        "rows": [
          [
            [
              {
                "t": "机构所有者",
                "b": true
              }
            ],
            "全部权限。管理机构、教师、学生与设置。"
          ],
          [
            [
              {
                "t": "教师",
                "b": true
              }
            ],
            "教自己的学生——作业、视频、消息、我的日程。"
          ],
          [
            [
              {
                "t": "主管",
                "b": true
              }
            ],
            "查看机构运营情况，仅限汇总数据。"
          ],
          [
            [
              {
                "t": "学生",
                "b": true
              }
            ],
            "学习——观看、练习、交作业、预约课程。"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "一页看懂身份模型"
      },
      {
        "k": "p",
        "c": "每个人只有一种身份，登录后看到什么完全由它决定。"
      },
      {
        "k": "table",
        "head": [
          [],
          "所有者",
          "教师",
          "主管",
          "学生"
        ],
        "rows": [
          [
            "侧边栏板块数",
            "10",
            "9",
            "2",
            "6"
          ],
          [
            "机构设置与品牌",
            "✅",
            "—",
            "—",
            "—"
          ],
          [
            "邀请成员",
            "全部 3 种身份",
            "仅学生",
            "—",
            "—"
          ],
          [
            "查看学生",
            "全部",
            [
              {
                "t": "仅自己名下",
                "b": true
              }
            ],
            "❌ 永不",
            "❌ 永不"
          ],
          [
            "为学生指定教师",
            "✅",
            "—",
            "—",
            "—"
          ],
          [
            "课程与作业",
            "✅",
            "✅",
            "❌",
            "仅已选课、已发布"
          ],
          [
            "视频",
            "✅",
            "自己的学生",
            "❌",
            "仅自己"
          ],
          [
            "消息",
            "✅",
            "自己的学生",
            "❌",
            "自己的对话"
          ],
          [
            "公告",
            "发送并选择对象",
            "发给自己的学生",
            [
              {
                "t": "仅可见元信息",
                "b": true
              }
            ],
            "接收"
          ],
          [
            "预约",
            "选择某位老师的日程",
            "自己的日程",
            "❌",
            "从老师的时段中预约"
          ],
          [
            "资料库",
            "读 + 写",
            "读 + 写",
            "只读",
            [
              {
                "t": "只读",
                "b": true
              }
            ]
          ],
          [
            "汇总报表",
            "✅",
            "—",
            "✅",
            "—"
          ]
        ],
        "align": [
          "left",
          "center",
          "center",
          "center",
          "center"
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "唯一需要牢记的一条规则"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "主管不是\"高级教师\"。",
            "b": true
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "人们往往以为主管是权限最大的身份。并非如此。主管看到的"
          },
          {
            "t": "比教师更少",
            "b": true
          },
          {
            "t": "，这是刻意设计的——他看得到课时数量与工作量总计，但永远看不到某个学生的视频、消息或作业。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "主管看到的是"
              },
              {
                "t": "记分牌",
                "b": true
              },
              {
                "t": "，不是"
              },
              {
                "t": "比赛本身",
                "b": true
              },
              {
                "t": "。"
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "这由服务端强制执行，而不只是在界面上隐藏。"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "两个容易让人意外的行为"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "由所有者邀请的学生尚未分配教师。",
              "b": true
            },
            {
              "t": " 他不在任何教师的名下，对所有教师都不可见，直到所有者为他指定教师。而由"
            },
            {
              "t": "教师",
              "b": true
            },
            {
              "t": "邀请的学生会自动加入该教师名下。"
            }
          ],
          [
            {
              "t": "消息对话属于学生，而不属于发送者。",
              "b": true
            },
            {
              "t": " 每位学生只有一个对话，由其教师与所有者共享。它对其他学生和主管保密，但在员工之间并不保密。"
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "关于这套手册"
      },
      {
        "k": "p",
        "c": "编写方式：以每种身份实际操作运行中的系统——从零注册一个机构，邀请并注册每种身份的成员，然后以该身份的视角逐一使用每项功能。"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "截图均来自真实界面，存放在 "
          },
          {
            "t": "`../screenshots/`"
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "已知的环境限制：",
            "b": true
          },
          {
            "t": " 文件上传（资料库文件、视频、作业附件）会直接交给 S3 处理，而本地开发环境并未配置 S3。这些流程仅记录到表单提交为止。"
          }
        ]
      }
    ],
    "owner": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — 机构所有者手册"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "身份：",
            "i": true
          },
          {
            "t": "所有者",
            "i": true
          },
          {
            "t": "。机构由你创建，因此你可以看到并操作其中的一切。",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "本手册按你实际会执行的顺序，走完整个搭建流程：创建机构、邀请成员、为每位学生配一位教师，然后开始日常运营。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. 创建你的机构"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "访问 "
          },
          {
            "t": "/register-organization",
            "b": true
          },
          {
            "t": "。一张表单同时创建机构和你自己的所有者账号。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/signup-01-create-org-empty.jpg",
        "cap": "创建机构"
      },
      {
        "k": "table",
        "head": [
          "字段",
          "填什么"
        ],
        "rows": [
          [
            "机构名称",
            "你的机构名。机构内所有成员都会在侧边栏看到它。"
          ],
          [
            "你的姓名",
            "你本人的名字。"
          ],
          [
            "邮箱",
            "将作为你的登录账号。"
          ],
          [
            "密码",
            "至少 8 个字符。"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/signup-02-create-org-filled.jpg",
        "cap": "填写完成"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击 "
          },
          {
            "t": "Create organization",
            "b": true
          },
          {
            "t": "。Arco 会提示 "
          },
          {
            "t": "\"Account created. Please log in.\"",
            "i": true
          },
          {
            "t": "，并跳转到登录页——注册后不会自动登录。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/signup-03-login-account-created.jpg",
        "cap": "账号已创建"
      },
      {
        "k": "p",
        "c": "使用刚才填写的邮箱和密码登录。"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "你的机构是独立的"
      },
      {
        "k": "p",
        "c": "你创建的一切——学生、视频、消息、文件——只对机构内的成员可见。使用 Arco 的其他机构看不到其中任何内容。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. 仪表盘"
      },
      {
        "k": "p",
        "c": "这是你的主页。新建的机构是空的，属于正常现象。"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-01-dashboard.jpg",
        "cap": "所有者仪表盘"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "顶部有四个计数："
          },
          {
            "t": "待审阅视频",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未读消息",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "待交作业",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未来 24 小时课程",
            "b": true
          },
          {
            "t": "。下方是"
          },
          {
            "t": "任务",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "即将开始的预约",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "进行中的课程",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏共有十个板块，编号 01–10。只有所有者能看到全部十个——"
          },
          {
            "t": "邀请",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "机构",
            "b": true
          },
          {
            "t": "是你专属的。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. 设置品牌 — 机构"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 机构（10）。",
            "b": true
          },
          {
            "t": " 仅所有者可见。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-02-organization-top.jpg",
        "cap": "机构设置"
      },
      {
        "k": "p",
        "c": "需要设置三项："
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "机构名称",
              "b": true
            },
            {
              "t": " — 修改后点击"
            },
            {
              "t": "保存修改",
              "i": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "品牌标志",
              "b": true
            },
            {
              "t": " — 支持 PNG、JPEG 或 WebP，最大 2MB。在上传标志之前，机构名称是唯一的品牌标识，\"在标志旁显示机构名称\"复选框会保持禁用。"
            }
          ],
          [
            {
              "t": "主题色",
              "b": true
            },
            {
              "t": " — 共十二种：青柠绿、紫罗兰、海洋蓝、珊瑚红、琥珀橙、森林绿、玫瑰粉、青碧蓝、鸭绿、靛蓝、梅子紫、石板灰。"
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-03-organization-accent-colors.jpg",
        "cap": "主题色"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击任意色块即刻对"
          },
          {
            "t": "机构内所有成员",
            "b": true
          },
          {
            "t": "生效——没有单独的保存步骤，只会显示绿色提示"
          },
          {
            "t": "\"主题色已更新。\"",
            "i": true
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-04-accent-changed-ocean.jpg",
        "cap": "已切换为海洋蓝"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. 邀请成员 — 邀请"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 邀请（09）。",
            "b": true
          },
          {
            "t": " 仅所有者可见。这是其他人加入你机构的唯一途径。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-05-invite-form.jpg",
        "cap": "邀请"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击 "
          },
          {
            "t": "+ Invite",
            "b": true
          },
          {
            "t": "，选择身份，可以填写对方姓名以便日后辨认，然后点击"
          },
          {
            "t": "生成邀请链接",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "该选哪种身份"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-06-invite-role-options.jpg",
        "cap": "身份选项"
      },
      {
        "k": "table",
        "head": [
          "身份",
          "Arco 的原文说明",
          "适用于"
        ],
        "rows": [
          [
            [
              {
                "t": "学生",
                "b": true
              }
            ],
            [
              {
                "t": "\"加入您的学生名单，您将成为其教师。\"",
                "i": true
              }
            ],
            "所有上课的人。"
          ],
          [
            [
              {
                "t": "教师（管理员）",
                "b": true
              }
            ],
            [
              {
                "t": "\"拥有自己学生名单的教师。\"",
                "i": true
              }
            ],
            "授课的员工。"
          ],
          [
            [
              {
                "t": "主管",
                "b": true
              }
            ],
            [
              {
                "t": "\"仅查看汇总报表，不能查看个别学生。\"",
                "i": true
              }
            ],
            "监督岗位、前台、家长代表。"
          ]
        ],
        "align": [
          "left",
          "left",
          "left"
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "主管不是\"高级教师\"。",
                "b": true
              },
              {
                "t": " 他们只看得到总数与统计，永远看不到某个学生的视频、消息或作业。记分牌，而非比赛。"
              }
            ]
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "发送链接"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-07-invitation-created-teacher.jpg",
        "cap": "邀请已创建"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "Arco "
          },
          {
            "t": "不会",
            "b": true
          },
          {
            "t": "代发邀请邮件。它只显示一个链接，需要你自己发出去——邮件、微信，随你选择。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "请立即复制。",
                "b": true
              },
              {
                "t": " 该链接只显示一次，系统不会保存。如果丢失，唯一的办法是重新生成一条邀请。"
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "左栏会统计"
          },
          {
            "t": "待接受",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "已接受",
            "b": true
          },
          {
            "t": "的数量。点击任意一条邀请，可查看其状态、身份、创建时间和过期时间。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-10-invitation-detail.jpg",
        "cap": "邀请详情"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "邀请 7 天后过期。",
            "b": true
          },
          {
            "t": " 过期或未使用的邀请不会造成任何影响——重新发一条即可。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "受邀者看到的界面"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "接受邀请"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "他们打开你的链接，填写姓名、邮箱和密码，点击"
          },
          {
            "t": "Create account",
            "i": true
          },
          {
            "t": "。对方接受后你会收到通知。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. 为每位学生配一位教师"
      },
      {
        "k": "p",
        "c": "这一步很容易被忽略，但非常重要。"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 学生（02）",
            "b": true
          },
          {
            "t": "，然后点击某位学生。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-11-student-detail-no-teacher.jpg",
        "cap": "尚未指定教师的学生"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "由你邀请的学生初始状态是"
          },
          {
            "t": "没有教师",
            "b": true
          },
          {
            "t": "的，Arco 会明确警告："
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "该学生尚未分配给任何教师，教师无法看到该学生。",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "在你处理之前，没有任何教师能看到或教这位学生。"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在"
          },
          {
            "t": "指定教师",
            "b": true
          },
          {
            "t": "中选一位老师——括号里的数字是该教师当前的学生人数——然后点击"
          },
          {
            "t": "保存指派",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": "不点击该按钮，修改不会保存。中途离开页面会静默丢弃修改。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-12-student-assigned-teacher.jpg",
        "cap": "已指定教师"
      },
      {
        "k": "p",
        "c": "警告随即消失。学生更换教师时，或某位教师离职时，都请回到这里处理——删除一位教师只会让其学生变为未指派，而不会删除这些学生。"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "每位学生的档案还包含四个标签页："
          },
          {
            "t": "预约课程、课程、作业、视频",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. 课程与作业"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 课程（03）。",
            "b": true
          },
          {
            "t": " 可按"
          },
          {
            "t": "全部 / 进行中 / 已归档",
            "b": true
          },
          {
            "t": "筛选。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击 "
          },
          {
            "t": "+ 新建课程",
            "b": true
          },
          {
            "t": "："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-13-new-course-form.jpg",
        "cap": "新建课程"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "课程名称",
              "b": true
            },
            {
              "t": " — 必填。"
            }
          ],
          [
            {
              "t": "授课老师",
              "b": true
            },
            {
              "t": " — 负责为这门课程布置作业的老师。"
            }
          ],
          [
            {
              "t": "课程简介",
              "b": true
            },
            {
              "t": " — 选填。"
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-14-course-created.jpg",
        "cap": "课程已创建"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "课程页面包含"
          },
          {
            "t": "课程内容",
            "b": true
          },
          {
            "t": "（按顺序排列的作业）和"
          },
          {
            "t": "已选课学生",
            "b": true
          },
          {
            "t": "面板，以及"
          },
          {
            "t": "新建作业",
            "i": true
          },
          {
            "t": "、"
          },
          {
            "t": "添加封面",
            "i": true
          },
          {
            "t": "、"
          },
          {
            "t": "归档",
            "i": true
          },
          {
            "t": "和"
          },
          {
            "t": "删除课程",
            "i": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "要添加学生，点击"
          },
          {
            "t": "已选课学生",
            "i": true
          },
          {
            "t": "旁的人形图标，选择学生后点击"
          },
          {
            "t": "加入课程",
            "b": true
          },
          {
            "t": "。他会立即看到这门课程及其已发布的作业。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-15-course-student-enrolled.jpg",
        "cap": "学生已加入课程"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "归档",
            "b": true
          },
          {
            "t": "可以保留已结束课程及其历史记录，同时不占用进行中列表。"
          },
          {
            "t": "删除",
            "b": true
          },
          {
            "t": "则会永久移除。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. 共享文件 — 资料库"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 资料库（04）。",
            "b": true
          },
          {
            "t": " 机构内所有人都可以阅读资料库，但只有所有者和教师可以添加内容。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-16-library-empty.jpg",
        "cap": "资料库"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在"
          },
          {
            "t": "新建分类",
            "b": true
          },
          {
            "t": "下输入名称并点击 "
          },
          {
            "t": "+",
            "b": true
          },
          {
            "t": " 即可创建分类。未归类的文件会进入"
          },
          {
            "t": "未分类",
            "i": true
          },
          {
            "t": "。顶部的搜索框可搜索全部文件。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击"
          },
          {
            "t": "上传",
            "b": true
          },
          {
            "t": "添加文件："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-17-library-upload-form.jpg",
        "cap": "上传表单"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "支持文档、图片、压缩包、音频或视频，"
          },
          {
            "t": "最大 500 MB",
            "b": true
          },
          {
            "t": "。填写标题（必填），选择或新建分类，也可以补充描述。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "8. 公告"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 公告（08）。",
            "b": true
          },
          {
            "t": " 一次性向一整组人发送消息。与\"消息\"不同，公告是单向的——没有人可以回复。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击 "
          },
          {
            "t": "+ 发布",
            "b": true
          },
          {
            "t": "。作为所有者，你可以选择接收对象："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-18-announcement-audience.jpg",
        "cap": "选择接收对象"
      },
      {
        "k": "table",
        "head": [
          "发送给",
          "覆盖范围"
        ],
        "rows": [
          [
            [
              {
                "t": "学生",
                "b": true
              }
            ],
            "机构内的所有学生。"
          ],
          [
            [
              {
                "t": "老师",
                "b": true
              }
            ],
            "机构内的所有老师。"
          ],
          [
            [
              {
                "t": "所有人",
                "b": true
              }
            ],
            "机构内的所有老师和学生。"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "（教师也可以发公告，但只能发给自己名下的学生——接收对象选择器是你专属的。主管可以看到公告，但不能发送。）",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "填写标题和正文，然后点击"
          },
          {
            "t": "发送公告",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-19-announcement-sent.jpg",
        "cap": "公告已发送"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "送达情况",
            "b": true
          },
          {
            "t": "面板会记录覆盖人数、接收对象、发送人和发送时间。请注意，\"所有人\"指的是老师和学生——主管被有意排除在外。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "9. 消息"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 消息（07）。",
            "b": true
          },
          {
            "t": " 与学生的一对一私密对话。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "列表会显示每位学生，以及你最后一条消息是否已读。点击某位学生打开对话，输入内容后点击"
          },
          {
            "t": "发送",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-21-message-sent.jpg",
        "cap": "消息已发送"
      },
      {
        "k": "p",
        "c": "右侧面板显示消息数量和最后一条消息的时间。主管永远看不到这些对话。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "10. 视频"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 视频（05）。",
            "b": true
          },
          {
            "t": " 学生上传的练习视频，以及你分享的课程视频，可按"
          },
          {
            "t": "类型",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "状态",
            "b": true
          },
          {
            "t": "筛选。打开任意一个即可评论。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "11. 预约"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 预约（06）。",
            "b": true
          },
          {
            "t": " 课程排期与可预约时间日历。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "由于所有者本人没有独立的授课日程，页面会先询问你要查看"
          },
          {
            "t": "谁的",
            "b": true
          },
          {
            "t": "日程："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-20-bookings-fixed.jpg",
        "cap": "所有者视角的预约页"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在"
          },
          {
            "t": "老师",
            "b": true
          },
          {
            "t": "下选择一个名字，下方的一切——可预约时段和空闲时间表格——都会切换到那位老师。默认选中你的第一位老师，因此通常无需操作就能进入一个可用的日程。如果你还没有邀请任何老师，Arco 会明确提示，而不是显示一张空表格。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "（教师看不到这个选择器。他们永远只有一个日程——自己的——Arco 会自动选中。）",
            "i": true
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "可预约时间"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "所有时间均为"
          },
          {
            "t": "美国东部时间（America/New_York）",
            "b": true
          },
          {
            "t": "。可按"
          },
          {
            "t": "周",
            "b": true
          },
          {
            "t": "或"
          },
          {
            "t": "月",
            "b": true
          },
          {
            "t": "查看，用箭头或"
          },
          {
            "t": "今天",
            "b": true
          },
          {
            "t": "切换。"
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "点击空白区域",
              "b": true
            },
            {
              "t": "添加一个时间段。可以设为循环（\"每周四\"），也可以只针对某一天。"
            }
          ],
          [
            {
              "t": "点击已有的色块",
              "b": true
            },
            {
              "t": "可以编辑或删除。"
            }
          ],
          [
            {
              "t": "图例区分"
            },
            {
              "t": "循环",
              "b": true
            },
            {
              "t": "、"
            },
            {
              "t": "新增",
              "b": true
            },
            {
              "t": "和"
            },
            {
              "t": "已屏蔽",
              "b": true
            },
            {
              "t": "。"
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-26-availability-dialog.jpg",
        "cap": "添加可预约时间"
      },
      {
        "k": "p",
        "c": "保存后的时间段会立即出现在表格中，那位老师登录后也会在自己的预约页看到。"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-27-availability-saved.jpg",
        "cap": "可预约时间已保存"
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "屏蔽不会取消已有预约。",
                "b": true
              },
              {
                "t": " 屏蔽某段时间只会阻止"
              },
              {
                "t": "新的",
                "i": true
              },
              {
                "t": "预约。已经预约在该时段的课程仍然有效——如果确实需要取消，请在预约列表中操作。"
              }
            ]
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "为学生预约课程"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "用"
          },
          {
            "t": "前一天 / 后一天",
            "b": true
          },
          {
            "t": "切换日期，选择"
          },
          {
            "t": "学生",
            "b": true
          },
          {
            "t": "，然后点击某个空闲时段按钮。课程会出现在"
          },
          {
            "t": "即将开始的预约",
            "i": true
          },
          {
            "t": "中，可以在临近开始时加入，也可以取消。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "12. 日常功能"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "任务"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "仪表盘上的待办清单。"
          },
          {
            "t": "添加任务",
            "b": true
          },
          {
            "t": "需要填写标题，可选择关联的学生和截止日期。"
          },
          {
            "t": "标为完成",
            "b": true
          },
          {
            "t": "即可清除。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-25-task-created.jpg",
        "cap": "任务已创建"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "通知"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "姓名上方的铃铛图标。邀请被接受、新的作业提交等事件都会汇集在这里。可以逐条"
          },
          {
            "t": "标为已读",
            "b": true
          },
          {
            "t": "，也可以"
          },
          {
            "t": "全部标为已读",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-22-notifications.jpg",
        "cap": "通知"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "语言与退出登录"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击侧边栏底部的姓名。Arco 支持"
          },
          {
            "t": "English",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "中文",
            "b": true
          },
          {
            "t": "，切换即时生效。"
          },
          {
            "t": "退出登录",
            "b": true
          },
          {
            "t": "也在同一菜单中。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-23-profile-menu-language.jpg",
        "cap": "个人菜单"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "你的搭建清单"
      },
      {
        "k": "ol",
        "items": [
          "创建机构并登录。",
          [
            {
              "t": "在"
            },
            {
              "t": "机构",
              "b": true
            },
            {
              "t": "中设置名称、标志和主题色。"
            }
          ],
          [
            {
              "t": "先邀请你的"
            },
            {
              "t": "教师",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "再邀请你的"
            },
            {
              "t": "学生",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "为每位学生指定教师",
              "b": true
            },
            {
              "t": "——否则没有人能教他们。"
            }
          ],
          [
            {
              "t": "创建"
            },
            {
              "t": "课程",
              "b": true
            },
            {
              "t": "并添加学生。"
            }
          ],
          [
            {
              "t": "把共享讲义上传到"
            },
            {
              "t": "资料库",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "发送一条欢迎"
            },
            {
              "t": "公告",
              "b": true
            },
            {
              "t": "。"
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/owner-24-dashboard-populated.jpg",
        "cap": "运营中的仪表盘"
      }
    ],
    "teacher": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — 教师手册"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "身份：",
            "i": true
          },
          {
            "t": "教师",
            "i": true
          },
          {
            "t": "（系统内部称为 \"admin\"）。你负责教自己的学生，并管理自己的日程。",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "Arco 围绕一个循环构建：布置作业 → 学生提交 → 你给出评语。其余一切都在支撑这个循环。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. 登录"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "机构所有者会发给你一个邀请链接。打开它，填写姓名、邮箱和密码，点击"
          },
          {
            "t": "Create account",
            "i": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "接受邀请"
      },
      {
        "k": "p",
        "c": "然后登录。注册后 Arco 不会自动登录。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. 你的仪表盘"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-01-dashboard.jpg",
        "cap": "教师仪表盘"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "四个计数："
          },
          {
            "t": "待审阅视频",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未读消息",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "待交作业",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未来 24 小时课程",
            "b": true
          },
          {
            "t": "。下方是"
          },
          {
            "t": "任务",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "即将开始的预约",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "进行中的课程",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏共九个板块。与所有者相比，你有"
          },
          {
            "t": "邀请",
            "b": true
          },
          {
            "t": "但没有"
          },
          {
            "t": "机构",
            "b": true
          },
          {
            "t": "——机构品牌设置是所有者的职责。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "任务是共享的。",
                "b": true
              },
              {
                "t": " 任务列表属于"
              },
              {
                "t": "整个机构",
                "i": true
              },
              {
                "t": "，而不只属于你。所有者添加的任务同样会出现在你的仪表盘上。机构需要处理的任何事情都可以用"
              },
              {
                "t": "添加任务",
                "b": true
              },
              {
                "t": "记录，完成后点击"
              },
              {
                "t": "标为完成",
                "b": true
              },
              {
                "t": "。"
              }
            ]
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. 你的学生"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 学生（02）。",
            "b": true
          },
          {
            "t": " 你"
          },
          {
            "t": "只能看到自己名下的学生",
            "b": true
          },
          {
            "t": "——永远看不到其他教师的学生。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-12-roster-two-students.jpg",
        "cap": "你的学生名单"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击某位学生查看档案，分为四个标签页："
          },
          {
            "t": "预约课程、课程、作业、视频",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": "你无法把学生转给其他教师——你的界面上不会出现\"指定教师\"控件。转派属于所有者的决策，请联系你的所有者。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "让学生进入你的名单"
      },
      {
        "k": "p",
        "c": "有两种方式，区别很重要："
      },
      {
        "k": "table",
        "head": [
          "由谁邀请",
          "结果"
        ],
        "rows": [
          [
            [
              {
                "t": "你",
                "b": true
              },
              {
                "t": "（邀请 → Invite）"
              }
            ],
            [
              {
                "t": "学生"
              },
              {
                "t": "自动",
                "b": true
              },
              {
                "t": "加入你的名单。他接受邀请的那一刻起，你就是他的教师。"
              }
            ]
          ],
          [
            [
              {
                "t": "所有者",
                "b": true
              }
            ],
            [
              {
                "t": "学生初始状态"
              },
              {
                "t": "没有",
                "i": true
              },
              {
                "t": "教师，所有者必须先把他指派给你，你才能看到他。"
              }
            ]
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 邀请（09）",
            "b": true
          },
          {
            "t": "，点击 "
          },
          {
            "t": "+ Invite",
            "b": true
          },
          {
            "t": "，可填写姓名，然后点击"
          },
          {
            "t": "生成邀请链接",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-09-invite-student-only.jpg",
        "cap": "邀请学生"
      },
      {
        "k": "p",
        "c": "你没有身份下拉框——教师只能邀请学生。复制链接后自行发送；链接只显示一次，7 天后过期。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. 课程与作业"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 课程（03）。",
            "b": true
          },
          {
            "t": " 你会看到自己教授的课程。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "打开一门课程可以看到"
          },
          {
            "t": "课程内容",
            "b": true
          },
          {
            "t": "（按顺序排列的作业）和"
          },
          {
            "t": "已选课学生",
            "b": true
          },
          {
            "t": "。要添加学生，点击"
          },
          {
            "t": "已选课学生",
            "i": true
          },
          {
            "t": "旁的人形图标并选择。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "布置作业"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击 "
          },
          {
            "t": "+ 新建作业",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-03-new-homework-form.jpg",
        "cap": "新建作业"
      },
      {
        "k": "table",
        "head": [
          "字段",
          "说明"
        ],
        "rows": [
          [
            [
              {
                "t": "作业标题",
                "b": true
              }
            ],
            "必填。学生在列表中看到的名称。"
          ],
          [
            [
              {
                "t": "作业说明",
                "b": true
              }
            ],
            "学生需要完成的内容。"
          ],
          [
            [
              {
                "t": "参考链接",
                "b": true
              }
            ],
            "选填——示范录音、乐谱或参考页面。"
          ],
          [
            [
              {
                "t": "截止日期",
                "b": true
              }
            ],
            "选填。"
          ],
          [
            [
              {
                "t": "可提交次数",
                "b": true
              }
            ],
            "留空表示不限次数。"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "然后选择"
          },
          {
            "t": "这份作业接受的形式",
            "b": true
          },
          {
            "t": "。勾选学生可以提交的所有形式，他们可以在一次提交中同时交上。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-04-homework-accepts.jpg",
        "cap": "提交形式"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "文字作答",
              "b": true
            },
            {
              "t": " — 学生直接输入回答。"
            }
          ],
          [
            {
              "t": "附件",
              "b": true
            },
            {
              "t": " — 扫描件、照片、文档，或音频、视频文件。"
            }
          ],
          [
            {
              "t": "摄像头录制",
              "b": true
            },
            {
              "t": " — 学生在浏览器中录制一段影像。对音乐机构来说，这通常是最关键的一项。"
            }
          ]
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-05-homework-filled.jpg",
        "cap": "填写完成"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "先存草稿，再发布"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "新建的作业会保存为"
          },
          {
            "t": "草稿",
            "b": true
          },
          {
            "t": "，Arco 会明确说明这意味着什么："
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "这份作业仍是草稿，学生暂时无法提交。",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-06-homework-draft.jpg",
        "cap": "草稿状态"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在你点击"
          },
          {
            "t": "发布",
            "b": true
          },
          {
            "t": "之前，学生看不到任何内容。可以利用草稿状态分多次撰写作业，也可以提前准备好整个学期的内容，再逐周发布。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-07-homework-published.jpg",
        "cap": "已发布"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "发布后，标记会变为"
          },
          {
            "t": "已发布",
            "b": true
          },
          {
            "t": "，学生可以提交，按钮则变为"
          },
          {
            "t": "退回草稿",
            "b": true
          },
          {
            "t": "——发布是可逆的。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "学生提交的内容会汇集在同一页面的"
          },
          {
            "t": "已提交的作业",
            "b": true
          },
          {
            "t": "中，你可以逐份打开并给出评语。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. 视频"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 视频（05）。",
            "b": true
          },
          {
            "t": " 学生发给你的练习视频，以及你分享给他们的课程视频。可按"
          },
          {
            "t": "类型",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "状态",
            "b": true
          },
          {
            "t": "筛选，打开后观看并评论。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "要添加视频，点击 "
          },
          {
            "t": "+ 上传视频",
            "b": true
          },
          {
            "t": "："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-10-video-upload-form.jpg",
        "cap": "上传视频"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "用摄像头录制",
              "b": true
            },
            {
              "t": " — 在浏览器中录制，会先请求权限。"
            }
          ],
          [
            {
              "t": "或选择视频文件",
              "b": true
            },
            {
              "t": " — 支持 MP4、WebM 或 QuickTime，最大 "
            },
            {
              "t": "2 GiB",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "类型",
              "b": true
            },
            {
              "t": " — "
            },
            {
              "t": "Class",
              "b": true
            },
            {
              "t": "（课程视频）或 "
            },
            {
              "t": "Practice",
              "b": true
            },
            {
              "t": "（练习视频）。"
            }
          ],
          [
            {
              "t": "学生",
              "b": true
            },
            {
              "t": " — 选填，如果这段视频属于某一位学生。"
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. 消息"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 消息（07）。",
            "b": true
          },
          {
            "t": " 与学生的私密对话。列表会显示每位学生以及是否有未读内容。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-11-message-thread.jpg",
        "cap": "一段对话"
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "对话属于学生，而不属于你。",
                "b": true
              },
              {
                "t": " 每位学生只有一个对话，且由所有者共享。所有者发送的消息会以他的名义出现在你的对话中，你的回复他也能看到。请把它当作机构与该学生之间的对话，而不是你的私人渠道。"
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "主管永远看不到其中任何内容。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. 公告"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 公告（08）。",
            "b": true
          },
          {
            "t": " 一次性向你名下所有学生发送消息——这是单向通知，不是对话。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "点击 "
          },
          {
            "t": "+ 发布",
            "b": true
          },
          {
            "t": "，填写标题和正文，然后点击"
          },
          {
            "t": "发送公告",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-08-announcement-sent.jpg",
        "cap": "一条公告"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "你"
          },
          {
            "t": "没有接收对象选择器",
            "b": true
          },
          {
            "t": "。Arco 会直接说明发送范围："
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "将发送给你名下的所有学生。",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "只有所有者可以选择发给老师或整个机构。发送后的"
          },
          {
            "t": "送达情况",
            "b": true
          },
          {
            "t": "面板会记录覆盖人数和发送时间。你的列表只显示由你发送的公告。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "8. 你的日程 — 预约"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 预约（06）。",
            "b": true
          },
          {
            "t": " 两项工作：公布你的空闲时间，以及把课程排进这些时间。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "所有时间均为"
          },
          {
            "t": "美国东部时间（America/New_York）",
            "b": true
          },
          {
            "t": "，时段会以"
          },
          {
            "t": "两个时区",
            "b": true
          },
          {
            "t": "同时显示，方便身在海外的学生正确理解同一行。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "公布你的可预约时间"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在"
          },
          {
            "t": "可预约时间",
            "b": true
          },
          {
            "t": "下，可按"
          },
          {
            "t": "周",
            "b": true
          },
          {
            "t": "或"
          },
          {
            "t": "月",
            "b": true
          },
          {
            "t": "查看。"
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "点击空白区域",
              "b": true
            },
            {
              "t": "添加一个时间段。选择"
            },
            {
              "t": "每周&lt;星期几&gt;",
              "b": true
            },
            {
              "t": "表示循环，或选择某一天表示一次性。"
            }
          ],
          [
            {
              "t": "点击色块",
              "b": true
            },
            {
              "t": "可以编辑或删除。"
            }
          ],
          [
            {
              "t": "图例区分"
            },
            {
              "t": "循环",
              "b": true
            },
            {
              "t": "、"
            },
            {
              "t": "新增",
              "b": true
            },
            {
              "t": "和"
            },
            {
              "t": "已屏蔽",
              "b": true
            },
            {
              "t": "。"
            }
          ]
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "屏蔽不会取消已有预约。",
                "b": true
              },
              {
                "t": " 屏蔽时间只会阻止"
              },
              {
                "t": "新的",
                "i": true
              },
              {
                "t": "预约。已经预约在该时段的课程仍然有效——如果确实需要取消，请在列表中操作。"
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "你的所有者也可以代你编辑可预约时间，结果就是你在这里看到的同一份日历。"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "预约课程"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "用"
          },
          {
            "t": "前一天 / 后一天",
            "b": true
          },
          {
            "t": "切换日期。你的空闲时段会显示为按钮："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-13-open-slots-dual-tz.jpg",
        "cap": "空闲时段"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "选择"
          },
          {
            "t": "学生",
            "b": true
          },
          {
            "t": "，然后点击某个时段。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/teacher-14-booking-made.jpg",
        "cap": "已预约"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "课程会移入"
          },
          {
            "t": "即将开始的预约",
            "b": true
          },
          {
            "t": "，该时段从空闲列表中消失，同时会有一张"
          },
          {
            "t": "下一节课",
            "b": true
          },
          {
            "t": "卡片突出显示最近的一节。临近开始时会出现"
          },
          {
            "t": "Join",
            "b": true
          },
          {
            "t": "链接——课程以浏览器视频通话的形式进行。点击 ✕ 可取消预约。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "9. 资料库"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 资料库（04）。",
            "b": true
          },
          {
            "t": " 面向整个机构的共享讲义、乐谱和文件——所有人都可以阅读，你可以添加内容。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在"
          },
          {
            "t": "新建分类",
            "b": true
          },
          {
            "t": "下输入名称并点击 "
          },
          {
            "t": "+",
            "b": true
          },
          {
            "t": " 创建分类。点击"
          },
          {
            "t": "上传",
            "b": true
          },
          {
            "t": "添加文件：支持文档、图片、压缩包、音频或视频，最大 "
          },
          {
            "t": "500 MB",
            "b": true
          },
          {
            "t": "，需填写标题，描述选填。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "10. 日常功能"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "通知",
              "b": true
            },
            {
              "t": " — 姓名上方的铃铛图标：新的作业提交、被接受的邀请等。可"
            },
            {
              "t": "标为已读",
              "b": true
            },
            {
              "t": "，或"
            },
            {
              "t": "全部标为已读",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "语言",
              "b": true
            },
            {
              "t": " — 点击侧边栏底部的姓名："
            },
            {
              "t": "English",
              "b": true
            },
            {
              "t": " 或 "
            },
            {
              "t": "中文",
              "b": true
            },
            {
              "t": "，切换即时生效。"
            }
          ],
          [
            {
              "t": "退出登录",
              "b": true
            },
            {
              "t": " — 同一菜单。"
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "典型的第一周"
      },
      {
        "k": "ol",
        "items": [
          "接受邀请并登录。",
          [
            {
              "t": "邀请",
              "b": true
            },
            {
              "t": " → 邀请你的学生（他们会直接进入你的名单）。"
            }
          ],
          [
            {
              "t": "预约",
              "b": true
            },
            {
              "t": " → 点击表格公布你每周的空闲时间。"
            }
          ],
          [
            {
              "t": "课程",
              "b": true
            },
            {
              "t": " → 打开课程，添加你的学生。"
            }
          ],
          [
            {
              "t": "+ 新建作业",
              "b": true
            },
            {
              "t": " → 撰写内容，勾选接受的形式，然后"
            },
            {
              "t": "发布",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "公告",
              "b": true
            },
            {
              "t": " → 告诉学生需要带什么。"
            }
          ],
          [
            {
              "t": "关注仪表盘上的"
            },
            {
              "t": "待审阅视频",
              "i": true
            },
            {
              "t": "和"
            },
            {
              "t": "未读消息",
              "i": true
            },
            {
              "t": "。"
            }
          ]
        ]
      }
    ],
    "manager": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — 主管手册"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "身份：",
            "i": true
          },
          {
            "t": "主管",
            "i": true
          },
          {
            "t": "。你以数据的形式了解机构的运营情况。",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "这是一本很短的手册，而这正是重点。你的身份只有一个真正重要的界面，对其余一切的视野都被刻意收窄。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. 请先读这一条规则"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "主管不是\"高级教师\"。",
            "b": true
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "人们往往以为主管是权限最大的身份——在其他软件里通常确实如此。但在 Arco 中并非如此。主管看到的"
          },
          {
            "t": "比教师更少",
            "b": true
          },
          {
            "t": "，这是刻意为之。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "你可以看到上了多少节课、有多少活跃学生、每位教师的工作量情况。你"
          },
          {
            "t": "永远不能",
            "b": true
          },
          {
            "t": "打开某个学生的视频、阅读消息，或查看某人作业的正文。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "可以这样理解：主管看到的是"
              },
              {
                "t": "记分牌",
                "b": true
              },
              {
                "t": "，不是"
              },
              {
                "t": "比赛本身",
                "b": true
              },
              {
                "t": "。"
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "这不是把界面藏起来而已。该限制由服务端强制执行：即使你直接输入某个学生页面的地址，数据也不会被返回。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. 登录"
      },
      {
        "k": "p",
        "c": "机构所有者会发给你一个邀请链接——只有所有者才能创建主管。打开链接，设置姓名、邮箱和密码，然后登录。"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "接受邀请"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. 你的仪表盘"
      },
      {
        "k": "p",
        "c": "这是你的主界面，也几乎是你唯一的界面。"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-01-dashboard.jpg",
        "cap": "主管仪表盘"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "四个计数"
      },
      {
        "k": "table",
        "head": [
          "计数",
          "统计内容"
        ],
        "rows": [
          [
            [
              {
                "t": "教师",
                "b": true
              }
            ],
            "机构内的教师人数。"
          ],
          [
            [
              {
                "t": "学生",
                "b": true
              }
            ],
            "所有教师名下的学生总数。"
          ],
          [
            [
              {
                "t": "即将开始的课程",
                "b": true
              }
            ],
            "已预约且尚未发生的课程。"
          ],
          [
            [
              {
                "t": "待审阅视频",
                "b": true
              }
            ],
            "等待教师给出评语的学生视频。"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "待审阅视频",
            "i": true
          },
          {
            "t": "是最值得关注的一项。如果这个数字逐周攀升，说明作业提交的速度快于教师处理的速度。"
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "任务进度"
      },
      {
        "k": "p",
        "c": "机构共享待办清单的完成百分比——已完成多少项、还有多少项未完成。你只能看到进度条，看不到具体的任务内容。"
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "按教师"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "每位教师一行："
          },
          {
            "t": "学生",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "即将开始",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "已完成",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "待审阅视频",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未读",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": "这是你的工作量视图。它能回答\"有没有人超负荷？有没有人在评语上落后？\"，同时不暴露任何一位学生的作业。"
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "请注意这张表包含什么：教师姓名和统计数字。"
              },
              {
                "t": "你的仪表盘上任何地方都不会出现学生姓名",
                "b": true
              },
              {
                "t": "——不在表格中，不在表格背后，也不在浏览器收到的底层数据里。"
              }
            ]
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. 公告"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 公告（02）。",
            "b": true
          },
          {
            "t": " 你唯一的另一个板块。"
          }
        ]
      },
      {
        "k": "p",
        "c": "你可以看到机构内发出的每一条公告——由所有者和每位教师发送的——包括发送人、接收对象，以及覆盖了多少人。"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-03-announcement-redacted.jpg",
        "cap": "主管视角的公告"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "你"
          },
          {
            "t": "看不到",
            "b": true
          },
          {
            "t": "的是消息正文本身。在本该显示正文的位置，Arco 会写道："
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "你可以看到公告已发送及其覆盖人数。消息正文仅在发送者与其学生之间可见。",
                "i": true
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "送达情况",
            "b": true
          },
          {
            "t": "面板仍会提供有用的部分：接收人数、接收对象、发送人和时间。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "你不能发送公告。主管界面上没有"
          },
          {
            "t": "发布",
            "i": true
          },
          {
            "t": "按钮——那属于所有者和教师。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. 通知"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "姓名上方的铃铛图标会以同样的详略程度呈现机构事件——例如"
          },
          {
            "t": "\"公告已发送给 1 位学生\"",
            "i": true
          },
          {
            "t": "，包含标题和发送人，但永远不含正文。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-04-notifications.jpg",
        "cap": "通知"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "标为已读",
            "b": true
          },
          {
            "t": "清除一条；"
          },
          {
            "t": "全部标为已读",
            "b": true
          },
          {
            "t": "清除全部。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. 你无法访问的内容"
      },
      {
        "k": "p",
        "c": "如果你点击链接或直接输入超出你身份范围的地址，Arco 会明确提示，而不是显示一个坏掉的页面："
      },
      {
        "k": "img",
        "src": "/manual/screenshots/manager-02-no-access.jpg",
        "cap": "无访问权限"
      },
      {
        "k": "table",
        "head": [
          "板块",
          "主管的访问权限"
        ],
        "rows": [
          [
            "仪表盘",
            "✅ 仅汇总数据"
          ],
          [
            "公告",
            "✅ 元信息与送达数据，永远不含正文"
          ],
          [
            "通知",
            "✅ 事件与统计"
          ],
          [
            "资料库",
            "✅ 机构共享文件（见下）"
          ],
          [
            "学生",
            "❌ 无访问权限"
          ],
          [
            "课程与作业",
            "❌ 无访问权限"
          ],
          [
            "视频",
            "❌ 无访问权限"
          ],
          [
            "消息",
            "❌ 无访问权限"
          ],
          [
            "预约",
            "❌ 无访问权限"
          ],
          [
            "邀请",
            "❌ 无访问权限"
          ],
          [
            "机构设置",
            "❌ 仅所有者"
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "唯一的例外：资料库"
      },
      {
        "k": "p",
        "c": "共享资料库——讲义、乐谱、机构文件——机构内所有人都可以阅读，主管也不例外。它不在你的侧边栏中，但也没有被拦截。"
      },
      {
        "k": "p",
        "c": "这是刻意的区分，而非疏漏。资料库存放的是机构面向所有人发布的材料，从不存放某位学生的作业。学生本人的提交、视频和消息，对你始终是关闭的。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. 日常功能"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "语言",
              "b": true
            },
            {
              "t": " — 点击侧边栏底部的姓名，在"
            },
            {
              "t": "English",
              "b": true
            },
            {
              "t": "和"
            },
            {
              "t": "中文",
              "b": true
            },
            {
              "t": "之间切换。"
            }
          ],
          [
            {
              "t": "退出登录",
              "b": true
            },
            {
              "t": " — 同一菜单。"
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "该看什么，什么时候看"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "每周：",
              "b": true
            },
            {
              "t": " 各教师的"
            },
            {
              "t": "待审阅视频",
              "i": true
            },
            {
              "t": "。数字上升是评语进度开始滞后的最早信号。"
            }
          ],
          [
            {
              "t": "每周：",
              "b": true
            },
            {
              "t": " 各教师的"
            },
            {
              "t": "未读",
              "i": true
            },
            {
              "t": "——学生的消息无人回复。"
            }
          ],
          [
            {
              "t": "每月：",
              "b": true
            },
            {
              "t": " 各教师的"
            },
            {
              "t": "学生",
              "i": true
            },
            {
              "t": "人数，用于评估全机构的工作量是否均衡。"
            }
          ],
          [
            {
              "t": "持续关注：",
              "b": true
            },
            {
              "t": " "
            },
            {
              "t": "任务进度",
              "i": true
            },
            {
              "t": "，判断机构的行政事务是否真的在推进。"
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": "如果某个数字让你对某位具体的学生产生疑问，这个问题应该交给所有者或教师。按照设计，你无法在这里得到答案。"
      }
    ],
    "student": [
      {
        "k": "h",
        "lvl": 1,
        "c": "Arco — 学生手册"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "身份：",
            "i": true
          },
          {
            "t": "学生",
            "i": true
          },
          {
            "t": "。你来这里学习：观看、练习、交作业、预约课程。",
            "i": true
          }
        ]
      },
      {
        "k": "p",
        "c": "你在 Arco 中看到的一切都属于你自己。你看不到其他学生，他们也看不到你——即使你们是同一位老师的学生。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "1. 登录"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "你的老师或机构所有者会发给你一个邀请链接。打开它，填写姓名、邮箱和密码，点击"
          },
          {
            "t": "Create account",
            "i": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/shared-01-accept-invite-register.jpg",
        "cap": "接受邀请"
      },
      {
        "k": "p",
        "c": "然后登录——注册后不会自动登录。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "2. 你的仪表盘"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-01-dashboard.jpg",
        "cap": "学生仪表盘"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "顶部有三个计数："
          },
          {
            "t": "待交作业",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未来 24 小时课程",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "未读消息",
            "b": true
          },
          {
            "t": "。作业计数还会显示时间范围——"
          },
          {
            "t": "\"待交作业 · 14 天内\"",
            "i": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "下一节课",
            "b": true
          },
          {
            "t": "显示在绿色横幅中，日期和时间以"
          },
          {
            "t": "两个时区",
            "b": true
          },
          {
            "t": "同时呈现，即使你和老师身处不同国家也不会混淆。如果无法参加，横幅上就有"
          },
          {
            "t": "取消",
            "b": true
          },
          {
            "t": "按钮。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "下方依次是："
          },
          {
            "t": "待交作业",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "即将开始的预约",
            "b": true
          },
          {
            "t": "、"
          },
          {
            "t": "任务",
            "b": true
          },
          {
            "t": "，以及"
          },
          {
            "t": "等待审阅",
            "b": true
          },
          {
            "t": "（老师尚未评论的练习视频）。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "即将开始的预约",
                "b": true
              },
              {
                "t": "面板列出的是你"
              },
              {
                "t": "之后",
                "i": true
              },
              {
                "t": "的课程。最近的一节已经显示在顶部的绿色横幅中，因此当你只预约了一节课时，这个面板显示\"暂无即将开始的预约\"是正确的，并非错误。"
              }
            ]
          }
        ]
      },
      {
        "k": "p",
        "c": "侧边栏共六个板块。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "3. 你的课程与作业"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 课程（02）。",
            "b": true
          },
          {
            "t": " 你已选修的课程。由老师为你添加课程——你无法自己加入。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-02-course-curriculum.jpg",
        "cap": "你的课程"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "打开一门课程可以看到"
          },
          {
            "t": "课程内容",
            "b": true
          },
          {
            "t": "——按顺序编号的作业，每项都标有截止日期。"
          }
        ]
      },
      {
        "k": "quote",
        "c": [
          {
            "k": "p",
            "c": [
              {
                "t": "你只能看到老师"
              },
              {
                "t": "已发布",
                "b": true
              },
              {
                "t": "的作业。仍在起草中的内容在发布前对你不可见。"
              }
            ]
          }
        ]
      },
      {
        "k": "h",
        "lvl": 3,
        "c": "提交作业"
      },
      {
        "k": "p",
        "c": "点击某项作业。"
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-03-homework-detail.jpg",
        "cap": "一项作业"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "顶部是作业说明、老师附上的"
          },
          {
            "t": "打开参考链接",
            "b": true
          },
          {
            "t": "（示范录音、乐谱或参考页面）、截止日期，以及你的可提交次数。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "在"
          },
          {
            "t": "我的作业",
            "b": true
          },
          {
            "t": "下，你只会看到老师选择接受的形式："
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "我的回答",
              "b": true
            },
            {
              "t": " — 输入你的回答。"
            }
          ],
          [
            {
              "t": "添加附件",
              "b": true
            },
            {
              "t": " — 扫描件、照片、文档，或音频、视频文件。可以添加多个。"
            }
          ],
          [
            {
              "t": "录制一段影像",
              "b": true
            },
            {
              "t": " — 如果老师启用了这一项，可直接用摄像头在浏览器中录制。"
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "填写适用的部分后点击"
          },
          {
            "t": "提交作业",
            "b": true
          },
          {
            "t": "。可以同时使用多种形式——它们会作为一次提交一并送出。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-04-submitted.jpg",
        "cap": "已提交"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "之后你会看到"
          },
          {
            "t": "第 1 次提交 · 已提交",
            "b": true
          },
          {
            "t": "及日期。此时有两件有用的事："
          }
        ]
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "你可以"
            },
            {
              "t": "修改我的回答",
              "b": true
            },
            {
              "t": "并点击"
            },
            {
              "t": "保存修改",
              "i": true
            },
            {
              "t": "——适合修正笔误或补充想法。"
            }
          ],
          [
            {
              "t": "如果还有剩余次数，下方会出现新的表单供你再次提交。标题会说明上限（"
            },
            {
              "t": "\"可提交次数：3\"",
              "i": true
            },
            {
              "t": "）。"
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": "老师的评语会出现在同一页面上。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "4. 练习视频"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 视频（04）。",
            "b": true
          },
          {
            "t": " 你发给老师的视频，以及老师分享给你的课程视频。仪表盘上的"
          },
          {
            "t": "等待审阅",
            "i": true
          },
          {
            "t": "统计的是老师尚未评论的视频数量。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "要添加视频，点击 "
          },
          {
            "t": "+ 上传视频",
            "b": true
          },
          {
            "t": "："
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-06-video-upload.jpg",
        "cap": "上传练习视频"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "用摄像头录制",
              "b": true
            },
            {
              "t": " — 在浏览器中录制，会先请求权限。"
            }
          ],
          [
            {
              "t": "或选择视频文件",
              "b": true
            },
            {
              "t": " — 支持 MP4、WebM 或 QuickTime，最大 "
            },
            {
              "t": "2 GiB",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "填写"
            },
            {
              "t": "标题",
              "b": true
            },
            {
              "t": "。"
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "你的视频始终归类为"
          },
          {
            "t": "练习视频，以你本人的身份上传",
            "b": true
          },
          {
            "t": "——没有需要选择的选项。只有你和你的老师能看到它。"
          }
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "5. 课程预约"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 预约（05）。",
            "b": true
          },
          {
            "t": " 你的课程，以及老师的空闲时段。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-01-dashboard.jpg",
        "cap": "你的预约"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "左侧是"
            },
            {
              "t": "即将开始的预约",
              "b": true
            },
            {
              "t": "，每条标记为"
            },
            {
              "t": "已预约",
              "i": true
            },
            {
              "t": "，点击 "
            },
            {
              "t": "✕",
              "b": true
            },
            {
              "t": " 可取消。"
            }
          ],
          [
            {
              "t": "右侧是"
            },
            {
              "t": "可预约时段",
              "b": true
            },
            {
              "t": "。用"
            },
            {
              "t": "前一天",
              "b": true
            },
            {
              "t": "和"
            },
            {
              "t": "后一天",
              "b": true
            },
            {
              "t": "切换日期，点击某个时间即可预约。"
            }
          ]
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "时间始终以"
          },
          {
            "t": "两个时区",
            "b": true
          },
          {
            "t": "显示（例如"
          },
          {
            "t": "上午 8:00 ET / 晚上 8:00 中国时间",
            "i": true
          },
          {
            "t": "）——看适合你的那一个。"
          }
        ]
      },
      {
        "k": "p",
        "c": [
          {
            "t": "课程临近开始时会出现"
          },
          {
            "t": "Join",
            "b": true
          },
          {
            "t": "链接。课程以浏览器视频通话的形式进行，无需安装任何软件。"
          }
        ]
      },
      {
        "k": "p",
        "c": "可预约时间不由你设置——这些时段来自你老师的日程。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "6. 消息"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 消息（06）。",
            "b": true
          },
          {
            "t": " 你与机构之间的一个私密对话。它会直接打开对话内容——没有列表可选，因为你只有一个对话。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-05-messages.jpg",
        "cap": "你的消息"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "每条消息都标注了发送人。你的"
          },
          {
            "t": "老师",
            "b": true
          },
          {
            "t": "和"
          },
          {
            "t": "机构所有者",
            "b": true
          },
          {
            "t": "都可以在这里发言，也都能看到你的回复——因此请把它当作与机构的对话，而不是与某一个人的对话。在底部输入内容并点击"
          },
          {
            "t": "发送",
            "b": true
          },
          {
            "t": "。"
          }
        ]
      },
      {
        "k": "p",
        "c": "主管永远无法阅读这些消息。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "7. 资料库"
      },
      {
        "k": "p",
        "c": [
          {
            "t": "侧边栏 → 资料库（03）。",
            "b": true
          },
          {
            "t": " 机构面向所有人发布的共享讲义、乐谱和文件。"
          }
        ]
      },
      {
        "k": "img",
        "src": "/manual/screenshots/student-07-library-readonly.jpg",
        "cap": "资料库"
      },
      {
        "k": "p",
        "c": "可以按分类浏览，也可以使用搜索框。这里的内容你都可以阅读和下载，但只有老师和所有者可以添加文件。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "8. 日常功能"
      },
      {
        "k": "ul",
        "items": [
          [
            {
              "t": "通知",
              "b": true
            },
            {
              "t": " — 姓名上方的铃铛图标：新作业、评语、公告。可"
            },
            {
              "t": "标为已读",
              "b": true
            },
            {
              "t": "，或"
            },
            {
              "t": "全部标为已读",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "语言",
              "b": true
            },
            {
              "t": " — 点击侧边栏底部的姓名："
            },
            {
              "t": "English",
              "b": true
            },
            {
              "t": " 或 "
            },
            {
              "t": "中文",
              "b": true
            },
            {
              "t": "。"
            }
          ],
          [
            {
              "t": "退出登录",
              "b": true
            },
            {
              "t": " — 同一菜单。"
            }
          ]
        ]
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "什么是私密的，什么不是"
      },
      {
        "k": "p",
        "c": "值得清楚了解你的处境："
      },
      {
        "k": "table",
        "head": [
          "内容",
          "谁可以看到"
        ],
        "rows": [
          [
            "你提交的作业",
            "你和你的老师"
          ],
          [
            "你的练习视频",
            "你和你的老师"
          ],
          [
            "你的消息",
            "你、你的老师，以及机构所有者"
          ],
          [
            "你的预约",
            "你和你的老师"
          ],
          [
            [
              {
                "t": "其他学生",
                "b": true
              }
            ],
            [
              {
                "t": "你看不到他们——他们也看不到你",
                "b": true
              }
            ]
          ]
        ],
        "align": [
          "left",
          "left"
        ]
      },
      {
        "k": "p",
        "c": "即使是与你同一位老师的学生，也看不到你的作业、视频、消息，甚至不知道你的存在。主管只能看到机构的汇总数据，永远看不到你的作业。"
      },
      {
        "k": "hr"
      },
      {
        "k": "h",
        "lvl": 2,
        "c": "你的典型一周"
      },
      {
        "k": "ol",
        "items": [
          "查看仪表盘——待交作业、下一节课。",
          [
            {
              "t": "课程",
              "b": true
            },
            {
              "t": " → 打开本周的作业，阅读作业说明。"
            }
          ],
          [
            {
              "t": "练习，然后"
            },
            {
              "t": "提交作业",
              "b": true
            },
            {
              "t": "——文字回答、附件，或录制的影像。"
            }
          ],
          [
            {
              "t": "视频",
              "b": true
            },
            {
              "t": " → 如果老师要求，发送一段练习视频。"
            }
          ],
          [
            {
              "t": "预约",
              "b": true
            },
            {
              "t": " → 从老师的空闲时段中预约下周的课程。"
            }
          ],
          [
            {
              "t": "消息",
              "b": true
            },
            {
              "t": " → 提出任何遇到的疑问。"
            }
          ]
        ]
      }
    ]
  }
}
