/**
 * The two rules that govern the registry FOLDER itself.
 *
 * `src/components/classNames/` holds two layers that answer different questions and obey
 * opposite rules, and each of these rules keeps one of those differences from quietly eroding:
 *
 *   1. `classnames-type-imports-only` - a chain may NAME a component from any tier, but only
 *      as a type. This is the difference between the registry being readable from everywhere
 *      and the registry importing half the application.
 *   2. `shapes-vocabulary-ceiling` - the SHAPE layer is capped and the CHAIN layer is not. The
 *      cap is what keeps a vocabulary learnable; applying it to chains would push an author to
 *      reuse an entry that describes something else, which is the drift chains exist to stop.
 *
 * Both are here rather than in `registry-rules.mjs` because those rules police how the rest of
 * the tree USES the registry, while these police how the registry is written.
 */
import { isRegistryFile, isRegistryFolderFile, normalizePath } from "./registry.mjs"

/**
 * A twin test may build the mistake on purpose; product source may not.
 *
 * The chain twins are the clearest case in the repository: proving that a chain REFUSES the
 * wrong component means importing that component for its value and offering it, which is
 * precisely the import this folder otherwise forbids. Exempting the twins is what lets the
 * constraint be tested at all - the same reasoning `no-double-cast` already applies.
 */
const isTestFile = (file) => /\.(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(file)

/** An import of this project's own code, as opposed to a package from node_modules. */
const isProjectModule = (source) =>
  typeof source === "string"
  && (source.startsWith("@/") || source.startsWith("./") || source.startsWith("../"))

/**
 * Whether an import declaration brings anything in for its VALUE.
 *
 * `import type { X }` and `import { type X }` are both erased; a bare `import "./x"` is a
 * side effect, which is a runtime edge with no binding to show for it - the worst of the two.
 */
const valueSpecifiers = (node) => {
  if (node.importKind === "type") return []
  if (!node.specifiers || node.specifiers.length === 0) return [node]
  return node.specifiers.filter((specifier) => specifier.importKind !== "type")
}

/**
 * Inside the registry folder, a project module may only be imported as a TYPE.
 *
 * A chain pins a slot to `ComponentType<XxxProps>`, so it has to name types that live in the
 * blocks, overlays and pages ABOVE it. That is safe for exactly one reason: `import type` is
 * erased at compile time, so nothing in the emitted graph points upward and there is no cycle
 * to have. A value import in the same position looks almost identical in a diff, type-checks
 * perfectly, and silently inverts the tier order while creating a real module cycle - a failure
 * mode nothing else in the gate detects, which is why it is made impossible instead of
 * discouraged.
 */
export const classnamesTypeImportsOnly = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Inside `src/components/classNames/**`, a project module is imported as a type or not at all.",
    },
    schema: [],
    messages: {
      valueImport:
        "`{{source}}` is imported for its VALUE inside the registry - write `import type` instead. A chain is allowed to NAME a block, an overlay or a page because a type import is erased at compile time: nothing in the emitted module graph points upward, so there is no cycle. A value import in the same place inverts the tier order and creates a REAL cycle - the registry every tier depends on would start depending on one screen - and it does it while `tsc` stays green, so nothing but this rule would catch it.",
      sideEffect:
        "`import \"{{source}}\"` is a side-effect import inside the registry: a runtime edge to a project module with no binding to show for it, which is the cycle the type-only rule exists to prevent, minus even the excuse of needing the value. The registry runs no side effects and depends on no screen.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    if (!isRegistryFolderFile(file) || isTestFile(file)) return {}
    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value
        if (!isProjectModule(source)) return
        const offenders = valueSpecifiers(node)
        if (offenders.length === 0) return
        const bare = !node.specifiers || node.specifiers.length === 0
        for (const offender of offenders) {
          context.report({
            node: offender,
            messageId: bare ? "sideEffect" : "valueImport",
            data: { source },
          })
        }
      },
    }
  },
}

/** The most keys the SHAPE vocabulary may hold, whatever the file itself claims. */
const HARD_CEILING = 16

/** The `CLASS_NAMES` object expression, unwrapped from `as const satisfies ...`. */
const unwrapAssertion = (node) => {
  if (!node) return null
  if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression") {
    return unwrapAssertion(node.expression)
  }
  return node
}

/** The initialiser of a named `const` in a variable declaration. */
const initialiserOf = (declaration, name) => {
  for (const declarator of declaration.declarations || []) {
    if (declarator.id && declarator.id.type === "Identifier" && declarator.id.name === name) {
      return declarator
    }
  }
  return null
}

/**
 * The shape vocabulary is capped; the chain layer beside it is not.
 *
 * A vocabulary is only worth having while somebody can hold it in their head, and the moment a
 * key can be added because a caller wanted a different gap, the registry buys no consistency at
 * all. The ceiling is therefore mechanical rather than advisory.
 *
 * IT APPLIES TO `shapes.ts` AND NOWHERE ELSE. A chain entry names a composition that really
 * exists, so the right number of entries is however many exist - capping that would push an
 * author to reuse an entry describing something else, which is exactly the drift the chain
 * layer was added to prevent. A reader who notices the asymmetry is looking at a decision.
 *
 * The number is read from the file's own `TREE_KEY_CEILING`, so it is stated once and the twin
 * test and this rule cannot disagree about it. Deleting the constant is itself an error - that
 * being the obvious way to make a ceiling stop failing.
 */
export const shapesVocabularyCeiling = {
  meta: {
    type: "problem",
    docs: {
      description:
        "`CLASS_NAMES` in `shapes.ts` stays within the declared `TREE_KEY_CEILING`; chains are deliberately uncapped.",
    },
    schema: [],
    messages: {
      tooMany:
        "`CLASS_NAMES` declares {{count}} keys, over the ceiling of {{ceiling}}. A vocabulary is only worth having while it can be held in one head. A new key is justified by a tree shape no existing key can hold - never by a caller who wanted a different gap. If what you are describing is one real composition rather than a general shape, it belongs in `./chains/`, which is uncapped on purpose.",
      missingCeiling:
        "`shapes.ts` no longer declares `TREE_KEY_CEILING`. That constant is the ceiling this rule and the twin test both read, so removing it is how the cap silently stops applying. If the vocabulary genuinely needs to grow, raise the number where it is written and argue it there.",
      ceilingRaised:
        "`TREE_KEY_CEILING` is {{ceiling}}, above the hard limit of {{hard}}. The ceiling may be lowered but not raised past this: a cap a caller can move is not a cap. A shape that does not fit is either a nested key or a chain entry.",
    },
  },
  create(context) {
    const file = normalizePath(context.filename || context.getFilename())
    // The entry table only. `roles.ts` declares no keys, and `chains/**` is uncapped by design -
    // naming that here is what stops a later reader "fixing" the asymmetry.
    if (!isRegistryFile(file)) return {}
    let ceilingNode = null
    let ceiling = null
    let entriesNode = null
    let count = null
    return {
      VariableDeclaration(node) {
        const ceilingDeclarator = initialiserOf(node, "TREE_KEY_CEILING")
        if (ceilingDeclarator && ceilingDeclarator.init) {
          const value = unwrapAssertion(ceilingDeclarator.init)
          if (value && value.type === "Literal" && typeof value.value === "number") {
            ceilingNode = ceilingDeclarator
            ceiling = value.value
          }
        }
        const entriesDeclarator = initialiserOf(node, "CLASS_NAMES")
        if (entriesDeclarator && entriesDeclarator.init) {
          const value = unwrapAssertion(entriesDeclarator.init)
          if (value && value.type === "ObjectExpression") {
            entriesNode = entriesDeclarator.id
            count = value.properties.filter((property) => property.type === "Property").length
          }
        }
      },
      "Program:exit"(node) {
        if (count === null) return
        if (ceiling === null) {
          context.report({ node: entriesNode || node, messageId: "missingCeiling" })
          return
        }
        if (ceiling > HARD_CEILING) {
          context.report({
            node: ceilingNode || node,
            messageId: "ceilingRaised",
            data: { ceiling, hard: HARD_CEILING },
          })
        }
        const effective = Math.min(ceiling, HARD_CEILING)
        if (count > effective) {
          context.report({
            node: entriesNode || node,
            messageId: "tooMany",
            data: { count, ceiling: effective },
          })
        }
      },
    }
  },
}
