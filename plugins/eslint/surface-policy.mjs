/** Mechanical guards for bounded surfaces and the primitives drawn on them. */

const normalizePath = (value) => String(value || "").replace(/\\/g, "/")

const memberName = (node) => {
  if (node?.type !== "JSXMemberExpression") return null
  if (node.object?.type !== "JSXIdentifier" || node.property?.type !== "JSXIdentifier") return null
  return `${node.object.name}.${node.property.name}`
}

/** ModalShell owns one zero-inset vendor body so long content keeps the vendor scroll mechanics. */
export const modalShellOwnsScrollBody = {
  meta: {
    type: "problem",
    docs: { description: "ModalShell keeps one zero-inset Modal.Body as its scroll region." },
    schema: [],
    messages: {
      missing:
        "ModalShell must keep one `Modal.Body` around its uninterpreted children: that vendor body is the dialog's scroll region, not a second content surface.",
      inset:
        "ModalShell's body must be `className=\"p-0\"`. The mounted contract owns layout; vendor body padding plus contract padding creates a doubled inset.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!/\/src\/components\/shells\/ModalShell\/index\.tsx$/.test(file)) return {}
    let hasBody = false
    return {
      JSXOpeningElement(node) {
        if (memberName(node.name) !== "Modal.Body") return
        hasBody = true
        const className = (node.attributes || []).find((attribute) =>
          attribute.type === "JSXAttribute"
          && attribute.name?.type === "JSXIdentifier"
          && attribute.name.name === "className")
        if (className?.value?.type === "Literal" && className.value.value === "p-0") return
        context.report({ node, messageId: "inset" })
      },
      "Program:exit"(node) {
        if (!hasBody) context.report({ node, messageId: "missing" })
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

/** Field labels stay textual; the source form uses no decorative kind glyph before the label. */
export const fieldLabelIsTextOnly = {
  meta: {
    type: "problem",
    docs: { description: "Forbid Icon inside the house Field label." },
    schema: [],
    messages: {
      icon:
        "Field labels are text-only in the source design. Do not infer a decorative icon from the input kind; an icon belongs only to a control with its own action, such as password visibility.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!/\/src\/components\/leaves\/Field\/index\.tsx$/.test(file)) return {}
    return {
      ImportDeclaration(node) {
        const source = normalizePath(node.source?.value)
        if (/\/components\/leaves\/Icon$/.test(source)) context.report({ node, messageId: "icon" })
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
