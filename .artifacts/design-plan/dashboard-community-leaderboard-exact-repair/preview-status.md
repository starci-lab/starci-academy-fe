# Preview status

Case: `direction-exact-legacy-parity`  
Status: `approved`  
URL: `http://127.0.0.1:8084/`

Rendered integrated scenarios:

1. Populated dark desktop.
2. Weekly loading while Top Learners is ready.
3. Weekly failed while Top Learners is loading.
4. Weekly ready while Top Learners failed.
5. Both blocks empty.
6. Followed, pending, rollback explanation and visible focus.
7. Populated light theme.
8. Populated mobile with no internal overflow.

The manifest uses the same HTML strings for canvas and source review. Browser verification found
eight operable scenario selectors, the exact four approved Iconify IDs, no legacy outline wrapper,
a `success` verdict rendered as `inset 2px 0 0` with zero border on every edge, mobile `390/390`
client/scroll width, and no console warning or error.

Approval evidence: user corrected the green treatment to a data verdict rather than a border, then
explicitly said `chốt thì dứt luôn apply` on 2026-08-12.
