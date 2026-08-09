/**
 * Slot integrity for the registry frame.
 *
 * A registry key declares one child per ROLE. A slot that returns a multi-child fragment
 * puts two children where the key agreed to one, and does it invisibly: the type checks,
 * the markers still say `data-roles="media body action"`, and the rendered tree is not the
 * tree the key describes. If the extra child is real, it belongs to a nested key.
 *
 * This replaces the retired `no-frame-fragment-item`, which policed the same laundering
 * through the `items` array of the per-shape frames (StackH / StackV / Grid) that the one
 * registry frame made unnecessary.
 */

/** Rendered children of a fragment, ignoring whitespace, comments and empty expressions. */
const fragmentChildCount = (fragment) => fragment.children.filter((child) => (
  child.type === "JSXElement"
  || child.type === "JSXFragment"
  || (child.type === "JSXExpressionContainer" && child.expression.type !== "JSXEmptyExpression")
)).length

/** Whether a node is a fragment carrying more than one child. */
const isMultiChildFragment = (node) => node?.type === "JSXFragment" && fragmentChildCount(node) > 1

/** The fragment an arrow function hands back, whether by expression body or by `return`. */
const arrowFragment = (expression) => {
  if (expression?.type !== "ArrowFunctionExpression") return null
  const body = expression.body
  if (body.type === "JSXFragment") return body
  if (body.type !== "BlockStatement") return null
  for (const statement of body.body) {
    if (statement.type === "ReturnStatement" && statement.argument?.type === "JSXFragment") {
      return statement.argument
    }
  }
  return null
}

/** ESLint rule: one role, one child - a fragment must not smuggle a second one in. */
export const noFragmentSlot = {
  meta: {
    type: "problem",
    docs: {
      description: "A registry slot renders one child for its role; a multi-child fragment is a tree the key never described.",
    },
    schema: [],
    messages: {
      fragment:
        "Slot `{{role}}` returns two or more children through a fragment, so this node holds children its registry key never agreed to - and still reports the key's contract on `data-roles`. Nest the honest key instead: the second child either belongs to a `<Tree>` of its own inside this slot, or to a different key here.",
    },
  },
  create(context) {
    const multiFragmentVariables = new Set()

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier" && isMultiChildFragment(node.init)) {
          multiFragmentVariables.add(node.id.name)
        }
      },
      JSXAttribute(node) {
        if (!node.name || node.name.type !== "JSXIdentifier" || node.name.name !== "slots") return
        const value = node.value
        if (!value || value.type !== "JSXExpressionContainer") return
        const object = value.expression
        if (!object || object.type !== "ObjectExpression") return

        for (const property of object.properties) {
          if (property.type !== "Property" || property.computed) continue
          const role = property.key.type === "Identifier"
            ? property.key.name
            : (property.key.type === "Literal" ? String(property.key.value) : "?")
          const slot = property.value
          const fragment = arrowFragment(slot)
          if (fragment) {
            context.report({ node: property, messageId: "fragment", data: { role } })
            continue
          }
          if (
            slot?.type === "ArrowFunctionExpression"
            && slot.body.type === "Identifier"
            && multiFragmentVariables.has(slot.body.name)
          ) {
            context.report({ node: property, messageId: "fragment", data: { role } })
            continue
          }
          if (slot?.type === "Identifier" && multiFragmentVariables.has(slot.name)) {
            context.report({ node: property, messageId: "fragment", data: { role } })
          }
        }
      },
    }
  },
}
