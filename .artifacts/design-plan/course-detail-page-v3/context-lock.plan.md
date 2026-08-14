# Context lock - plan - course-detail-page-v3

| Field | Locked value |
|---|---|
| Phase | plan |
| Trust root | D:\Repositories\starci-academy-backend\.claude |
| Skill | starci-fe-design-plan |
| Case | case-course-detail-v3 |
| Primary target | starci-academy-fe @ a5d833a (session/surface-branch-and-press-affordance) |
| Reference | starci-academy @ 9a1934231 - legacy parity, read-only |
| Reference | .artifacts/design-plan/course-detail-page-v2 - applied; it IS the page in production |
| Reference | .artifacts/design-plan/cart - direction selected, never previewed |
| Backend enabler | course review feature, this session: 48 unit specs + 5-step broker e2e |
| Artifact root | D:\Repositories\starci-academy-fe\.artifacts\design-plan\course-detail-page-v3 |
| Write boundary | the artifact root and nothing else |
| Runtime | direction lab from port 8080 |

## Hazards

- target carries 30 uncommitted files from another session
- target HEAD moved twice during this session
- trust root carries 17 uncommitted files from another session; gates green at 245

## Admission

Two of the seven requested items are ALREADY satisfied by the applied v2 page: `course-promise-list`
and `course-module-list` are joined SurfaceListCard lists with `divide-y` today, and the second
one is an `ol` because modules are ordered. They are excluded from this case rather than dressed
up as work.

`course-promise-list`'s own `why` records that reusing `profile-evidence-list` was considered
and refused on domain-naming grounds. That decision stands; this case does not reopen it.

Five items remain, and they compete for one scarce thing: the reading order of the main column and
what the rail is for. That is why they are one case rather than five.

Item 5 of the request, "sticky card with an effect", was never defined. Rather than assume a
meaning, it is a DIFFERENTIATOR: each direction answers it differently, so choosing a direction
chooses the scroll behaviour.
