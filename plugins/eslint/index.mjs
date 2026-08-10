/**
 * eslint-plugin-starci-fe - machine rules for the mechanical half of the FE canon.
 *
 * This is the ENFORCEMENT layer: each rule kills one pattern that review formerly had to
 * spot by hand. "Audit finds it once; lint keeps it gone."
 *
 * The registry rules (`./registry-rules.mjs`) are the centre of gravity now. The retired
 * `principle` / `PrincipleToken` / `data-principle` rules described ONE node and left the
 * author to guess the rest; the named registry in `src/components/contracts/shapes.ts` answers
 * the classes, the children and the reason in one key, so the rules that policed the
 * guessing were retargeted at the registry or deleted outright.
 *
 * Authoring helpers live in ./authoring.mjs (inline-param types, emoji, Vietnamese).
 */
import {
  noEmojiInSource,
  noInlineParameterType,
  noVietnameseInSourceAuthoring,
} from "./authoring.mjs"
import { noRuntimeNamespace } from "./namespaces.mjs"
import { noPublicClassNameProp } from "./public-contracts.mjs"
import {
  noHeadingElementOutsideHeadingAtom,
  noStructuralHostOutsideRegistryFrame,
} from "./structural-hosts.mjs"
import { noCssDoorTypeLaundering } from "./css-door-laundering.mjs"
import { noDoubleCast } from "./double-cast.mjs"
import {
  noClassCompositionOutsideRegistry,
  noHandWrittenRegistryAttrs,
  noLiteralStructuralClass,
  noUnregisteredTreeKey,
  registryExplainIsAReason,
} from "./registry-rules.mjs"

/** Static className string from one JSXAttribute (literal or pure template quasi). */
function classNameText(node) {
  if (!node || !node.value) return null
  const v = node.value
  if (v.type === "Literal" && typeof v.value === "string") return v.value
  if (v.type === "JSXExpressionContainer") {
    const e = v.expression
    if (e.type === "Literal" && typeof e.value === "string") return e.value
    if (e.type === "TemplateLiteral") return e.quasis.map((q) => q.value.cooked).join(" ")
  }
  return null
}

function isClassAttr(node) {
  return node.type === "JSXAttribute" && node.name && (node.name.name === "className" || node.name.name === "class")
}

/**
 * Class string of a registry entry (`classes: "flex gap-4"`).
 *
 * The registry is where every class string lives now, and `className={spec.classes}` is a
 * VALUE - invisible to any rule that only reads JSX literals. Scanning the entry keeps the
 * token rules pointed at the one file that still writes classes by hand.
 */
function registryClassText(node) {
  if (!node || node.type !== "Property" || node.computed) return null
  const key = node.key.type === "Identifier" ? node.key.name : null
  if (key !== "classes") return null
  return node.value.type === "Literal" && typeof node.value.value === "string" ? node.value.value : null
}

/** Component name of one JSXElement (Tree, Card.Header...). */
function elementName(opening) {
  const n = opening && opening.name
  if (!n) return null
  if (n.type === "JSXIdentifier") return n.name
  if (n.type === "JSXMemberExpression") {
    const obj = n.object && n.object.name
    const prop = n.property && n.property.name
    return obj && prop ? `${obj}.${prop}` : obj || null
  }
  return null
}

/** Static string literal from one JSXAttribute (Literal or JSXExpressionContainer wrapping Literal). */
function attrStringLiteral(node) {
  const v = node && node.value
  if (!v) return null
  if (v.type === "Literal" && typeof v.value === "string") return v.value
  if (v.type === "JSXExpressionContainer" && v.expression && v.expression.type === "Literal" && typeof v.expression.value === "string") {
    return v.expression.value
  }
  return null
}

// -- shared tier map - derive tier from FILE PATH, not contents --
// vocabulary: atoms/frames/composites (wrap vendor + compose leaves; no layout/data decisions).
// sentence: blocks/pages/layouts/overlays (compose sentences; do not draw shapes or fetch).
// Anything OUTSIDE `src/components/**` (app routes, hooks, modules) is NOT a component tier -
// each rule using this helper says in its comment whether it skips that scope.
const VOCAB_TIER_DIRS = new Set(["leaves", "branches", "contracts"])
const SENTENCE_TIER_DIRS = new Set(["blocks", "pages", "layouts", "overlays"])

/** "vocabulary" | "sentence" | null (null = outside src/components/** or unknown tier dir). */
function componentTier(filename) {
  const file = (filename || "").replace(/\\/g, "/")
  const m = file.match(/\/src\/components\/([^/]+)\//)
  if (!m) return null
  const dir = m[1]
  if (VOCAB_TIER_DIRS.has(dir)) return "vocabulary"
  if (SENTENCE_TIER_DIRS.has(dir)) return "sentence"
  return null
}

// L4 - off-scale spacing: fractional Tailwind (gap-1.5, p-2.5, space-y-1.5...). The house scale is
// 0-2-3-6-8(+4); fractional is NEVER on-scale, so this is an exact match with zero false positives.
const FRACTIONAL = /\b(?:gap|gap-x|gap-y|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|space-x|space-y|inset|top|bottom|left|right)-\d+\.5\b/g

const noFractionalSpacing = {
  meta: {
    type: "problem",
    docs: { description: "Ban fractional spacing (e.g. gap-1.5) in class strings and registry entries - the scale is 0-2-3-6-8." },
    schema: [],
    messages: { frac: "Fractional spacing '{{cls}}' is off the 0-2-3-6-8 scale - use the nearest step (e.g. gap-1.5 to gap-2)." },
  },
  create(context) {
    const scan = (node, text) => {
      if (!text) return
      const m = text.match(FRACTIONAL)
      if (m) for (const cls of new Set(m)) context.report({ node, messageId: "frac", data: { cls } })
    }
    return {
      JSXAttribute(node) {
        if (!isClassAttr(node)) return
        scan(node, classNameText(node))
      },
      Property(node) {
        scan(node, registryClassText(node))
      },
    }
  },
}

// L2b - hero heading class: text-{xl,2xl,3xl} + font-bold on one element = a heading hand-rolled out
// of raw classes, which is a typography decision an atom owns once for the whole codebase.
const HERO = /\btext-(?:xl|2xl|3xl|4xl)\b/
const noHeroHeadingClass = {
  meta: {
    type: "suggestion",
    docs: { description: "text-xl+/font-bold hand-roll is a heading - use the typography atom, not raw classes." },
    schema: [],
    messages: { hero: "Hand-rolled heading (text-xl+ and font-bold) - the type scale belongs to the typography atom, so every heading changes in one place." },
  },
  create(context) {
    const scan = (node, text) => {
      if (text && HERO.test(text) && /\bfont-bold\b/.test(text)) context.report({ node, messageId: "hero" })
    }
    return {
      JSXAttribute(node) {
        if (!isClassAttr(node)) return
        scan(node, classNameText(node))
      },
      Property(node) {
        scan(node, registryClassText(node))
      },
    }
  },
}

// L4b/token - an arbitrary Tailwind value escapes the token system. Tailwind v4 emits spacing via
// calc (so the enum cannot be pruned), which leaves the backdoor open: `gap-[7px]` (off-scale) and
// `text-[#hex]` (off the semantic palette). A genuine exception is an eslint-disable with a reason.
const ARBITRARY_SPACING = /\b(?:gap|gap-x|gap-y|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|space-x|space-y)-\[[^\]]+\]/
const HEX_COLOR = /\b(?:text|bg|border|ring|from|to|via|fill|stroke|shadow)-\[#[0-9a-fA-F]/
const noArbitraryToken = {
  meta: {
    type: "problem",
    docs: { description: "Ban arbitrary spacing/hex-color in class strings and registry entries (token-system escape)." },
    schema: [],
    messages: {
      space: "Arbitrary spacing '{{cls}}' - use the 0-2-3-6-8 scale; a real exception needs eslint-disable and a reason.",
      hex: "Arbitrary hex color '{{cls}}' - use a semantic token; a real brand color needs eslint-disable and a reason.",
    },
  },
  create(context) {
    const scan = (node, text) => {
      if (!text) return
      const sp = text.match(ARBITRARY_SPACING)
      if (sp) context.report({ node, messageId: "space", data: { cls: sp[0] } })
      const hx = text.match(HEX_COLOR)
      if (hx) context.report({ node, messageId: "hex", data: { cls: hx[0] } })
    }
    return {
      JSXAttribute(node) {
        if (!isClassAttr(node)) return
        scan(node, classNameText(node))
      },
      Property(node) {
        scan(node, registryClassText(node))
      },
    }
  },
}

// -- authoring convention rules - each rule = one `enforce/authoring/*` law --

// structure-and-naming: every module-level function is `const X = () => {}`, NOT a `function`
// declaration / `export default function`. Flag top-level FunctionDeclaration.
const preferArrowExport = {
  meta: {
    type: "suggestion",
    docs: { description: "Module-level functions use arrow const, not `function` declarations." },
    schema: [],
    messages: { fn: "Use an arrow const `const {{name}} = (...) => {...}` - no module-level `function`." },
  },
  create(context) {
    return {
      FunctionDeclaration(node) {
        const p = node.parent && node.parent.type
        if (p === "Program" || p === "ExportNamedDeclaration" || p === "ExportDefaultDeclaration") {
          context.report({ node: node.id || node, messageId: "fn", data: { name: (node.id && node.id.name) || "default" } })
        }
      },
    }
  },
}

// comments: every EXPORT (component/hook/helper/const/interface) opens with JSDoc `/** */`.
const requireExportJsdoc = {
  meta: {
    type: "suggestion",
    docs: { description: "Exported declarations open with JSDoc `/** */`." },
    schema: [],
    messages: { jsdoc: "Add JSDoc `/** ... */` for export `{{name}}` - role and what it does." },
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode()
    const hasJsdoc = (node) =>
      sc.getCommentsBefore(node).some((c) => c.type === "Block" && c.value.startsWith("*"))
    const check = (node) => {
      const d = node.declaration
      if (!d) return // re-export `export { X }` - skip
      const kinds = ["VariableDeclaration", "TSInterfaceDeclaration", "FunctionDeclaration", "TSTypeAliasDeclaration"]
      if (!kinds.includes(d.type)) return
      if (hasJsdoc(node)) return
      const id = d.id || (d.declarations && d.declarations[0] && d.declarations[0].id)
      context.report({ node: id || d, messageId: "jsdoc", data: { name: (id && id.name) || "?" } })
    }
    return { ExportNamedDeclaration: check, ExportDefaultDeclaration: check }
  },
}

// react-idioms: handlers are named `onXxx`, NOT `handleXxx` (locals and props).
const handlerOnPrefix = {
  meta: {
    type: "suggestion",
    docs: { description: "Handlers are named `onXxx`, not `handleXxx`." },
    schema: [],
    messages: { handle: "`{{name}}` - rename to `on{{rest}}` (handlers are `onXxx`, not `handleXxx`)." },
  },
  create(context) {
    const flag = (node, name) => {
      if (name && /^handle[A-Z]/.test(name)) {
        context.report({ node, messageId: "handle", data: { name, rest: name.slice("handle".length) } })
      }
    }
    return {
      VariableDeclarator(node) { if (node.id && node.id.type === "Identifier") flag(node.id, node.id.name) },
      JSXAttribute(node) { if (node.name) flag(node.name, node.name.name) },
    }
  },
}

// structure-and-naming: a PascalCase folder groups a direct named-export family.
// Exact `export const Folder` OR members like `FolderRoot` count - a runtime object named after
// the folder is forbidden (`no-runtime-namespace`).
const exportMatchesFolder = {
  meta: {
    type: "suggestion",
    docs: {
      description: "PascalCase folder must export a direct named-export family matching the folder.",
    },
    schema: [],
    messages: {
      mismatch:
        "`index.tsx` in folder `{{folder}}` has no direct named export matching the folder family (exports: {{names}}) - export `{{folder}}` or `{{folder}}*` members (e.g. `{{folder}}Root`), not a runtime namespace object.",
    },
  },
  create(context) {
    const file = (context.filename || context.getFilename()).replace(/\\/g, "/")
    const m = file.match(/\/([A-Z][A-Za-z0-9]*)\/index\.tsx?$/)
    if (!m) return {}
    const folder = m[1]
    const names = new Set()
    const matchesFamily = (name) =>
      name === folder || (name.startsWith(folder) && name.length > folder.length && /^[A-Z]/.test(name.slice(folder.length)))
    return {
      ExportNamedDeclaration(node) {
        const d = node.declaration
        if (d && d.type === "VariableDeclaration") d.declarations.forEach((dec) => dec.id && dec.id.name && names.add(dec.id.name))
        if (d && d.type === "FunctionDeclaration" && d.id) names.add(d.id.name)
        if (node.specifiers) node.specifiers.forEach((s) => s.exported && s.exported.name && names.add(s.exported.name))
      },
      "Program:exit"(node) {
        if (names.size > 0 && ![...names].some(matchesFamily)) {
          context.report({ node, messageId: "mismatch", data: { folder, names: [...names].join(", ") } })
        }
      },
    }
  },
}

// -- tier rules - each rule = one concrete violation class --

// The atom layer wraps a vendor ONCE. A direct `@heroui/react` import at the sentence tier is a
// block re-deciding appearance the atom already fixed, which splits the truth about a shape in two.
// ONLY applies under `src/components/**` at the sentence tier; a hook or route importing vendor
// directly is out of scope.
const noHerouiOutsideVocabulary = {
  meta: {
    type: "problem",
    docs: { description: "Import '@heroui/react' is only valid at the vocabulary tier (an atom wraps the vendor once)." },
    schema: [],
    messages: {
      heroui: "Import '@heroui/react' outside the vocabulary tier - use the matching atom (the vendor is wrapped once); if it is missing, add an atom rather than importing the vendor here.",
    },
  },
  create(context) {
    const tier = componentTier(context.filename || context.getFilename())
    if (tier !== "sentence") return {}
    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value === "@heroui/react") {
          context.report({ node, messageId: "heroui" })
        }
      },
    }
  },
}

// split.md - component.tsx (the PRESENTATIONAL half of the index.tsx/component.tsx pair) takes only
// already-resolved props: no self-fetch, no store reads, no self i18n - otherwise it cannot be
// rendered from a test or a story. Only files named `component.tsx`; the naming convention already
// scopes the rule.
const PRESENTATIONAL_FORBIDDEN_CALL = /^(?:useSWR|useSWRMutation|use[A-Za-z0-9]*Swr|useAppSelector|useDispatch|use[A-Za-z0-9]*Store|useTranslations|useLocale|query[A-Z][A-Za-z0-9]*)$/
const presentationalPurity = {
  meta: {
    type: "problem",
    docs: { description: "component.tsx takes only resolved props - no self fetch/store/i18n." },
    schema: [],
    messages: {
      call: "`{{name}}(...)` in component.tsx - that file is the presentational half and must receive data via props; put this call in index.tsx (the connected half) and pass it down.",
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, "/")
    if (!/(^|\/)component\.tsx$/.test(filename)) return {}
    return {
      CallExpression(node) {
        if (node.callee && node.callee.type === "Identifier" && PRESENTATIONAL_FORBIDDEN_CALL.test(node.callee.name)) {
          context.report({ node, messageId: "call", data: { name: node.callee.name } })
        }
      },
    }
  },
}

// A hand-kept skeleton tree (`import FooSkeleton from './FooSkeleton'`, or `skeleton={<...>}`) is a
// second description of a shape that already has one, and it drifts the first time the real one
// changes. Thread `isLoading` to each leaf so the resting shape IS the loaded shape. Global - both
// forms are a parallel tree at any tier. A bare `Skeleton` import is the primitive, not a twin.
const noParallelSkeleton = {
  meta: {
    type: "problem",
    docs: { description: "Ban hand-kept skeleton trees (skeleton={JSX} prop or relative *Skeleton import) - thread isLoading to leaves." },
    schema: [],
    messages: {
      prop: "Prop `skeleton={<...>}` is a hand-kept parallel skeleton tree that drifts from the real shape - thread `isLoading` to each leaf so the shimmer mirrors the loaded tree.",
      import: "Import `{{name}}` (relative) is a hand-kept parallel skeleton - thread `isLoading` to each leaf instead of keeping a second tree.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (!node.name || node.name.name !== "skeleton") return
        const v = node.value
        if (v && v.type === "JSXExpressionContainer" && v.expression && (v.expression.type === "JSXElement" || v.expression.type === "JSXFragment")) {
          context.report({ node, messageId: "prop" })
        }
      },
      ImportDeclaration(node) {
        const src = node.source && node.source.value
        if (!src || !/^\.\.?\//.test(src)) return
        for (const s of node.specifiers) {
          const local = s.local && s.local.name
          if (!local || local === "Skeleton" || !local.endsWith("Skeleton")) continue
          context.report({ node: s, messageId: "import", data: { name: local } })
        }
      },
    }
  },
}

// Atoms take already-resolved text via props - they must not embed locale sentences, because i18n is
// data and belongs to the connected file. Heuristic: a string with a space and a leading capital is
// real prose, not a token. Vocabulary tier only; the sentence tier receives text via props anyway.
const TEXT_ATTRS = new Set(["aria-label", "placeholder", "title", "alt"])
const noHardcodedUserTextInVocabulary = {
  meta: {
    type: "problem",
    docs: { description: "Atoms must not hardcode prose in aria-label/placeholder/title/alt - take a resolved prop." },
    schema: [],
    messages: {
      hardcoded: "`{{attr}}=\"{{text}}\"` hardcodes copy in an atom - i18n belongs to the connected file; take a resolved string prop instead.",
    },
  },
  create(context) {
    const tier = componentTier(context.filename || context.getFilename())
    if (tier !== "vocabulary") return {}
    return {
      JSXAttribute(node) {
        if (!node.name || !TEXT_ATTRS.has(node.name.name)) return
        const text = attrStringLiteral(node)
        if (!text) return
        if (/\s/.test(text) && /^[A-Z]/.test(text)) {
          context.report({ node, messageId: "hardcoded", data: { attr: node.name.name, text } })
        }
      },
    }
  },
}

const noPerPartClassNameProp = {
  meta: {
    type: "problem",
    docs: {
      description: "No `<part>ClassName` prop - a caller never restyles a node it does not own.",
    },
    schema: [],
    messages: {
      perPart: "`{{prop}}` lets a caller reach INSIDE this component and restyle a node it does not own - the one escape hatch that makes a component impossible to change, because every internal element becomes public surface. Whatever the caller is trying to say, say it as a NAMED prop instead: `nameClassName={isMe ? \"text-accent\" : undefined}` was really `isOwnRow`, and the component decides what own-row looks like.",
    },
  },
  create(context) {
    const file = (context.filename || context.getFilename()).replace(/\\/g, "/")
    if (!file.includes("/src/components/")) return {}
    return {
      // the declaration is what creates the hatch; the call site only walks through it
      TSPropertySignature(node) {
        const name = node.key && node.key.name
        if (!name || !/^[a-z][A-Za-z0-9]*ClassName$/.test(name) || name === "className") return
        context.report({ node, messageId: "perPart", data: { prop: name } })
      },
    }
  },
}

/** JSX element name, including `Foo.Bar`. */
function jsxElementName(node) {
  const n = node.name
  if (!n) return null
  if (n.type === "JSXIdentifier") return n.name
  if (n.type === "JSXMemberExpression") return n.object?.name ? `${n.object.name}.${n.property?.name}` : null
  return null
}

const noInlineSkeletonBranch = {
  meta: {
    type: "problem",
    docs: {
      description: "A caller never picks between a resting shape and a real one.",
    },
    schema: [],
    messages: {
      branch: "`{{flag}} ? ... : ...` picks between two DIFFERENT elements - that is a resting shape written by hand at the call site, and it drifts from the real one the first time the real one changes. Give the component below an `isLoading` prop and pass the flag down; let it rest as ITSELF. A ternary is fine when both arms are the same component.",
    },
  },
  create(context) {
    const file = (context.filename || context.getFilename()).replace(/\\/g, "/")
    if (!file.includes("/src/components/")) return {}
    if (file.includes("/src/components/atoms/")) return {}
    /** Root JSX element name of an arm, or null when the arm is not an element. */
    const armName = (expr) => {
      if (!expr) return null
      if (expr.type === "JSXElement") return jsxElementName(expr.openingElement)
      if (expr.type === "JSXFragment") return "<>"
      return null
    }
    return {
      ConditionalExpression(node) {
        const test = node.test
        const source = context.sourceCode || context.getSourceCode()
        const testText = source.getText(test)
        if (!/\bis(Skeleton|Loading|Pending)\b/.test(testText)) return
        const left = armName(node.consequent)
        const right = armName(node.alternate)
        // both arms must be real elements, and they must differ - the same component on both
        // sides is the honest shape (one description, two states)
        if (!left || !right || left === right) return
        context.report({ node, messageId: "branch", data: { flag: testText.trim().slice(0, 40) } })
      },
    }
  },
}

// -- one component = ONE folder, and that folder holds only its two halves --
// The three rules below lock the same habit: stuffing a whole cluster into the folder of one
// screen. It always starts harmlessly ("only this page uses it") and ends as a 674-line page with
// four components, a constants folder, a utils folder and three hand-copied skeletons.

/** Whether the path sits in ONE sentence-tier component folder, and what that folder is named. */
function sentenceComponentFolder(filename) {
  const file = (filename || "").replace(/\\/g, "/")
  // pages/<Name>/... - layouts/<Name>/... - overlays/<kind>/<Name>/...
  const m = file.match(/\/src\/components\/(pages|layouts)\/([^/]+)\/(.+)$/)
    || file.match(/\/src\/components\/(overlays)\/[^/]+\/([^/]+)\/(.+)$/)
  if (!m) return null
  return { tier: m[1], name: m[2], rest: m[3] }
}

const pageFolderTwoFilesOnly = {
  meta: {
    type: "problem",
    docs: {
      description: "A page/layout/overlay folder holds `component.tsx` + `index.tsx` and nothing else.",
    },
    schema: [],
    messages: {
      extra: "`{{tier}}/{{name}}/` contains `{{rest}}` - a screen folder holds its two halves ONLY (`component.tsx` = the shape, `index.tsx` = the wiring). Whatever this is, it has a real home: a component of its own goes to `blocks/<category>/`, a fetch to `hooks/`, a pure helper to `modules/utils/`, a shape to `modules/types/`, copy or a config map to `resources/`. \"Only this screen uses it\" is how a folder becomes a second codebase.",
    },
  },
  create(context) {
    const folder = sentenceComponentFolder(context.filename || context.getFilename())
    if (!folder) return {}
    if (folder.rest === "component.tsx" || folder.rest === "index.tsx") return {}
    if (/^(?:component|index)\.test\.tsx$/.test(folder.rest)) return {} // the twin test of each half
    return {
      Program(node) {
        context.report({ node, messageId: "extra", data: folder })
      },
    }
  },
}

const noSkeletonTwinComponent = {
  meta: {
    type: "problem",
    docs: {
      description: "No component whose whole job is to mirror another one's shape.",
    },
    schema: [],
    messages: {
      twin: "`{{name}}` is a hand-mirrored twin: a second description of a shape that already has one. Give the component it mirrors an `isLoading` prop and let it rest as ITSELF - the twin cannot be kept in step, it can only be noticed after it has already drifted. (The `Skeleton.*` primitives under `blocks/skeleton/` are the pieces you rest WITH, and are exempt.)",
    },
  },
  create(context) {
    const file = (context.filename || context.getFilename()).replace(/\\/g, "/")
    if (!file.includes("/src/components/")) return {}
    // the primitives themselves, and the atoms' own `isLoading` plumbing, are the exception
    if (file.includes("/blocks/skeleton/") || file.includes("/atoms/")) return {}
    const m = file.match(/\/([A-Za-z0-9]*Skeleton)\/index\.tsx$/) || file.match(/\/([A-Za-z0-9]*Skeleton)\.tsx$/)
    if (!m) return {}
    return {
      Program(node) {
        context.report({ node, messageId: "twin", data: { name: m[1] } })
      },
    }
  },
}

const noHelperFolderInComponents = {
  meta: {
    type: "problem",
    docs: {
      description: "`constants/` `utils/` `types/` `hooks/` are not component folders.",
    },
    schema: [],
    messages: {
      helper: "`{{kind}}/` under `src/components/**` - this is not component code, so it does not live in the component tree. A fetch is a `hooks/`, a pure function is a `modules/utils/`, a shape is a `modules/types/`, copy or a config map is a `resources/`. Left here it stays invisible to everyone who would have reused it.",
    },
  },
  create(context) {
    const file = (context.filename || context.getFilename()).replace(/\\/g, "/")
    const m = file.match(/\/src\/components\/.*\/(constants|utils|types|hooks)\//)
    if (!m) return {}
    return {
      Program(node) {
        context.report({ node, messageId: "helper", data: { kind: m[1] } })
      },
    }
  },
}

/**
 * A frame's public props are the registry key and its slots - nothing else.
 *
 * The retired version of this rule listed a dozen per-shape frames (StackH, Grid, Form...) and only
 * turned strict once a `principle` prop appeared on the element. There is one frame now and the key
 * owns the seam unconditionally, so the rule is unconditional: any component imported from
 * `components/frames/**` refuses gap / padding / align / justify / className / style.
 */
const FORBIDDEN_FRAME_CSS_PROPS = new Set([
  "gap",
  "padding",
  "align",
  "justify",
  "classes",
  "className",
  "classNames",
  "style",
  "inline",
  "nested",
])

/** Whether an import source resolves into the frames tier. */
function isFramesImport(source) {
  const value = typeof source === "string" ? source.replace(/\\/g, "/") : ""
  return /(?:^|\/)components\/frames\//.test(value) || /(?:^|\/)frames\/[A-Z]/.test(value)
}

const noPublicFrameCssProps = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Frames take a registry key and its slots; CSS layout props are not public frame decisions.",
    },
    schema: [],
    messages: {
      cssProp:
        "`{{prop}}` on <{{frame}}> reopens the seam the registry key already owns. A frame renders an entry from `src/components/contracts/shapes.ts` and takes nothing but the key and its slots - if the shape here is genuinely different, it is a different key.",
    },
  },
  create(context) {
    const file = (context.filename || context.getFilename()).replace(/\\/g, "/")
    // the frames themselves declare the props they refuse to take from callers
    if (/\/src\/components\/frames\//.test(file)) return {}
    const frameBindings = new Set()
    return {
      ImportDeclaration(node) {
        if (!isFramesImport(node.source && node.source.value)) return
        for (const specifier of node.specifiers || []) {
          if (specifier.local && specifier.local.name) frameBindings.add(specifier.local.name)
        }
      },
      JSXOpeningElement(node) {
        const name = elementName(node)
        if (!name || !frameBindings.has(name)) return
        for (const attr of node.attributes || []) {
          if (attr.type !== "JSXAttribute" || !attr.name || attr.name.type !== "JSXIdentifier") continue
          const prop = attr.name.name
          if (!FORBIDDEN_FRAME_CSS_PROPS.has(prop)) continue
          context.report({ node: attr, messageId: "cssProp", data: { prop, frame: name } })
        }
      },
    }
  },
}

export default {
  meta: { name: "eslint-plugin-starci-fe", version: "0.6.0" },
  rules: {
    // -- the named registry: one key owns the classes AND the child contract --
    "no-literal-structural-class": noLiteralStructuralClass,
    "no-class-composition-outside-registry": noClassCompositionOutsideRegistry,
    "no-hand-written-registry-attrs": noHandWrittenRegistryAttrs,
    "no-unregistered-tree-key": noUnregisteredTreeKey,
    "no-structural-host-outside-registry-frame": noStructuralHostOutsideRegistryFrame,
    "no-heading-element-outside-heading-atom": noHeadingElementOutsideHeadingAtom,
    "registry-explain-is-a-reason": registryExplainIsAReason,
    // -- how the registry FOLDER itself is written: two layers, opposite rules --
    // -- token scale --
    "no-fractional-spacing": noFractionalSpacing,
    "no-hero-heading-class": noHeroHeadingClass,
    "no-arbitrary-token": noArbitraryToken,
    // -- public contracts --
    "no-per-part-classname-prop": noPerPartClassNameProp,
    "no-public-classname-prop": noPublicClassNameProp,
    "no-public-frame-css-props": noPublicFrameCssProps,
    "no-css-door-type-laundering": noCssDoorTypeLaundering,
    "no-double-cast": noDoubleCast,
    "no-runtime-namespace": noRuntimeNamespace,
    // -- tiers and file layout --
    "no-heroui-outside-vocabulary": noHerouiOutsideVocabulary,
    "presentational-purity": presentationalPurity,
    "page-folder-two-files-only": pageFolderTwoFilesOnly,
    "no-helper-folder-in-components": noHelperFolderInComponents,
    "export-matches-folder": exportMatchesFolder,
    // -- one shape, two states --
    "no-parallel-skeleton": noParallelSkeleton,
    "no-inline-skeleton-branch": noInlineSkeletonBranch,
    "no-skeleton-twin-component": noSkeletonTwinComponent,
    // -- authoring --
    "prefer-arrow-export": preferArrowExport,
    "require-export-jsdoc": requireExportJsdoc,
    "handler-on-prefix": handlerOnPrefix,
    "no-hardcoded-user-text-in-vocabulary": noHardcodedUserTextInVocabulary,
    "no-inline-parameter-type": noInlineParameterType,
    "no-emoji-in-source": noEmojiInSource,
    "no-vietnamese-in-source-authoring": noVietnameseInSourceAuthoring,
  },
}
