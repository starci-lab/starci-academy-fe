/**
 * The double cast.
 *
 * `value as unknown as Target` is not a cast, it is a mute button. A single `as` still has to
 * argue with the compiler - the two types must overlap - and the double form removes even
 * that, because everything overlaps with `unknown`. It is therefore the only construct in the
 * language that turns off type checking at exactly the seam where checking is worth the most:
 * where somebody else's shape (a hook return, a payload, a DOM lib type) meets this tree's own
 * contract. The blocks that carried one compiled happily against a back end that had renamed
 * the field they read.
 *
 * THE TESTS ARE THE EXCEPTION, and not a grudging one. A twin test proves an atom's closed API
 * by building props the API refuses - `{ className: "back-door" } as unknown as AvatarProps` -
 * and there is no way to write that except by lying to the compiler on purpose. Banning it in a
 * test would delete the test that guards the closed surface. The exemption lives in the rule
 * rather than in the config so that it travels with the rule and cannot be lost by a config
 * block that forgets to restate it.
 */

/** Forward-slash form of a filename. */
const normalize = (filename) => String(filename || "").replace(/\\/g, "/")

/** The escape hatches an inner cast can use to erase a type: `unknown` and `any`. */
const ERASING_KEYWORDS = new Set(["TSUnknownKeyword", "TSAnyKeyword"])

/**
 * Product source under `src/`. A twin test is deliberately outside: it builds invalid props on
 * purpose to prove they are refused.
 */
export const isCastGovernedFile = (filename) => {
  const file = normalize(filename)
  if (!file.includes("/src/")) return false
  return !/\.(?:test|spec)\.(?:ts|tsx|js|jsx)$/.test(file)
}

/** ESLint rule: a type that does not fit is fixed or validated, never erased through `unknown`. */
export const noDoubleCast = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban `x as unknown as T` in product source - fix the type or narrow it with a guard; twin tests are exempt.",
    },
    schema: [],
    messages: {
      doubleCast:
        "`as {{erased}} as {{target}}` erases the type instead of describing it: everything overlaps with `{{erased}}`, so the compiler stops checking this seam entirely and the shape on the other side can change without a single error here. Two honest ways out - make the TYPE right (read what the hook or query actually returns and name that, rather than restating a shape beside it), or narrow the value with a type guard or a small mapping function that VALIDATES what it received. A twin test proving a closed API refuses bad props is the one legitimate use, and is already exempt.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename()
    if (!isCastGovernedFile(filename)) return {}
    const source = context.sourceCode || context.getSourceCode()

    return {
      TSAsExpression(node) {
        const inner = node.expression
        if (!inner || inner.type !== "TSAsExpression") return
        const erased = inner.typeAnnotation
        if (!erased || !ERASING_KEYWORDS.has(erased.type)) return
        context.report({
          node,
          messageId: "doubleCast",
          data: {
            erased: source.getText(erased),
            target: source.getText(node.typeAnnotation),
          },
        })
      },
    }
  },
}
