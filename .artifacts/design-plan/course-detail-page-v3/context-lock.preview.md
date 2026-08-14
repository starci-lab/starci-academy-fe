# Context lock - preview - course-detail-page-v3

Inherited from `context-lock.plan.json`; selected direction `direction-parity-rail`.

| Field | Locked value |
|---|---|
| Phase | preview |
| Trust root | D:\Repositories\starci-academy-backend\.claude @ 3bcbe95 |
| Case | case-course-detail-v3 |
| Primary target | starci-academy-fe @ **2a82e7b** (relocked) |
| Reference | starci-academy @ 9a1934231 - unchanged |
| Artifact root | D:\Repositories\starci-academy-fe\.artifacts\design-plan\course-detail-page-v3 |
| Write boundary | candidate/, screens/, logs/, cases.js, design-record, this lock |
| Runtime | candidate served from the first free port at or above 8080 |

## Drift, and why it was relocked rather than returned to Plan

**target HEAD**: `a5d833a` -> `2a82e7b` - immaterial. one commit, a fidelity fix on the CATALOG page. It touched CourseCatalogCard and CoursesCatalogPage and did NOT touch contracts/index.ts, CourseDetailPage, CoursePricingRail or main-then-rail - the four things this case's evidence rests on.

**trust HEAD**: `3e75901` -> `3bcbe95` - MATERIAL. TOKEN-9 landed: a class naming a theme token resolves only when the theme defines it, with a rule in sources/fe/tokens.mjs. Preview requires the candidate to pass the target's canon lint, so building against the older law would have been rework by construction.

### TOKEN-9, checked against this session's own earlier edit

max-w-md was added to the union earlier this session for the auth card. The rule checks max-w-app-* against --container-app-* only, and deliberately exempts names Tailwind resolves itself; @theme here extends rather than resets, so --container-md survives from Tailwind's defaults. Verified by reading the rule, not by trusting a green run.

## Hazards

- the target carries 27 uncommitted files from another session and its HEAD has moved three times during this session
- no dev server slot is available in this folder: five are held by other chats, so no rendered production comparison has been possible all session
