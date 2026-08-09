/**
 * Structural host ownership.
 *
 * A `div`, a `section`, a `header` - these are not markup, they are NODES IN A TREE, and
 * in this codebase a node in a tree is described by a registry key. The registry frame is
 * the only file that turns a key into a real element; everywhere else a bare structural
 * host is a node with no key, no child contract and no recorded reason.
 *
 * This replaces the retired `no-host-element-at-sentence-tier`, which allowed the lower
 * tiers to draw structure freely because a dozen per-shape frames lived down there. There
 * is one frame now, so the exemption is one folder.
 */

/** Structural hosts: elements whose whole job is to hold other elements. */
const STRUCTURAL_HOSTS = new Set([
  "div",
  "section",
  "main",
  "header",
  "footer",
  "aside",
  "nav",
])

/** Forward-slash form of a filename. */
const normalize = (filename) => String(filename || "").replace(/\\/g, "/")

/** The one frame that renders a registry entry, and therefore the one that owns hosts. */
export const isRegistryFrameFile = (filename) => normalize(filename).includes("/src/components/frames/Tree/")

/** Product source under `src/`, excluding twin tests which build fixture markup by hand. */
export const isGovernedFile = (filename) => {
  const file = normalize(filename)
  if (!file.includes("/src/")) return false
  if (/\.(?:test|spec)\.(?:ts|tsx|js|jsx)$/.test(file)) return false
  return !isRegistryFrameFile(file)
}

/** Intrinsic (lowercase) tag name, or null for a component. */
const hostName = (opening) => {
  const name = opening?.name
  if (!name || name.type !== "JSXIdentifier") return null
  return name.name === name.name.toLowerCase() ? name.name : null
}

/** ESLint rule: structural hosts come from a registry key, not from hand-written markup. */
export const noStructuralHostOutsideRegistryFrame = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Structural host elements are rendered by the registry frame from a key; product source composes keys instead.",
    },
    schema: [],
    messages: {
      host:
        "`<{{tag}}>` written here is a node with no key: nothing records what classes it should carry, which children belong inside it, or why it exists. Name the shape in `src/components/classNames.tsx` and render it with `<Tree name=\"…\" />` - and if no key fits, that is the finding, not a reason to open a div.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename()
    if (!isGovernedFile(filename)) return {}

    return {
      JSXOpeningElement(node) {
        const tag = hostName(node)
        if (!tag || !STRUCTURAL_HOSTS.has(tag)) return
        context.report({ node, messageId: "host", data: { tag } })
      },
    }
  },
}
