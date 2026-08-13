/**
 * Same PostCSS pipeline as the target: Tailwind v4 through its own plugin, nothing else.
 * Copied rather than imported because PostCSS resolves this file relative to the Next root,
 * and the candidate root is not the target root.
 */
const config = {
    plugins: {
        "@tailwindcss/postcss": {},
    },
}

export default config
