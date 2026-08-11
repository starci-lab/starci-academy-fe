/** Names that prove a block reads the world instead of receiving resolved data. */
const WORLD_READER = /^(?:useTranslations|useLocale|useSWR|useSWRMutation|use[A-Za-z0-9]*(?:Swr|Store|Selector)|query[A-Z][A-Za-z0-9]*)$/

/** Modules whose hooks read runtime context rather than only their arguments. */
const WORLD_MODULE = /^(?:next-intl|next\/navigation|next-themes|swr|@\/hooks(?:\/|$))/

/** The block folder and file kind for one source path. */
function blockFile(filename) {
  const file = (filename || "").replace(/\\/g, "/")
  const match = file.match(/\/src\/components\/blocks\/(?:[^/]+\/)*([A-Z][A-Za-z0-9]*)\/(index|component)\.tsx$/)
  return match ? { name: match[1], kind: match[2] } : null
}

/** Local identifier of one JSX opening element. */
function jsxName(node) {
  return node.name?.type === "JSXIdentifier" ? node.name.name : null
}

/**
 * A connected block always delegates every render to its pure `_X` twin.
 *
 * Fetching, translating or reading a store makes `index.tsx` connected even when every situation
 * happens to draw the same leaf. That thin case is the important one: without the split, a visual
 * test needs the request and locale providers, and `isLoading` is decided in the connected file.
 */
export const connectedBlockHasPresentationalTwin = {
  meta: {
    type: "problem",
    docs: {
      description: "A connected block index delegates rendering to an exact `_X` import from component.tsx.",
    },
    schema: [],
    messages: {
      missing:
        "`{{block}}` reads request, locale or store state, so it is connected and must import `{{twin}}` from `./component`. A single leaf, one tree, or no domain state is not an exception.",
      bypass:
        "Connected `{{block}}` renders `<{{rendered}}>` directly. Resolve the world in index.tsx, then render only `<{{twin}}>`; component.tsx owns the pure tree and writes loading down to elements.",
      unused:
        "Connected `{{block}}` imports `{{twin}}` but never renders it. Every connected render path must cross the presentational twin.",
    },
  },
  create(context) {
    const target = blockFile(context.filename || context.getFilename())
    if (!target || target.kind !== "index") return {}

    const twin = `_${target.name}`
    const worldBindings = new Set()
    const renderedNames = []
    let importsTwin = false
    let readsWorld = false
    let rendersTwin = false

    return {
      ImportDeclaration(node) {
        if (node.source?.value === "./component") {
          for (const specifier of node.specifiers || []) {
            const imported = specifier.imported?.name
            const local = specifier.local?.name
            if (imported === twin && local === twin) importsTwin = true
          }
        }

        const source = typeof node.source?.value === "string" ? node.source.value : ""
        for (const specifier of node.specifiers || []) {
          const imported = specifier.imported?.name
          const local = specifier.local?.name
          if (imported && local && (WORLD_READER.test(imported) || (WORLD_MODULE.test(source) && /^use[A-Z]/.test(imported)))) {
            worldBindings.add(local)
          }
        }
      },
      CallExpression(node) {
        if (node.callee?.type !== "Identifier") return
        if (worldBindings.has(node.callee.name) || WORLD_READER.test(node.callee.name)) readsWorld = true
      },
      JSXOpeningElement(node) {
        const name = jsxName(node)
        if (!name) return
        renderedNames.push({ name, node })
        if (name === twin) rendersTwin = true
      },
      "Program:exit"(node) {
        if (!readsWorld) return
        if (!importsTwin) {
          context.report({ node, messageId: "missing", data: { block: target.name, twin } })
          return
        }

        for (const rendered of renderedNames) {
          if (rendered.name === twin) continue
          context.report({
            node: rendered.node,
            messageId: "bypass",
            data: { block: target.name, rendered: rendered.name, twin },
          })
        }

        if (!rendersTwin) {
          context.report({ node, messageId: "unused", data: { block: target.name, twin } })
        }
      },
    }
  },
}
