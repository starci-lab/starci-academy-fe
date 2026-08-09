/**
 * Authoring-convention ESLint rules.
 *
 * These close gaps no other starci-fe rule covers:
 * - source text is English-only, and nothing else checks tooling (plugins/eslint, scripts);
 * - emoji never appear in source, only in content a translator owns;
 * - a destructured parameter takes a named type, so the shape has somewhere to be read.
 *
 * Messages and docs are English-only.
 */

/** Precise Vietnamese letters — same set as `check-no-vietnamese.mjs`. */
export const VN_LETTER = /[À-ÃÈ-ÊÌÍÒ-ÕÙÚÝà-ãè-êìíò-õùúýĂăĐđĨĩŨũƠơƯưẠ-ỿ]/

/** Language-picker endonym — sanctioned in the no-vietnamese gate. */
export const VN_ENDONYM = /Tiếng Việt/

/** Functional Vietnamese with an explicit reason on the same line. */
export const VN_OK_PRAGMA = /\bvn-ok:/

/**
 * Extended pictographs, or a regional-indicator pair (flag emoji).
 * Kept as two tests so the character class stays free of joiners/combining marks
 * (`no-misleading-character-class`). Does not match Vietnamese letters or Latin punctuation.
 */
export const hasEmoji = (text) =>
  typeof text === "string" &&
  (/\p{Extended_Pictographic}/u.test(text) || /[\u{1F1E6}-\u{1F1FF}]{2}/u.test(text))

/**
 * Paths whose Vietnamese / emoji IS product locale content, deliberate fixtures,
 * or sanctioned authoring exceptions recorded in the decision ledger.
 * Matched against a normalized forward-slash filename.
 */
export const CONTENT_ALLOWLIST = [
  /\/messages\/(en|vi)\.json$/i,
  /\/src\/resources\//,
  /\/__fixtures?__\//,
  /\/fixtures?\//,
  /\.fixture\.(ts|tsx|js|mjs|cjs)$/i,
  /\.test\.(ts|tsx|js|mjs|cjs)$/i,
  /\.spec\.(ts|tsx|js|mjs|cjs)$/i,
]

export const isContentAllowlisted = (filename) => {
  const file = (filename || "").replace(/\\/g, "/")
  return CONTENT_ALLOWLIST.some((re) => re.test(file))
}

const lineHasVnOkOrEndonym = (text) => VN_ENDONYM.test(text) || VN_OK_PRAGMA.test(text)

/** True when a TS type node is an inline object type literal (possibly wrapped). */
const isInlineObjectType = (typeNode) => {
  if (!typeNode) return false
  if (typeNode.type === "TSTypeLiteral") return true
  if (typeNode.type === "TSParenthesizedType") return isInlineObjectType(typeNode.typeAnnotation)
  return false
}

/**
 * Reject `({ value }: { value: string }) => …`.
 * Named types (`Props`) and untyped destructuring are fine.
 */
export const noInlineParameterType = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Destructured parameters must use a named type or interface, not an inline object type.",
    },
    schema: [],
    messages: {
      inline:
        "Name this parameter type (`type` / `interface` in the module) — do not inline `{ … }` on a destructured parameter.",
    },
  },
  create(context) {
    const checkParam = (param) => {
      if (!param || param.type !== "ObjectPattern") return
      const typeNode = param.typeAnnotation && param.typeAnnotation.typeAnnotation
      if (!isInlineObjectType(typeNode)) return
      context.report({ node: param.typeAnnotation || param, messageId: "inline" })
    }
    const checkParams = (node) => {
      for (const param of node.params || []) checkParam(param)
    }
    return {
      ArrowFunctionExpression: checkParams,
      FunctionExpression: checkParams,
      FunctionDeclaration: checkParams,
      TSEmptyBodyFunctionExpression: checkParams,
    }
  },
}

/**
 * Reject emoji in identifiers, comments, JSDoc, and non-content source strings.
 * Translation dictionaries and test fixtures are allowlisted by path.
 */
export const noEmojiInSource = {
  meta: {
    type: "problem",
    docs: {
      description:
        "No emoji in source authoring (identifiers, comments, JSDoc, diagnostics, non-content strings). [[no-emoji]]",
    },
    schema: [],
    messages: {
      emoji:
        "Emoji is not allowed in source authoring — use an icon token or plain text. (Translation/content modules and test fixtures are allowlisted.)",
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename()
    if (isContentAllowlisted(filename)) return {}
    const sc = context.sourceCode || context.getSourceCode()

    const reportIfEmoji = (node, text) => {
      if (!hasEmoji(text)) return
      context.report({ node, messageId: "emoji" })
    }

    return {
      Program() {
        for (const comment of sc.getAllComments()) {
          reportIfEmoji(comment, comment.value)
        }
      },
      Identifier(node) {
        reportIfEmoji(node, node.name)
      },
      Literal(node) {
        if (typeof node.value === "string") reportIfEmoji(node, node.value)
      },
      TemplateElement(node) {
        reportIfEmoji(node, node.value && node.value.cooked)
      },
      JSXText(node) {
        reportIfEmoji(node, node.value)
      },
    }
  },
}

/**
 * Reject Vietnamese prose in comments, JSDoc, identifiers, diagnostics, and
 * non-content strings. User-facing locale modules stay allowlisted.
 * Mirrors `check-no-vietnamese.mjs` sanctions (endonym + `vn-ok:`).
 */
export const noVietnameseInSourceAuthoring = {
  meta: {
    type: "problem",
    docs: {
      description:
        "No Vietnamese in source authoring (comments, JSDoc, identifiers, diagnostics, non-content strings). Locale content modules are allowlisted.",
    },
    schema: [],
    messages: {
      vietnamese:
        "Vietnamese is not allowed in source authoring — write comments, JSDoc, identifiers, and diagnostics in English. (Locale content modules are allowlisted; use `vn-ok: <reason>` for functional literals.)",
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename()
    if (isContentAllowlisted(filename)) return {}
    const sc = context.sourceCode || context.getSourceCode()

    const reportIfVn = (node, text) => {
      if (!text || !VN_LETTER.test(text)) return
      if (lineHasVnOkOrEndonym(text)) return
      context.report({ node, messageId: "vietnamese" })
    }

    return {
      Program() {
        for (const comment of sc.getAllComments()) {
          reportIfVn(comment, comment.value)
        }
      },
      Identifier(node) {
        reportIfVn(node, node.name)
      },
      Literal(node) {
        if (typeof node.value === "string") reportIfVn(node, node.value)
      },
      TemplateElement(node) {
        reportIfVn(node, node.value && node.value.cooked)
      },
      JSXText(node) {
        reportIfVn(node, node.value)
      },
    }
  },
}
