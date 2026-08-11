/**
 * The rules that enforce the NAMED REGISTRY.
 *
 * One idea, stated six ways: a structural node is described ONCE, in
 * `src/components/contracts/shapes.ts`, by a key that owns both the node's classes and the
 * contract for its children. An author types the key and nothing else. Everything below
 * exists to make the alternatives - a literal class string, a hand-composed class, a
 * hand-painted registry attribute, an invented key, an invented child role - stop
 * compiling in review the way a wrong tree already stops compiling in TypeScript.
 *
 * These replace the retired `principle` / `PrincipleToken` / `data-principle` rules. That
 * token described one node and left the author to guess the classes, the children and
 * whether a wrapper was needed; the registry answers all three, so the rules that policed
 * the guessing had nothing left to police.
 */
import { isRegistryFile, normalizePath, readRegistry } from "./registry.mjs"

/** A twin test may build fixture markup by hand; product source may not. */
const isTestFile = (file) => /\.(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(file)

/** Product source lives under `src/`; tooling and config are out of scope. */
const isSourceFile = (file) => file.includes("/src/")

/** The one frame allowed to render a registry entry, and therefore to paint its markers. */
const isRegistryFrameFile = (file) => file.includes("/src/components/branches/Tree/")

/**
 * A LEAF owns its own interior, including its structural classes: the interior is fixed, so there
 * is nothing for the registry to share or tune. The exemption is a folder, which makes it policy
 * rather than type - see the same constant in `registry.mjs`.
 */
const isLeafFile = (file) => file.includes("/src/components/leaves/")

/** Class tokens that decide the SHAPE of a tree rather than the look of one leaf. */
const STRUCTURAL_EXACT = new Set([
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "contents",
  "absolute",
  "relative",
  "fixed",
  "sticky",
])

/** Prefixed families that are equally structural (`gap-4`, `items-center`, `col-span-2`). */
const STRUCTURAL_PREFIX = /^(?:flex-|grid-cols-|grid-rows-|col-|row-|gap-|items-|justify-|content-|place-|self-|order-|space-x-|space-y-|divide-|overflow-|inset-|top-|right-|bottom-|left-|z-|basis-|shrink|grow)/

/** Helpers that assemble a class string at runtime. */
const CLASS_COMPOSERS = new Set(["cn", "clsx", "classnames", "classNames", "twMerge", "twJoin", "cva", "tv"])

/** Markers the registry frame paints from the entry it renders. */
const REGISTRY_ATTRS = new Set(["data-node", "data-why"])

/** Strip responsive/state variants and the important marker: `lg:hover:!flex` -> `flex`. */
const bareToken = (token) => {
  const withoutVariant = token.includes(":") ? token.slice(token.lastIndexOf(":") + 1) : token
  return withoutVariant.replace(/^!/, "")
}

/** The first structural token in a class string, or null when the string only styles a leaf. */
const structuralToken = (text) => {
  for (const raw of String(text).trim().split(/\s+/).filter(Boolean)) {
    const token = bareToken(raw)
    if (STRUCTURAL_EXACT.has(token) || STRUCTURAL_PREFIX.test(token)) return token
  }
  return null
}

/** True for a `className` / `class` JSX attribute. */
const isClassAttribute = (node) =>
  node.type === "JSXAttribute" && node.name && (node.name.name === "className" || node.name.name === "class")

/** Static string carried by a JSX attribute (literal, or a template with no holes). */
const staticAttributeText = (node) => {
  const value = node && node.value
  if (!value) return null
  if (value.type === "Literal" && typeof value.value === "string") return value.value
  if (value.type === "JSXExpressionContainer") {
    const expression = value.expression
    if (expression.type === "Literal" && typeof expression.value === "string") return expression.value
    if (expression.type === "TemplateLiteral" && expression.expressions.length === 0) {
      return expression.quasis.map((quasi) => quasi.value.cooked).join(" ")
    }
  }
  return null
}

/** JSX element name, including `Foo.Bar`. */
const jsxElementName = (opening) => {
  const name = opening && opening.name
  if (!name) return null
  if (name.type === "JSXIdentifier") return name.name
  if (name.type === "JSXMemberExpression" && name.object && name.property) {
    return `${name.object.name}.${name.property.name}`
  }
  return null
}

/** Static string value of a named attribute on an opening element. */
const attributeText = (opening, attributeName) => {
  const attribute = (opening.attributes || []).find(
    (candidate) => candidate.type === "JSXAttribute" && candidate.name && candidate.name.name === attributeName,
  )
  return attribute ? staticAttributeText(attribute) : null
}

/** Property key as a plain string, for non-computed identifier / string keys. */
const propertyName = (node) => {
  if (!node || node.type !== "Property" || node.computed) return null
  if (node.key.type === "Identifier") return node.key.name
  if (node.key.type === "Literal" && typeof node.key.value === "string") return node.key.value
  return null
}

/**
 * A structural node takes its classes from a registry KEY, never from a literal class
 * string written at the call site. This is the heart of the pattern: the moment a caller
 * can type `flex gap-3`, the tree is decided in as many places as there are call sites,
 * and nothing above can be predicted from the key any more.
 */
export const noLiteralStructuralClass = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Structural classes come from a registry key in `src/components/contracts/shapes.ts`, never from a literal class string.",
    },
    schema: [],
    messages: {
      structural:
        "`{{cls}}` is a structural class written as a literal, so this node's shape is decided here instead of in the registry. Add or reuse a key in `src/components/contracts/shapes.ts` and render it with `<Tree contract=\"…\" slots={…} />`. The key already owns the classes AND the children that node accepts - typing it is the only layout decision there is.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isSourceFile(file) || isRegistryFile(file) || isTestFile(file) || isLeafFile(file)) return {}
    return {
      JSXAttribute(node) {
        if (!isClassAttribute(node)) return
        const text = staticAttributeText(node)
        if (!text) return
        const hit = structuralToken(text)
        if (hit) context.report({ node, messageId: "structural", data: { cls: hit } })
      },
    }
  },
}

/**
 * Composing a class string at runtime is the same escape hatch wearing a function call.
 * `cn(base, isActive && "gap-4")` is a second registry with no keys, no roles and no
 * reasons - unreadable from the outside and unpredictable from the key.
 */
export const noClassCompositionOutsideRegistry = {
  meta: {
    type: "problem",
    docs: {
      description: "Class strings are not assembled at runtime; a registry key already carries the whole class string.",
    },
    schema: [],
    messages: {
      composer:
        "`{{name}}(…)` assembles a class string at runtime - a second registry with no keys, no roles and no reasons. The difference you are branching on is a real distinction: give it a registry key, or a named prop on the component that owns the node.",
      interpolated:
        "`className` is built by interpolation, so the class string exists only while this component runs and nothing can read it back. Move the whole string into a registry key in `src/components/contracts/shapes.ts` and pass the key.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isSourceFile(file) || isRegistryFile(file) || isTestFile(file) || isLeafFile(file)) return {}
    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee && callee.type === "Identifier" && CLASS_COMPOSERS.has(callee.name)) {
          context.report({ node, messageId: "composer", data: { name: callee.name } })
        }
      },
      JSXAttribute(node) {
        if (!isClassAttribute(node)) return
        const value = node.value
        if (!value || value.type !== "JSXExpressionContainer") return
        const expression = value.expression
        const interpolated =
          (expression.type === "TemplateLiteral" && expression.expressions.length > 0) ||
          (expression.type === "BinaryExpression" && expression.operator === "+")
        if (interpolated) context.report({ node, messageId: "interpolated" })
      },
    }
  },
}

/**
 * `data-node` / `data-roles` / `data-explain` are painted by the registry frame from the
 * entry it is rendering. Hand-writing them makes a node CLAIM a contract it is not held
 * to - the worst possible failure, because every reader and every test then trusts it.
 */
export const noHandWrittenRegistryAttrs = {
  meta: {
    type: "problem",
    docs: {
      description: "Registry markers are emitted by the registry frame, never hand-written on a host element.",
    },
    schema: [],
    messages: {
      marker:
        "`{{attr}}` is a registry marker painted by `<Tree>` from the entry it renders. Written by hand it claims a contract nothing enforces, and the node reads as registry-owned to every test that walks these attributes. Render the key instead of describing it.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isSourceFile(file) || isRegistryFrameFile(file) || isTestFile(file)) return {}
    return {
      JSXAttribute(node) {
        const name = node.name && node.name.type === "JSXIdentifier" ? node.name.name : null
        if (!name || !REGISTRY_ATTRS.has(name)) return
        context.report({ node, messageId: "marker", data: { attr: name } })
      },
    }
  },
}

/**
 * A key that is not in the registry describes nothing. TypeScript already rejects it at a
 * typed call site; this rule catches the same mistake where the type has been widened or
 * asserted away, and answers it with the list of keys that DO exist.
 */
export const noUnregisteredTreeKey = {
  meta: {
    type: "problem",
    docs: { description: "`<Tree contract>` and `contractSpec()` take a key that exists in the registry." },
    schema: [],
    messages: {
      unknown:
        "`{{key}}` is not a registry key, so it describes no classes and no reason. Existing keys: {{keys}}. A new key is justified by a node shape none of these express - never by wanting a different gap - and its NAME must fix what goes inside it, or it stops constraining anything.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isSourceFile(file)) return {}
    const registry = readRegistry(file)
    if (!registry) return {}
    const report = (node, key) => {
      if (registry.keys.includes(key)) return
      context.report({ node, messageId: "unknown", data: { key, keys: registry.keys.join(", ") } })
    }
    return {
      JSXOpeningElement(node) {
        if (jsxElementName(node) !== "Tree") return
        const key = attributeText(node, "contract")
        if (key) report(node, key)
      },
      CallExpression(node) {
        if (!node.callee || node.callee.type !== "Identifier" || node.callee.name !== "contractSpec") return
        const argument = node.arguments[0]
        if (argument && argument.type === "Literal" && typeof argument.value === "string") {
          report(argument, argument.value)
        }
      },
    }
  },
}

/**
 * The children of a registry node are constrained by ROLE, and the roles are the ones the
 * key declares - no more, no fewer. Constraining by concrete component type would force a
 * key per children-combination until the vocabulary exploded; the roles keep it at nine.
 */
export const noUnknownSlotRole = {
  meta: {
    type: "problem",
    docs: { description: "A `slots` object carries exactly the roles its registry key declares." },
    schema: [],
    messages: {
      unknownRole:
        "`{{role}}` is not one of the nine child roles ({{roles}}). A role says what a child DOES in the tree; inventing one here means this node accepts a child no key ever agreed to.",
      wrongRole:
        "`{{key}}` does not accept a `{{role}}` child - it declares {{expected}}. Either this is the wrong key for the tree you are building, or the child belongs to a node one level down.",
      missingRole:
        "`{{key}}` declares a `{{role}}` child and none was passed. Every role a key names is part of the node's contract, not an option - a key whose children are optional describes nothing.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isSourceFile(file)) return {}
    const registry = readRegistry(file)
    if (!registry) return {}
    return {
      JSXOpeningElement(node) {
        if (jsxElementName(node) !== "Tree") return
        const slots = (node.attributes || []).find(
          (attribute) =>
            attribute.type === "JSXAttribute" && attribute.name && attribute.name.name === "slots",
        )
        const value = slots && slots.value
        if (!value || value.type !== "JSXExpressionContainer") return
        const object = value.expression
        if (!object || object.type !== "ObjectExpression") return
        if (object.properties.some((property) => property.type !== "Property")) return
        const given = object.properties.map((property) => ({ name: propertyName(property), node: property }))
        if (given.some((entry) => entry.name === null)) return
        const key = attributeText(node, "contract")
        const expected = key ? registry.rolesByKey[key] : null
        for (const entry of given) {
          if (!registry.roles.includes(entry.name)) {
            context.report({
              node: entry.node,
              messageId: "unknownRole",
              data: { role: entry.name, roles: registry.roles.join(", ") },
            })
            continue
          }
          if (expected && !expected.includes(entry.name)) {
            context.report({
              node: entry.node,
              messageId: "wrongRole",
              data: { key, role: entry.name, expected: expected.join(", ") },
            })
          }
        }
        if (!expected) return
        const names = given.map((entry) => entry.name)
        for (const role of expected) {
          if (!names.includes(role)) {
            context.report({ node, messageId: "missingRole", data: { key, role } })
          }
        }
      },
    }
  },
}

/**
 * The `explain` on a registry entry is the one thing nobody can reconstruct from the
 * markup later: WHY the node exists at all. A sentence that only restates the key
 * ("row of chips" on `content-row`) costs a line and teaches nothing.
 */
export const registryExplainIsAReason = {
  meta: {
    type: "problem",
    docs: { description: "Every registry entry explains why its node exists, in a sentence that is not the key again." },
    schema: [],
    messages: {
      tooShort:
        "`{{key}}` has a `why` too short to carry a reason. One clause naming what breaks, wraps or overflows when this node is removed - not a label.",
      restates:
        "`{{key}}` has a `why` built only from the words in the key, so it says the key twice and nothing else. Write the fact that made the node exist: what wraps, what overflows, what stops being pressable.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isRegistryFile(file)) return {}
    return {
      Property(node) {
        if (propertyName(node) !== "why") return
        if (!node.value || node.value.type !== "Literal" || typeof node.value.value !== "string") return
        const owner = node.parent && node.parent.parent
        const key = owner && owner.type === "Property" ? propertyName(owner) : "this entry"
        const words = node.value.value.trim().split(/\s+/).filter(Boolean)
        if (words.length < 12) {
          context.report({ node, messageId: "tooShort", data: { key } })
          return
        }
        const keyWords = new Set(String(key).split("-"))
        const restates = words.every((word) => keyWords.has(word.toLowerCase().replace(/[^a-z]/g, "")))
        if (restates) context.report({ node, messageId: "restates", data: { key } })
      },
    }
  },
}

/** The registry child grammar has at least one closed identity per slot and one honest repetition shape. */
export const registryChildrenAreTyped = {
  meta: {
    type: "problem",
    docs: { description: "Require named leaf/contract child slots, literal prop constraints, and paired repeat metadata." },
    schema: [],
    messages: {
      missing: "Registry entry `{{key}}` has no named `children` grammar.",
      empty: "Registry entry `{{key}}` declares no child slots; an empty object hides the same information as omitting `children`.",
      identity: "Child slot `{{slot}}` must declare at least one closed identity: `leaf`, `contract`, or both.",
      resting: "Repeated child slot `{{slot}}` must declare numeric `restingCount`; it is the loading cardinality, not the live length.",
      strayResting: "Child slot `{{slot}}` has `restingCount` without `repeats: true`.",
      literal: "Child slot `{{slot}}` prop constraints must be literal values; runtime data belongs to the render component.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isRegistryFile(file)) return {}
    return {
      Property(node) {
        const entryObject = node.value
        const tableObject = node.parent
        const call = tableObject && tableObject.parent
        if (!entryObject || entryObject.type !== "ObjectExpression") return
        if (!call || call.type !== "CallExpression" || call.callee?.name !== "buildContracts") return
        const key = propertyName(node) || "this entry"
        const childrenProperty = entryObject.properties.find((property) => propertyName(property) === "children")
        if (!childrenProperty || childrenProperty.type !== "Property" || childrenProperty.value.type !== "ObjectExpression") {
          context.report({ node, messageId: "missing", data: { key } })
          return
        }
        const slots = childrenProperty.value.properties.filter((property) => property.type === "Property")
        if (slots.length === 0) {
          context.report({ node: childrenProperty, messageId: "empty", data: { key } })
          return
        }
        for (const slotProperty of slots) {
          const slot = propertyName(slotProperty) || "unknown"
          if (!slotProperty.value || slotProperty.value.type !== "ObjectExpression") continue
          const fields = new Map(slotProperty.value.properties
            .filter((property) => property.type === "Property")
            .map((property) => [propertyName(property), property]))
          const identities = ["leaf", "contract"].filter((name) => fields.has(name))
          if (identities.length === 0) {
            context.report({ node: slotProperty, messageId: "identity", data: { slot } })
          }
          const repeats = fields.get("repeats")
          const resting = fields.get("restingCount")
          const repeatsTrue = repeats?.value?.type === "Literal" && repeats.value.value === true
          if (repeatsTrue && !(resting?.value?.type === "Literal" && typeof resting.value.value === "number")) {
            context.report({ node: slotProperty, messageId: "resting", data: { slot } })
          }
          if (!repeatsTrue && resting) {
            context.report({ node: resting, messageId: "strayResting", data: { slot } })
          }
          const props = fields.get("props")
          if (props?.value?.type === "ObjectExpression") {
            for (const constraint of props.value.properties) {
              if (constraint.type !== "Property" || constraint.value.type !== "Literal") {
                context.report({ node: constraint, messageId: "literal", data: { slot } })
              }
            }
          }
        }
      },
    }
  },
}
