# continue.md — `no-fragment-slot` false positive

Analysis only. **No fix applied yet** — the red below is still red.

## The failure

```bash
node --test plugins/eslint/slots.test.mjs
```

28 of 29 assertions across `plugins/eslint/*.test.mjs` pass. The one red is the third
`valid` entry of `plugins/eslint/slots.test.mjs` — "one child inside a fragment is still
one child":

```jsx
const View = () => <Tree name="stat" slots={{ meta: () => <><Label /></>, body: Body }} />
```

The rule reports `messageId: "fragment"` on the `meta` property (line 1, column 51):

```
Should have no errors but had 1
```

This pre-dates the current work — neither `plugins/eslint/slots.mjs` nor its test are
modified in the working tree. It has been invisible to the repo's three gates because
`plugins/eslint/*.test.mjs` runs under `node --test`, while `npx vitest run` only
discovers `src/**/*.test.{ts,tsx}`.

## Root cause

Not the child counting. `fragmentChildCount` (`plugins/eslint/slots.mjs:15`) is correct —
it already filters to `JSXElement` / `JSXFragment` / non-empty `JSXExpressionContainer`,
so `JSXText` whitespace and comments never inflate the count.

The bug is that the count is **never consulted on the arrow-function path**.
`arrowFragment` (`plugins/eslint/slots.mjs:25`) returns *any* fragment an arrow hands
back, by expression body or by `return`. The call site then reports on its mere
existence:

```js
const fragment = arrowFragment(slot)
if (fragment) {
  context.report({ node: property, messageId: "fragment", data: { role } })
  continue
}
```

`plugins/eslint/slots.mjs:73-77`

So `() => <><Label /></>` — a one-child fragment — reports exactly like
`() => <><Label /><Hint /></>`.

`isMultiChildFragment` (`plugins/eslint/slots.mjs:22`) exists and is right, but is only
wired into the *variable-tracking* path (`VariableDeclarator`, `slots.mjs:56`). That is
why the two `const pair = <><Label /><Hint /></>` invalid cases pass: they go through
`multiFragmentVariables`, which is gated on the count. Only the inline-arrow path skips
the gate.

## The fix

Gate the arrow path on the same predicate the variable path already uses — apply
`isMultiChildFragment` to the fragment returned by `arrowFragment` before reporting.
One condition at `plugins/eslint/slots.mjs:74`; `fragmentChildCount`, `arrowFragment`,
and the `VariableDeclarator` handler all stay as they are.

Both invalid arrow cases (expression body and `return` body) carry two children, so they
keep reporting. Leave the rest of the plugin untouched.

## Verify

```bash
node --test plugins/eslint/*.test.mjs
```

Then the repo's three gates:

```bash
npx tsc --noEmit
```

```bash
npx eslint .
```

```bash
npx vitest run
```

## Note for whoever picks this up

The `plugins/eslint/*.test.mjs` suite is not covered by any of the three gates. Worth
deciding separately whether `node --test plugins/eslint/*.test.mjs` should join them —
otherwise the next red here is equally invisible.
