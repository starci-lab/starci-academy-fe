/*
 * The rules are authored in the trust tree and published as @starci/eslint-canon-fe. Do not add a
 * rule here: a rule with no law in the tree is unaccountable, and a copy that lives in this
 * repository enforces whatever the law was on the day it was copied.
 *
 * What this repository does own is the config below - which globs the rules apply to.
 */
import starciFe, {
    recommended as starciRecommended,
    linterOptions as starciLinterOptions,
    starciFeConfig,
} from "@starci/eslint-canon-fe"

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
            // Disposable design evidence is reviewed by its owning workflow and never ships.
            "**/.artifacts/**",
            // sonar-scanner's working directory: it vendors its own JS/TS analyzer bridge
            // bundle underneath here, which is why linting it once ran ESLint out of memory
            // trying to parse SonarQube's bundled compiler as if it were product source.
            "**/.scannerwork/**",
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
        settings: { react: { version: "detect" } },
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
            "react/prop-types": "off",
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
         * The product is being returned to the legacy React/TypeScript hierarchy (leaves,
         * branches, composites, blocks and pages). The installed canon still ships the retired
         * contract law, whose rules require Tree/contract tables and reject the approved cn([...])
         * class composition. Disable only that obsolete law; accessibility, vendor, token,
         * loading, naming and all other canon rules remain enabled at their published levels.
         */
        rules: Object.fromEntries([
            "contract-children-are-typed",
            "no-literal-structural-class",
            "no-interaction-class-in-entry",
            "no-class-composition-outside-contract",
            "contract-why-is-a-reason",
            "no-structural-host-outside-contract-frame",
            "no-structural-arrangement-in-leaf",
            "no-hand-written-contract-attrs",
            "no-unknown-contract-key",
            "no-duplicate-entry-shape",
            "only-the-frame-wears-a-node",
            "no-dead-contract-key",
            "modal-branch-owns-scroll-body",
            "no-children-slot",
            "no-children-prop",
            "no-resting-branch-at-call-site",
            "connected-block-has-presentational-twin",
            "auth-overlay-owns-single-content-host",
        ].map((name) => [`starci-fe/${name}`, "off"])),
    },
    {
        /*
         * Colocated class-name modules are the approved styling boundary. They may import HeroUI's
         * `cn`, but component implementation files remain governed by the vendor ownership rule.
         */
        files: ["src/components/**/classNames.ts"],
        rules: {
            "starci-fe/surface-folder-two-files-only": "off",
            "starci-fe/vendor-boundary": "off",
        },
    },
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
        // Operator scripts are Node programs that never reach a bundle: they read `process.env`
        // and exit with a code, both of which are the point rather than an oversight. Declaring
        // the environment is what keeps `no-undef` meaningful everywhere else - the alternative
        // is silencing the rule per line in the one place a real leak would look identical.
        files: ["scripts/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
    },
    {
        files: ["tests/e2e/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
    },
])
