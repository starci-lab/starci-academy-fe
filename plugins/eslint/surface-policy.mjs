/** Mechanical guards for bounded surfaces and the primitives drawn on them. */

const normalizePath = (value) => String(value || "").replace(/\\/g, "/")

const memberName = (node) => {
  if (node?.type !== "JSXMemberExpression") return null
  if (node.object?.type !== "JSXIdentifier" || node.property?.type !== "JSXIdentifier") return null
  return `${node.object.name}.${node.property.name}`
}

/** ModalShell passes its uninterpreted interior directly to Dialog instead of deciding its shape. */
export const modalShellPassesContentDirectly = {
  meta: {
    type: "problem",
    docs: { description: "ModalShell must not force arbitrary content through Modal.Body." },
    schema: [],
    messages: {
      body:
        "ModalShell is content-agnostic, so wrapping every child in `Modal.Body` is an interior-shape decision. Pass `children` directly to `Modal.Dialog`; the mounted content owns its arrangement.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!/\/src\/components\/shells\/ModalShell\/index\.tsx$/.test(file)) return {}
    return {
      JSXOpeningElement(node) {
        if (memberName(node.name) === "Modal.Body") context.report({ node, messageId: "body" })
      },
    }
  },
}

/** The house Field uses HeroUI's inset surface variant, not another bordered ground. */
export const fieldInputUsesSecondaryVariant = {
  meta: {
    type: "problem",
    docs: { description: "The Field leaf uses the secondary input variant on a bounded surface." },
    schema: [],
    messages: {
      variant:
        "The house Field sits inside a bounded form surface. Its HeroUI Input must use `variant=\"secondary\"`; the default variant draws a competing field surface.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!/\/src\/components\/leaves\/Field\/index\.tsx$/.test(file)) return {}
    const inputBindings = new Set()
    return {
      ImportDeclaration(node) {
        if (node.source?.value !== "@heroui/react") return
        for (const specifier of node.specifiers || []) {
          if (specifier.imported?.name === "Input" && specifier.local?.name) {
            inputBindings.add(specifier.local.name)
          }
        }
      },
      JSXOpeningElement(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null
        if (!name || !inputBindings.has(name)) return
        const variant = (node.attributes || []).find((attribute) =>
          attribute.type === "JSXAttribute"
          && attribute.name?.type === "JSXIdentifier"
          && attribute.name.name === "variant")
        if (variant?.value?.type === "Literal" && variant.value.value === "secondary") return
        context.report({ node, messageId: "variant" })
      },
    }
  },
}

/** An overlay is already bounded, so its own file may not mount a second surface branch. */
export const noSurfaceBranchInOverlay = {
  meta: {
    type: "problem",
    docs: { description: "Forbid named surface branches directly inside overlays." },
    schema: [],
    messages: {
      nested:
        "This overlay is already the bounded surface. Do not mount `{{surface}}` inside it; use headings, spacing, rows and controls directly.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!file.includes("/src/components/overlays/")) return {}
    return {
      ImportDeclaration(node) {
        const source = normalizePath(node.source?.value)
        const match = source.match(/\/components\/branches\/(SurfaceCard|SurfaceAccordionCard|SurfaceListCard)$/)
        if (match) context.report({ node, messageId: "nested", data: { surface: match[1] } })
      },
    }
  },
}
