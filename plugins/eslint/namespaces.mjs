/**
 * Runtime namespace enforcement for the FE component tree.
 *
 * Compound component folders are filesystem groupings only. Public members are
 * direct named exports; `ButtonGroup.Root` is not a compatibility API.
 */

const MEMBER_NAMES = new Set([
  "Root",
  "Base",
  "Header",
  "Body",
  "Content",
  "Item",
  "Separator",
  "Footer",
  "Trigger",
  "Title",
  "Description",
  "Cell",
  "Row",
  "List",
  "Single",
  "Multi",
  "Checkbox",
  "Radio",
  "Switch",
  "Backdrop",
  "Container",
  "Dialog",
  "CloseTrigger",
  "Popover",
  "Value",
  "Indicator",
  "ScrollContainer",
  "Column",
  "Heading",
  "Icon",
  "BottomBar",
])

const COMPONENT_NAMES = new Set([
  "AlertDialog",
  "ButtonGroup",
  "Drawer",
  "ListBox",
  "Modal",
  "Page",
  "Select",
  "Table",
])

const unwrap = (node) => {
  if (!node) return null
  if (node.type === "TSAsExpression" || node.type === "TSTypeAssertion") return unwrap(node.expression)
  if (node.type === "ChainExpression") return unwrap(node.expression)
  return node
}

const propertyName = (node) => {
  if (!node || node.type !== "Property") return null
  if (!node.computed && node.key.type === "Identifier") return node.key.name
  if (node.key.type === "Literal" && typeof node.key.value === "string") return node.key.value
  return null
}

const folderNameFor = (filename) => {
  const file = String(filename || "").replace(/\\/g, "/")
  const match = file.match(/\/components\/.+\/([^/]+)\/[^/]+\.(?:ts|tsx|js|jsx|mjs|cjs)$/)
  return match?.[1] ?? null
}

const isCompoundObject = (node) => {
  const expression = unwrap(node)
  if (!expression || expression.type !== "ObjectExpression") return false
  return expression.properties.some((property) => MEMBER_NAMES.has(propertyName(property)))
}

export const noRuntimeNamespace = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Component folders group direct named exports; they must not expose runtime compound namespaces.",
    },
    schema: [],
    messages: {
      export:
        "`{{name}}` is a runtime component namespace. Export its members directly; the folder is only a filesystem grouping.",
      usage:
        "`{{name}}.{{member}}` is a runtime namespace usage. Import `{{name}}{{member}}` (or the direct named export) instead.",
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename()
    const folderName = folderNameFor(filename)
    const vendorNamespaces = new Set()

    const isHeroUiImport = (source) => typeof source === "string" && source.startsWith("@heroui/")

    return {
      ImportDeclaration(node) {
        if (!isHeroUiImport(node.source.value)) return
        for (const specifier of node.specifiers) {
          if (specifier.local?.name && (specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportNamespaceSpecifier")) {
            vendorNamespaces.add(specifier.local.name)
            continue
          }
          if (
            specifier.type === "ImportSpecifier" &&
            specifier.imported?.type === "Identifier" &&
            COMPONENT_NAMES.has(specifier.imported.name)
          ) {
            vendorNamespaces.add(specifier.local.name)
          }
        }
      },

      // `const { Modal, Table } = HeroUI` — treat destructured names as vendor too.
      VariableDeclarator(node) {
        if (
          node.id?.type === "ObjectPattern" &&
          node.init?.type === "Identifier" &&
          vendorNamespaces.has(node.init.name)
        ) {
          for (const property of node.id.properties) {
            if (property.type === "Property" && property.value?.type === "Identifier") {
              vendorNamespaces.add(property.value.name)
            }
          }
        }
      },

      ExportNamedDeclaration(node) {
        const declaration = node.declaration
        if (!folderName || !declaration || declaration.type !== "VariableDeclaration") return
        for (const declarator of declaration.declarations) {
          if (
            declarator.id.type === "Identifier" &&
            declarator.id.name === folderName &&
            isCompoundObject(declarator.init)
          ) {
            context.report({ node: declarator.id, messageId: "export", data: { name: declarator.id.name } })
          }
        }
      },

      JSXMemberExpression(node) {
        const object = node.object?.type === "JSXIdentifier" ? node.object.name : null
        const member = node.property?.type === "JSXIdentifier" ? node.property.name : null
        if (!object || !member) return
        if (COMPONENT_NAMES.has(object) && !vendorNamespaces.has(object)) {
          context.report({ node, messageId: "usage", data: { name: object, member } })
        }
      },

      MemberExpression(node) {
        if (node.computed || node.object.type !== "Identifier" || node.property.type !== "Identifier") return
        const name = node.object.name
        const member = node.property.name
        if (COMPONENT_NAMES.has(name) && !vendorNamespaces.has(name)) {
          context.report({ node, messageId: "usage", data: { name, member } })
        }
      },
    }
  },
}
