/**
 * Forbid CSS-door laundering through TypeScript utility types.
 *
 * `Omit<T, "className">` is not closure. It hides one placement door at one call site while
 * the owning component still exposes it to everybody else, and it reads like a fix, which is
 * worse than reading like a hole. The door has to be removed where it is declared.
 *
 * The retired version of this module also policed `NavbarProps` / `FooterProps` inheritance
 * at the layout tier. Those two shells were source-repo components; the invariant they stood
 * for - a layout must not inherit a rendered component's props - is now covered by the slot
 * contract of the registry frame, where a child arrives as a component reference and carries
 * no prop bag at all.
 */

const CSS_DOOR_KEYS = new Set(["className", "classNames"])
const UTILITY_NAMES = new Set(["Omit", "Pick", "Exclude"])

/** True for product TypeScript trees. */
const isProductFile = (filename) => String(filename || "").replace(/\\/g, "/").includes("/src/")

/** Literal string from a TS type node when it is a simple string literal. */
const typeLiteralString = (node) => {
  if (!node) return null
  if (node.type === "TSLiteralType" && node.literal?.type === "Literal" && typeof node.literal.value === "string") {
    return node.literal.value
  }
  return null
}

/** Collect string literals from a union / single literal type used as Omit/Pick keys. */
const collectKeyLiterals = (node, out) => {
  if (!node) return
  if (node.type === "TSUnionType") {
    for (const member of node.types || []) collectKeyLiterals(member, out)
    return
  }
  const lit = typeLiteralString(node)
  if (lit != null) out.push(lit)
}

/** Identifier name from a type reference or expression. */
const typeName = (node) => {
  if (!node) return null
  if (node.type === "TSTypeReference") {
    const name = node.typeName
    if (name?.type === "Identifier") return name.name
    if (name?.type === "TSQualifiedName" && name.right?.type === "Identifier") return name.right.name
  }
  if (node.type === "Identifier") return node.name
  return null
}

/** Report an Omit/Pick/Exclude that names a CSS door among its keys. */
const reportUtilityKeys = (context, reportNode, utilityName, params) => {
  if (!UTILITY_NAMES.has(utilityName) || !params || params.length < 2) return
  const keys = []
  collectKeyLiterals(params[1], keys)
  const hit = keys.find((key) => CSS_DOOR_KEYS.has(key))
  if (!hit) return
  context.report({
    node: reportNode,
    messageId: "utilityHide",
    data: { utility: utilityName, prop: hit },
  })
}

/** ESLint rule: a CSS door is closed where it is declared, not hidden behind a utility type. */
export const noCssDoorTypeLaundering = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid utility-type hiding of className/classNames; the door must be closed at its declaration.",
    },
    schema: [],
    messages: {
      utilityHide:
        "`{{utility}}` of `{{prop}}` is CSS-door laundering, not closure - the owning component still hands `{{prop}}` to every other caller, and this line makes the hole look handled. Remove `{{prop}}` from that component's public props and let the registry key above own placement.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename()
    if (!isProductFile(filename)) return {}

    return {
      TSTypeReference(node) {
        const name = typeName(node)
        if (!UTILITY_NAMES.has(name)) return
        const params = node.typeArguments?.params || node.typeParameters?.params
        reportUtilityKeys(context, node, name, params)
      },

      TSInterfaceHeritage(node) {
        const exprName = node.expression?.type === "Identifier" ? node.expression.name : null
        if (!exprName || !UTILITY_NAMES.has(exprName)) return
        const params = node.typeArguments?.params || []
        reportUtilityKeys(context, node, exprName, params)
      },
    }
  },
}
