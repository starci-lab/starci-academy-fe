# Context Lock - plan

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | `/starci-fe-design-plan` |
| Task | `learn-system-map` | "cho tính năng learn, vẽ tổng thể dựa vào legacy" |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | CLAUDE.md router |
| Skill | `starci-fe-design-plan` · `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-plan\SKILL.md` | Skill discovery |
| Primary target | `D:\Repositories\starci-academy-fe` (front end) | Request + workspace + git |
| Reference | `D:\Repositories\starci-academy` (read-only legacy render) | "dựa vào legacy" |
| Git identity - target | `session/surface-branch-and-press-affordance` · `a5d833a` · `github.com/starci-lab/starci-academy-fe` | git |
| Git identity - reference | `mtp` · `9a19342` | git |
| Git identity - trust | `session/surface-branch-and-press-affordance` · `3e75901` | git |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\learn-system-map` | Plan convention, eight prior cases |
| Write boundary | that artifact root only | CONTEXT-LOCK-5 |
| Read-only boundary | target `src/`, the legacy repository, the trust tree | Plan policy |
| Runtime | direction lab from port 8080 | Plan convention |
| Context record | this file and `context-lock.plan.json` | Artifact convention |

## Scope, and what it deliberately excludes

The request is the OVERALL shape of learn. The case is therefore the SYSTEM: what `/learn` opens
onto, how a learner moves between the eleven modes, what persists across them, what disappears
during a live assessment, and what enrolment gates.

It is not the interior of any one mode. The reader, the flashcard session, the interview and the
capstone each own decisions of their own, and settling those inside a map case would freeze eleven
screens on evidence gathered for one question.

## Evidence read at the reference HEAD

| Fact | Where |
|---|---|
| `/learn` is an alias: it redirects to `/learn/content` | `src/app/[locale]/courses/[courseId]/learn/page.tsx` |
| One shell owns every learn surface and decides its rails per segment | `learn/layout.tsx` -> `layouts/LearnShellLayout` |
| Content and modules get a resizable left content map plus a right on-this-page outline; the capstone gets a left milestone rail; every other mode is full width | `LearnShellLayout/index.tsx` |
| A live assessment - flashcard quiz session, interview in progress - is flagged apart from its own mode | `isAssessmentLive` in the same file |
| Enrolment gates exactly ONE surface, the capstone; trial viewers browse the rest | `ENROLL_REQUIRED_SURFACES` |
| Mobile carries its own bar with map / lesson / on-this-page | `blocks/learn/LearnMobileTabBar` |
| Eleven route segments, twenty-nine pages, one hundred and twenty-three learn blocks | route tree + `blocks/learn` |
