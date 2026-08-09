import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import { defineConfig } from "eslint/config"
import starciFe from "./plugins/eslint/index.mjs"
import jsxA11y from "eslint-plugin-jsx-a11y"

export default defineConfig([
    {
        ignores: [
            "**/.next/**",
            "**/node_modules/**",
            "**/dist/**",
            "**/out/**",
            "**/coverage/**",
            "**/next-env.d.ts",
            // Agent scratch: `.claude/worktrees/**` holds a FULL git worktree of this
            // same repo. Left unignored, eslint lints a stale second copy of every
            // file and reports thousands of problems that no longer exist in source -
            // noise that buries the real ones and makes a green gate impossible.
            "**/.claude/**",
        ],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        plugins: { "react-hooks": pluginReactHooks },
        rules: {
            "react/display-name": "off",
            "react/react-in-jsx-scope": "off",
            "react/no-unescaped-entities": "off",
            indent: ["error", 4],
            "react-hooks/exhaustive-deps": "off",
            "linebreak-style": "off",
            quotes: ["error", "double"],
            semi: ["error", "never"],
        },
    },
    {
        // One spelling for an array type: `Array<T>` and `ReadonlyArray<T>`, never `T[]`.
        //
        // Both forms mean the same thing, which is exactly why this is a rule rather than a
        // convention - nothing corrects the second spelling, so a file written on a Tuesday
        // reads differently from its neighbour and every diff carries the noise. The generic
        // form is the one that stays readable when the element type is itself generic
        // (`Array<ContractSlots<K>>` against `ContractSlots<K>[]`), and it is already what the query
        // types and the hooks use, so this fixes the minority rather than the majority.
        files: ["**/*.{ts,tsx,mts,cts}"],
        rules: {
            "@typescript-eslint/array-type": ["error", { default: "generic", readonly: "generic" }],
        },
    },
    {
        // StarCi FE canon - mechanical ENFORCEMENT, every rule at "error".
        //
        // The previous repository ran most of this list at "warn" because it carried years of
        // call sites written before the rules existed, and a warn level is how you count debt
        // without blocking the build. This tree has no such debt: four source files, one
        // registry, and every rule below written for the pattern they already follow. A rule
        // kept at "warn" here would only be teaching the next author that it is optional.
        //
        // Two rules cannot fire without the registry on disk (`no-unregistered-tree-key`,
        // `no-unknown-slot-role`); they stay silent rather than guess, which is a property of
        // the rules and not a reason to soften their level.
        files: ["src/**/*.{ts,tsx}"],
        plugins: { "starci-fe": starciFe },
        rules: {
            // The named registry: one key owns the classes AND the child contract.
            "starci-fe/no-literal-structural-class": "error",
            "starci-fe/no-class-composition-outside-registry": "error",
            "starci-fe/no-hand-written-registry-attrs": "error",
            "starci-fe/no-unregistered-tree-key": "error",
            "starci-fe/no-unknown-slot-role": "error",
            "starci-fe/no-fragment-slot": "error",
            "starci-fe/no-structural-host-outside-registry-frame": "error",
            "starci-fe/no-heading-element-outside-heading-atom": "error",
            "starci-fe/registry-explain-is-a-reason": "error",
            // The registry folder holds two layers with opposite rules: SHAPES is generic and
            // capped, CHAINS name real compositions and are not. These two keep that difference
            // from eroding - the first because a value import there would invert the tier order
            // and build a real cycle while tsc stayed green, the second because a ceiling that
            // only a test enforces is one deletion away from not existing.
            "starci-fe/contracts-type-imports-only": "error",
            "starci-fe/shapes-vocabulary-ceiling": "error",
            // Token scale - the registry entry is now the only hand-written class string.
            "starci-fe/no-fractional-spacing": "error",
            "starci-fe/no-hero-heading-class": "error",
            "starci-fe/no-arbitrary-token": "error",
            // Public contracts - no component hands a caller a CSS door.
            "starci-fe/no-per-part-classname-prop": "error",
            "starci-fe/no-public-classname-prop": "error",
            "starci-fe/no-public-frame-css-props": "error",
            "starci-fe/no-css-door-type-laundering": "error",
            // The double cast turns type checking OFF at the seam where it is worth most. The
            // twin tests are exempt inside the rule itself (see `isCastGovernedFile`), because
            // proving a closed API refuses bad props requires building bad props on purpose.
            "starci-fe/no-double-cast": "error",
            "starci-fe/no-runtime-namespace": "error",
            // Tiers and file layout.
            "starci-fe/no-heroui-outside-vocabulary": "error",
            "starci-fe/presentational-purity": "error",
            "starci-fe/page-folder-two-files-only": "error",
            "starci-fe/no-helper-folder-in-components": "error",
            "starci-fe/export-matches-folder": "error",
            // One shape, two states.
            "starci-fe/no-parallel-skeleton": "error",
            "starci-fe/no-inline-skeleton-branch": "error",
            "starci-fe/no-skeleton-twin-component": "error",
            // Authoring.
            "starci-fe/prefer-arrow-export": "error",
            "starci-fe/require-export-jsdoc": "error",
            "starci-fe/handler-on-prefix": "error",
            "starci-fe/no-hardcoded-user-text-in-vocabulary": "error",
            "starci-fe/no-inline-parameter-type": "error",
            "starci-fe/no-emoji-in-source": "error",
            "starci-fe/no-vietnamese-in-source-authoring": "error",
        },
    },
    {
        // The enforcement layer is source too: English-only, no emoji, named parameter types.
        files: ["plugins/eslint/**/*.{js,mjs,cjs}"],
        plugins: { "starci-fe": starciFe },
        rules: {
            "starci-fe/no-inline-parameter-type": "error",
            "starci-fe/no-emoji-in-source": "error",
            "starci-fe/no-vietnamese-in-source-authoring": "error",
        },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: { "jsx-a11y": jsxA11y },
        rules: {
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/anchor-has-content": "error",
            "jsx-a11y/anchor-is-valid": "error",
            "jsx-a11y/aria-props": "error",
            "jsx-a11y/aria-role": "error",
            "jsx-a11y/aria-unsupported-elements": "error",
            "jsx-a11y/role-has-required-aria-props": "error",
            "jsx-a11y/role-supports-aria-props": "error",
            "jsx-a11y/click-events-have-key-events": "error",
            "jsx-a11y/no-static-element-interactions": "error",
            "jsx-a11y/label-has-associated-control": "error",
            "jsx-a11y/no-redundant-roles": "error",
        },
    },
    {
        // Rule modules and their RuleTester twins are Node programs on the 2-space house
        // indent of the plugin folder, not browser code on the app's 4-space indent.
        files: ["plugins/eslint/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
        rules: {
            indent: "off",
        },
    },
])
