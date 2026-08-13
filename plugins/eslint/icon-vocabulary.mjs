/** Heroicons vocabulary rules for product source. */

/** Forward-slash form so Windows and POSIX paths obey the same boundary. */
const normalizePath = (filename) => String(filename || "").replace(/\\/g, "/")

/** The only module allowed to name concrete glyph components. */
const ICON_MODULE = "/src/components/leaves/Icon/index.tsx"

/** Rank artwork is the one closed Fluent Emoji catalogue boundary. */
const RANK_MARK_MODULE = "/src/components/leaves/RankMark/index.tsx"

/** Known general-purpose glyph package roots, matched through subpaths. */
const GLYPH_PACKAGES = [
  "@heroicons/",
  "@phosphor-icons/",
  "lucide-react",
  "react-icons",
  "@tabler/icons",
  "@fortawesome/",
  "@mui/icons-material",
  "@fluentui/react-icons",
  "iconsax-react",
  "react-feather",
]

/** Package-name signal for a glyph catalogue not yet listed explicitly. */
const GLYPH_PACKAGE_NAME = /(?:icon|glyph|lucide|feather|tabler|fortawesome)/i

/** The exact Heroicon families selected for heading/leading and chip roles. */
const ALLOWED_HEROICON_FAMILIES = new Set([
  "@heroicons/react/24/outline",
  "@heroicons/react/16/solid",
])

/** True when an import reaches any known glyph package, including a subpath. */
const isGlyphPackage = (source) => {
  const value = typeof source === "string" ? source : ""
  const isExternalPackage = value !== "" && !value.startsWith(".") && !value.startsWith("@/")
  return GLYPH_PACKAGES.some((root) => value === root || value.startsWith(root)) ||
    (isExternalPackage && GLYPH_PACKAGE_NAME.test(value))
}

/** Callers name meanings; only the Icon leaf names vendor glyphs. */
export const noVendorIconOutsideIconLeaf = {
  meta: {
    type: "problem",
    docs: { description: "Only the Icon leaf imports glyph packages." },
    schema: [],
    messages: {
      vendor:
        "`{{source}}` is a glyph package imported outside the Icon leaf. Pass an Icon meaning and role; the leaf owns vendor, glyph, family and size.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!file.includes("/src/")) return {}
    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value
        if (!isGlyphPackage(source)) return
        if (file.endsWith(ICON_MODULE)) return
        if (file.endsWith(RANK_MARK_MODULE) && source === "@iconify/react") return
        context.report({ node, messageId: "vendor", data: { source } })
      },
    }
  },
}

/** The Icon leaf may use only 24 outline and 16 solid micro Heroicons. */
export const heroiconsFamiliesAreClosed = {
  meta: {
    type: "problem",
    docs: { description: "The Icon leaf uses only the selected Heroicon families." },
    schema: [],
    messages: {
      family:
        "`{{source}}` is outside the closed Heroicons families. Use 24 outline for heading/leading, or 16 solid micro for chip; do not add another vendor, mini family or solid heading family.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!file.endsWith(ICON_MODULE)) return {}
    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value
        if (!isGlyphPackage(source) || ALLOWED_HEROICON_FAMILIES.has(String(source))) return
        context.report({ node, messageId: "family", data: { source } })
      },
    }
  },
}
