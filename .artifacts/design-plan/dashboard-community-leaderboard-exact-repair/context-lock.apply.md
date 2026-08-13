# Apply Context Lock

- Status: `confirmed`
- Target: `D:\Repositories\starci-academy-fe`
- Git: branch `main`, worktree `D:\Repositories\starci-academy-fe`, HEAD `8af51ee6cd78ea4a4eed0c4af27e49d77abc28b6`, origin `https://github.com/starci-lab/starci-academy-fe.git`
- Approved case: `direction-exact-legacy-parity`
- Preview: `http://127.0.0.1:8084/`, PID `50980`
- Backend writes: none
- Legacy/trust: read-only
- Drift: none

## Exact production write boundary

- `package.json`, `package-lock.json`
- `plugins/eslint/icon-dependency-parity.test.mjs`
- `plugins/eslint/icon-vocabulary.mjs`
- `plugins/eslint/icon-vocabulary.test.mjs`
- `src/components/contracts/index.ts`
- `src/components/branches/SurfaceListCard/index.tsx`
- `src/components/leaves/RankMark/index.tsx`
- `src/components/leaves/RankMark/index.test.tsx`
- `src/components/composites/LeaderboardStandingRow/index.tsx`
- `src/components/composites/LeaderboardStandingRow/index.test.tsx`
- `src/components/composites/RankedUserRow/index.tsx`
- `src/components/composites/RankedUserRow/index.test.tsx`
- `src/components/blocks/dashboard/LeagueCard/{index.tsx,component.tsx,component.test.tsx}`
- `src/components/blocks/dashboard/TopLearners/{index.tsx,component.tsx,component.test.tsx}`
- This task's design artifact directory for Apply evidence only.

Everything else in the frontend, the complete legacy repository, backend repository and trust tree
is read-only. Confirmation evidence: user replied `ok dứt` after this exact lock was printed.
