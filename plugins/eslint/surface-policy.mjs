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

/** TextLink delegates link interaction and hover treatment to HeroUI Link. */
export const textLinkUsesHeroLink = {
  meta: {
    type: "problem",
    docs: { description: "TextLink wraps HeroUI Link instead of hand-drawing link behavior." },
    schema: [],
    messages: {
      missing: "TextLink must import HeroUI `Link`. The vendor owns link hover, focus and interaction states.",
      handmade: "Do not rebuild a HeroUI Link with a raw button or local className. Wrap HeroUI `Link` and pass `onPress`.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!/\/src\/components\/leaves\/TextLink\/index\.tsx$/.test(file)) return {}
    let hasHeroLink = false
    return {
      ImportDeclaration(node) {
        if (node.source?.value !== "@heroui/react") return
        hasHeroLink ||= (node.specifiers || []).some((specifier) => specifier.imported?.name === "Link")
      },
      JSXOpeningElement(node) {
        if (node.name?.type === "JSXIdentifier" && node.name.name === "button") {
          context.report({ node, messageId: "handmade" })
        }
        if ((node.attributes || []).some((attribute) => attribute.type === "JSXAttribute" && attribute.name?.name === "className")) {
          context.report({ node, messageId: "handmade" })
        }
      },
      "Program:exit"(node) {
        if (!hasHeroLink) context.report({ node, messageId: "missing" })
      },
    }
  },
}

/** The navbar account control opens one HeroUI dropdown before choosing an auth journey. */
export const accountControlOwnsDropdown = {
  meta: {
    type: "problem",
    docs: { description: "AccountMenu owns HeroUI Dropdown and ShellNav does not open auth directly." },
    schema: [],
    messages: {
      dropdown: "AccountMenu must import HeroUI `Dropdown`; the account trigger opens the guest menu before any authentication surface.",
      menu: "ShellNav must render AccountMenu for a guest account control.",
      direct: "The account IconButton may not carry an action in ShellNav. Guests open AccountMenu; its Sign in or Sign up choice opens the modal.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    const isMenu = /\/src\/components\/leaves\/AccountMenu\/index\.tsx$/.test(file)
    const isShell = /\/src\/components\/layouts\/ShellNav\/component\.tsx$/.test(file)
    if (!isMenu && !isShell) return {}
    let hasOwner = false
    return {
      ImportDeclaration(node) {
        if (isMenu && node.source?.value === "@heroui/react") {
          hasOwner ||= (node.specifiers || []).some((specifier) => specifier.imported?.name === "Dropdown")
        }
        if (isShell && /\/components\/leaves\/AccountMenu$/.test(normalizePath(node.source?.value))) {
          hasOwner = true
        }
      },
      JSXOpeningElement(node) {
        if (!isShell || node.name?.type !== "JSXIdentifier" || node.name.name !== "IconButton") return
        const props = (node.attributes || []).find((attribute) => attribute.type === "JSXAttribute" && attribute.name?.name === "props")
        const expression = props?.value?.type === "JSXExpressionContainer" ? props.value.expression : null
        const isAccount = expression?.type === "ObjectExpression" && expression.properties.some((property) =>
          property.type === "Property" && property.key?.name === "icon" && property.value?.value === "account")
        const hasAction = (node.attributes || []).some((attribute) => attribute.type === "JSXAttribute" && attribute.name?.name === "on")
        if (isAccount && hasAction) context.report({ node, messageId: "direct" })
      },
      "Program:exit"(node) {
        if (hasOwner) return
        context.report({ node, messageId: isMenu ? "dropdown" : "menu" })
      },
    }
  },
}

/** The auth overlay projects one already-owned column and adds no vertical inset of its own. */
export const authOverlayOwnsSingleContentHost = {
  meta: {
    type: "problem",
    docs: { description: "Authentication has one zero-inset content host inside ModalShell." },
    schema: [],
    messages: {
      duplicate: "SignInOverlay must project with `ContractContent`, not open another `Tree` around a panel that already owns the same host.",
      missing: "SignInOverlay must import `ContractContent` for its already-hosted projection.",
      inset: "`centred-page-column` must not add py/pt/pb. ModalShell is zero-inset and the auth content touches that scroll region without a second vertical padding band.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    const isOverlay = /\/src\/components\/overlays\/auth\/SignInOverlay\/component\.tsx$/.test(file)
    const isContracts = /\/src\/components\/contracts\/index\.ts$/.test(file)
    if (!isOverlay && !isContracts) return {}
    let hasContent = false
    return {
      ImportDeclaration(node) {
        if (!isOverlay || !/\/components\/branches\/Tree$/.test(normalizePath(node.source?.value))) return
        for (const specifier of node.specifiers || []) {
          if (specifier.imported?.name === "ContractContent") hasContent = true
          if (specifier.imported?.name === "Tree") context.report({ node: specifier, messageId: "duplicate" })
        }
      },
      Property(node) {
        if (!isContracts) return
        const key = node.key?.type === "Literal" ? node.key.value : node.key?.name
        if (key !== "centred-page-column") return
        const source = context.sourceCode || context.getSourceCode()
        if (/["'`](?:py|pt|pb)-/.test(source.getText(node))) context.report({ node, messageId: "inset" })
      },
      "Program:exit"(node) {
        if (isOverlay && !hasContent) context.report({ node, messageId: "missing" })
      },
    }
  },
}
