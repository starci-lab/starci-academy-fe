/**
 * Public house-component contract rules.
 *
 * A public StarCi component owns its intrinsic appearance; where it SITS is decided by the
 * registry key of the node above it, never by a `className` handed in from outside. That is
 * why the new registry is named `classNames` and is still not a CSS door: a component
 * passes a KEY, and the key already carries the class string.
 *
 * The retired version of this rule kept two boundaries - `frames/Box` as a documented
 * foreign-mount escape hatch, and the vendor-wrapper atoms. Both are gone here. This is a
 * greenfield tree with no legacy call sites to migrate, and an escape hatch that exists
 * before anyone needs it is just the door with a nicer name; a genuine vendor boundary can
 * be opened later, once, with an eslint-disable and the reason written next to it.
 */

const HOUSE_IMPORT = /(?:^|\/)components\//
const PUBLIC_COMPONENT_FILE = /\/components\//
const FORBIDDEN_PROPS = new Set(["className", "classNames"])

const sourceValue = (node) => (node?.value == null ? "" : String(node.value).replace(/\\/g, "/"))

/** True for a file inside the component tree, where the public prop surface is declared. */
const isPublicComponentFile = (filename) => PUBLIC_COMPONENT_FILE.test(String(filename || "").replace(/\\/g, "/"))

/** True for product source; tooling and config are out of scope. */
const isProductFile = (filename) => String(filename || "").replace(/\\/g, "/").includes("/src/")

const propertyName = (node) => {
  if (!node) return null
  const key = node.key ?? node.property
  if (!key) return null
  if (key.type === "Identifier") return key.name
  if (key.type === "Literal" && typeof key.value === "string") return key.value
  return null
}

const reportPattern = (pattern, report) => {
  if (!pattern) return
  if (pattern.type === "ObjectPattern") {
    for (const property of pattern.properties || []) {
      if (property.type === "RestElement") {
        reportPattern(property.argument, report)
        continue
      }
      const name = propertyName(property)
      if (FORBIDDEN_PROPS.has(name)) report(property, name)
    }
  }
}

/** ESLint rule: no public className/classNames door on a house component. */
export const noPublicClassNameProp = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Public StarCi components must not expose className/classNames placement doors; the registry key of the node above owns placement.",
    },
    schema: [],
    messages: {
      declaration:
        "Public house component prop `{{prop}}` is forbidden. Placement belongs to the registry key of the node above this one, and appearance belongs to this component - a prop that accepts either takes the decision out of both places. Expose a semantic variant instead.",
      usage:
        "Do not pass `{{prop}}` to house component `{{component}}`. Whatever this string is adjusting is a real distinction: name it as a registry key on the parent node, or as a variant on `{{component}}`.",
      withClassNames:
        "`WithClassNames<...>` re-opens the CSS door through a type. The registry named `classNames` hands out KEYS, not class strings - replace this with a semantic API.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename()
    if (!isProductFile(filename)) return {}
    const enforceDeclarations = isPublicComponentFile(filename)

    const houseBindings = new Set()
    const reportProp = (node, prop) => context.report({ node, messageId: "declaration", data: { prop } })

    return {
      ImportDeclaration(node) {
        const source = sourceValue(node.source)
        if (!HOUSE_IMPORT.test(source)) return
        for (const specifier of node.specifiers || []) {
          if (!specifier.local?.name) continue
          houseBindings.add(specifier.local.name)
        }
      },

      TSPropertySignature(node) {
        if (!enforceDeclarations) return
        const name = propertyName(node)
        if (FORBIDDEN_PROPS.has(name)) reportProp(node, name)
      },

      TSInterfaceDeclaration(node) {
        if (!enforceDeclarations) return
        for (const heritage of node.extends || []) {
          const name = heritage.expression?.type === "Identifier" ? heritage.expression.name : null
          if (name === "WithClassNames") context.report({ node: heritage, messageId: "withClassNames" })
        }
      },

      TSTypeReference(node) {
        if (!enforceDeclarations) return
        if (node.typeName?.type === "Identifier" && node.typeName.name === "WithClassNames") {
          context.report({ node, messageId: "withClassNames" })
        }
      },

      ArrowFunctionExpression(node) {
        if (!enforceDeclarations) return
        for (const parameter of node.params || []) {
          reportPattern(parameter, reportProp)
        }
      },

      FunctionDeclaration(node) {
        if (!enforceDeclarations) return
        for (const parameter of node.params || []) {
          reportPattern(parameter, reportProp)
        }
      },

      FunctionExpression(node) {
        if (!enforceDeclarations) return
        for (const parameter of node.params || []) {
          reportPattern(parameter, reportProp)
        }
      },

      JSXOpeningElement(node) {
        const component = node.name?.type === "JSXIdentifier" ? node.name.name : null
        if (!component || !houseBindings.has(component)) return
        for (const attribute of node.attributes || []) {
          if (attribute.type !== "JSXAttribute") continue
          const prop = attribute.name?.type === "JSXIdentifier" ? attribute.name.name : null
          if (FORBIDDEN_PROPS.has(prop)) {
            context.report({ node: attribute, messageId: "usage", data: { prop, component } })
          }
        }
      },
    }
  },
}
