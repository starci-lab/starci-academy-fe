/** Heroicons vocabulary rules for product source. */

/** Forward-slash form so Windows and POSIX paths obey the same boundary. */
const normalizePath = (filename) => String(filename || "").replace(/\\/g, "/")

/** The only folder allowed to name concrete glyph components. */
const ICON_LEAF = "/src/components/leaves/Icon/"

/** Known general-purpose glyph package roots, matched through subpaths. */
const GLYPH_PACKAGES = [
  "@heroicons/",
  "@phosphor-icons/",
  "lucide-react",
  "react-icons",
  "@tabler/icons",
  "@fortawesome/",
]

/** The exact Heroicon families selected for heading/leading and chip roles. */
const ALLOWED_HEROICON_FAMILIES = new Set([
  "@heroicons/react/24/outline",
  "@heroicons/react/16/solid",
])

/** True when an import reaches any known glyph package, including a subpath. */
const isGlyphPackage = (source) => {
  const value = typeof source === "string" ? source : ""
  return GLYPH_PACKAGES.some((root) => value === root || value.startsWith(root))
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
    if (!file.includes("/src/") || file.includes(ICON_LEAF)) return {}
    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value
        if (!isGlyphPackage(source)) return
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
    if (!file.includes(ICON_LEAF)) return {}
    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value
        if (!isGlyphPackage(source) || ALLOWED_HEROICON_FAMILIES.has(String(source))) return
        context.report({ node, messageId: "family", data: { source } })
      },
    }
  },
}
