# Apply status

- Status: `applied`
- Target: `D:\Repositories\starci-academy-fe`
- Approved case: `direction-exact-legacy-parity`
- Backend writes: none
- Legacy/trust writes: none

## Implemented

- Weekly League and Top Learners now use the approved nested list projection.
- Rank 1, 2 and 3 use the corresponding Iconify Fluent Emoji medals.
- Rank 4 and beyond use the Iconify Fluent Emoji trophy.
- Positive and negative movement are row data verdicts rendered as two-pixel inset signals;
  they are not borders. Zero or missing movement has no verdict signal.
- Viewer rows are accented and do not expose a follow action.
- Loading, error, empty, ready and optimistic follow states remain independent per block.

## Verification

- `npm run typecheck`: passed.
- `npx eslint src plugins`: passed.
- Focused leaderboard suite: 5 files, 10 tests passed.
- `npm run test:rules`: 51 tests passed.
- `npm run build`: passed.
- Compiled CSS contains both success and danger inset-shadow utilities.
- `git diff --check`: passed.

The authenticated production Community page could not be opened in the isolated in-app browser
session because it stopped at Sign In. Visual parity is therefore backed by the approved preview,
focused component tests and the successful production build. Repository-wide `npm verify` remains
affected by pre-existing lint errors under untracked `.artifacts` folders and 11 unrelated dashboard
test failures in untouched components.
