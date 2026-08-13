// >>> sync-fe-lint.mjs -- canon rule wiring, do not edit by hand >>>
/*
 * The rules are authored in the trust tree and MIRRORED here by sync-fe-lint.mjs. Do not edit
 * anything under plugins/eslint-canon/ and do not add a rule to it: the next run overwrites the
 * folder, and a rule that exists only here is a second answer to a question canon already answers.
 *
 * What this repository does own is the config below - which globs the rules apply to.
 */
import starciFe, {
    recommended as starciRecommended,
    linterOptions as starciLinterOptions,
    starciFeConfig,
} from "./plugins/eslint-canon/index.mjs"
// <<< sync-fe-lint.mjs -- canon rule wiring <<<
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import { defineConfig } from "eslint/config"
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
            /*
             * Design artifacts are scratch - the scenario harness around a candidate, its
             * directional HTML, its server logs - and a gate nobody can get green is a gate nobody
             * reads. `cases.js` and `review.js` are comparison instruments written to be read once,
             * not product source, and holding them to the app's house style produced two thousand
             * findings that hid the one that mattered.
             *
             * THE PATTERNS ARE NARROW ON PURPOSE. Ignoring `**\/.artifacts/**` and re-including the
             * candidate underneath it reports zero problems and lints NOTHING: a global ignore stops
             * eslint descending into the directory at all, so the negation never gets a chance and
             * even an explicit path answers "file ignored". Candidate SOURCE stays governed, because
             * a candidate is the executable specification Apply ports.
             */
            "**/.artifacts/**/*.log",
            "**/.artifacts/**/*.html",
            "**/.artifacts/**/*.css",
            "**/.artifacts/**/cases*.js",
            "**/.artifacts/**/review*.js",
            "**/.artifacts/**/design-record.js",
            // The review chrome around a candidate: a scenario switcher and a theme toggle. It
            // declares no target path and is never ported, so holding it to production rules would
            // only teach the next author to move real work into the harness to escape them.
            "**/.artifacts/**/candidate/app/**",
            "**/.artifacts/**/candidate/*.{ts,mjs,js}",
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
    /*
     * THE CANON BLOCK, built rather than written.
     *
     * This repository states one thing about the law - which shape it has - and the trust tree
     * decides the rest: which globs that shape implies, which rules are on, at what severity,
     * and that an inline comment may not switch one off. A block written out here would be a
     * second opinion about all four, and the previous one had already drifted to a different
     * rule count from its sibling and from canon.
     */
    starciFeConfig({
        layout: "single-app",
        plugin: starciFe,
        recommended: starciRecommended,
        linterOptions: starciLinterOptions,
    }),
    {
        /*
         * ONE FILE MAY USE `namespace`, AND ONLY BECAUSE THE VENDOR'S TYPES DO.
         *
         * `options.ts` augments `@apollo/client`, whose own declarations nest namespaces. A module
         * augmentation has to match the shape it is augmenting, so there is no ES-module spelling of
         * this file that compiles - the rule is right everywhere else and cannot hold here.
         *
         * It is written HERE rather than as `eslint-disable-next-line` in the file, which is the
         * distinction `noInlineConfig` exists to draw: an exception in the config is one line in a
         * reviewed file that a reader can find by searching for the rule, while an inline disable is
         * a file granting itself permission where nobody is looking. The two comments this replaced
         * had in fact stopped working the moment inline config was refused, and the file kept its
         * exemption only because nothing had checked.
         */
        files: ["src/modules/api/graphql/clients/options.ts"],
        rules: { "@typescript-eslint/no-namespace": "off" },
    },
    {
        // A connected block and its pure twin are an architectural boundary, not a local lint
        // preference. Inline config is disabled in both halves so neither `eslint-disable` nor
        // `eslint-enable` can turn that boundary off. There is deliberately no allowlist.
        files: ["src/components/blocks/**/{index,component}.tsx"],
        linterOptions: { noInlineConfig: true },
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
        /*
         * Rule modules and their RuleTester twins are Node programs on the 2-space house indent of
         * the plugin folder, not browser code on the app's 4-space indent.
         *
         * THE PATH IS `eslint-canon`, NOT `eslint`. The mirror folder was renamed when it became
         * generated output and this glob was left behind, so it matched nothing - and a glob that
         * matches nothing reports nothing, which is why it survived. The block above it registered
         * the plugin against the same dead path with an EMPTY rule set and has been removed: it
         * turned nothing on, and reading it suggested the folder was governed twice.
         */
        files: ["plugins/eslint-canon/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
        rules: {
            indent: "off",
        },
    },
    {
        // Operator scripts are Node programs that never reach a bundle: they read `process.env`
        // and exit with a code, both of which are the point rather than an oversight. Declaring
        // the environment is what keeps `no-undef` meaningful everywhere else - the alternative
        // is silencing the rule per line in the one place a real leak would look identical.
        files: ["scripts/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
    },
])
