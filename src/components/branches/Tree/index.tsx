import type { ReactNode } from "react"
import { contractSpec, type ContractKey } from "@/components/contracts"

/**
 * BRANCH - `Tree`: the smallest branch there is. It draws ONE registry node.
 *
 * Anything needing more than one node is a named branch that nests these. That is the whole of the
 * assembly story: the registry describes a node, a branch describes how nodes stack.
 *
 * IT OWNS NO CLASS OF ITS OWN. Every class on the rendered node comes from the registry entry, so
 * there is no seam here for a caller or a maintainer to quietly adjust.
 *
 * INSPECTABILITY. The node carries `data-node` (which key drew it) and `data-why` (why the things
 * inside it sit that way). The reason travels into the DOM because the place a tree is wrong is
 * the place a reader is looking when they notice.
 */

/** Props for {@link Tree}. */
export interface TreeProps {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes and, through the key's own name, what belongs inside it.
     */
    contract: ContractKey
    /** The nodes and leaves that go inside, assembled by whoever is calling. */
    children?: ReactNode
}

/**
 * Draw one registry node.
 *
 * @param props - {@link TreeProps}
 */
export const Tree = ({ contract, children }: TreeProps) => {
    const spec = contractSpec(contract)
    return (
        <div
            data-tier="branch"
            data-component="Tree"
            data-node={contract}
            data-why={spec.why}
            className={spec.classes.join(" ")}
        >
            {children}
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
