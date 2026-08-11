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

/**
 * Heading elements. They are not structural hosts - they are a LEAF with two facts welded
 * together, the tag a screen reader builds the outline from and the size a reader sees - so
 * they get their own rule and their own owner: the `Heading` atom, whose `level` prop is the
 * one word that decides both. Written by hand, the two facts are set separately and drift.
 */
const HEADING_ELEMENTS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

/** The deepest level the `Heading` atom draws; below this a page has nested too far. */
const DEEPEST_HEADING_LEVEL = 4

/** Forward-slash form of a filename. */
const normalize = (filename) => String(filename || "").replace(/\\/g, "/")

/** Frames that apply registry props to real hosts, including the three vendor-surface branches. */
export const isRegistryFrameFile = (filename) => /\/src\/components\/branches\/(?:Tree|SurfaceCard|SurfaceAccordionCard|SurfaceListCard)\//.test(normalize(filename))

/**
 * A LEAF - an atom, or a fixed cluster of atoms.
 *
 * A leaf owns its own interior, including the element it opens and the seam between its parts.
 * That interior is the same everywhere and forever, so there is nothing for the registry to tune
 * and nothing for this rule to send back to it.
 *
 * THIS EXEMPTION IS A FOLDER, so it is a POLICY boundary and not a type: anyone can escape the
 * rule by filing a component here. What keeps a region out is the question a reader asks - would
 * fixing this interior force a contract per call site? If yes it is a branch, and it belongs to
 * the registry. No gate asks that question.
 */
export const isLeafFile = (filename) => normalize(filename).includes("/src/components/leaves/")

/** Product source under `src/`, excluding twin tests which build fixture markup by hand. */
export const isGovernedFile = (filename) => {
  const file = normalize(filename)
  if (!file.includes("/src/")) return false
  if (/\.(?:test|spec)\.(?:ts|tsx|js|jsx)$/.test(file)) return false
  if (isLeafFile(file)) return false
  return !isRegistryFrameFile(file)
}

/** The leaf that owns every heading, and therefore the one file allowed to write the tags. */
export const isHeadingAtomFile = (filename) => normalize(filename).includes("/src/components/leaves/Heading/")

/**
 * Product source under `src/` that must go through the atom.
 *
 * Wider than {@link isGovernedFile} by exactly one file: the registry frame is exempt from the
 * structural-host rule because it renders `div`/`nav`/`section` FROM a key, and no key names a
 * heading - so the frame has no more business writing `<h2>` by hand than a block does.
 */
export const isHeadingGovernedFile = (filename) => {
  const file = normalize(filename)
  if (!file.includes("/src/")) return false
  if (/\.(?:test|spec)\.(?:ts|tsx|js|jsx)$/.test(file)) return false
  return !isHeadingAtomFile(file)
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
        "`<{{tag}}>` written here is a node with no key: nothing records what classes it should carry, which children belong inside it, or why it exists. Name the shape in `src/components/contracts/shapes.ts` and render it with `<Tree contract=\"…\" />` - and if no key fits, that is the finding, not a reason to open a div.",
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

/**
 * ESLint rule: a heading is drawn by the `Heading` atom, never by its tag.
 *
 * `<h2>` written by hand sets the outline level and leaves the size to whatever the page
 * happens to inherit, which is how a screen's third-largest text ends up being its first
 * heading. The atom takes ONE prop, `level`, and derives both from it, so the two facts have
 * no way to disagree - and it carries the resting state, which hand-written markup also
 * throws away. This is the twin of `no-structural-host-outside-registry-frame`: that rule
 * sends a node back to the registry, this one sends a leaf back to its atom.
 */
export const noHeadingElementOutsideHeadingAtom = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Heading elements are rendered by the Heading atom from a `level` prop; product source never writes the tag.",
    },
    schema: [],
    messages: {
      heading:
        "`<{{tag}}>` written here throws away the two things the `Heading` atom exists to keep together: the tag a screen reader builds the document outline from, and the size a reader sees. Render `<Heading level={{{level}}}>` from `@/components/atoms/Heading` instead - `level` drives BOTH, so the outline and the visual order cannot drift, and the atom already knows how to rest.",
      tooDeep:
        "`<{{tag}}>` is deeper than the `Heading` atom goes: `level` stops at {{deepest}}, because a fifth level means the page has nested further than a reader can hold. That is a structure problem rather than a style one - flatten the section, then render the title with `<Heading level={...}>` from `@/components/atoms/Heading`.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename()
    if (!isHeadingGovernedFile(filename)) return {}

    return {
      JSXOpeningElement(node) {
        const tag = hostName(node)
        if (!tag || !HEADING_ELEMENTS.has(tag)) return
        const level = Number(tag.slice(1))
        if (level > DEEPEST_HEADING_LEVEL) {
          context.report({ node, messageId: "tooDeep", data: { tag, deepest: DEEPEST_HEADING_LEVEL } })
          return
        }
        context.report({ node, messageId: "heading", data: { tag, level } })
      },
    }
  },
}
