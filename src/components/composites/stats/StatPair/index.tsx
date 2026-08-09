import { Badge } from "@/components/atoms/Badge"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { badgeToneFor, type SemanticVerdict } from "@/components/composites/_semantic-contracts"
import type { IconName } from "@/components/atoms/Icon"

/**
 * COMPOSITE - `StatPair`: one figure and the word for it.
 *
 * PORTED FROM THE LIVE PRODUCT, where it is the smallest unit of every dashboard tile - a number
 * with its label above it, on a bounded surface. The `stat` key already states the rule this
 * shape exists for: the label is read BEFORE the number and must never share its line, because a
 * long label on a narrow tile would otherwise wrap between the figure and its unit.
 *
 * WHY THE FIGURE IS TEXT AND NOT A BADGE BY DEFAULT. A number is a fact, and a badge is a
 * classification; drawing every figure as a badge spends the badge's meaning on decoration, and
 * a screen of tinted pills tells a reader nothing about which one matters. A verdict turns it
 * into a badge only where the figure genuinely carries a judgement.
 */

/** Props for {@link StatPair}. */
export interface StatPairProps {
    /** The already-resolved name of the figure. */
    label: string
    /** The already-formatted figure. A locale decides its shape, not this file. */
    value: string
    /** The meaning drawn before the label, when the word alone is slower to find. */
    icon?: IconName
    /**
     * What the figure MEANS. Given, it is drawn as a badge rather than as text, because a figure
     * carrying a judgement has to be legible as one at a glance. Omitted, the figure is a fact.
     */
    verdict?: SemanticVerdict
    /** Nothing to show YET: the tile keeps its footprint, with no figure to read. */
    isLoading?: boolean
}

/**
 * Draw one figure and the word for it.
 *
 * @param props - {@link StatPairProps}
 */
export const StatPair = ({ label, value, icon, verdict, isLoading = false }: StatPairProps) => {
    /** The `meta` role of the `stat` key: the label, on a line of its own. */
    const Label = () => (
        <Text tone="muted" size="sm" icon={icon}>
            {label}
        </Text>
    )

    /** The `body` role: the figure, as a fact or as a judgement. */
    const Value = () => {
        if (isLoading || verdict === undefined) {
            return (
                <Text weight="medium" isLoading={isLoading}>
                    {value}
                </Text>
            )
        }
        return <Badge tone={badgeToneFor(verdict)}>{value}</Badge>
    }

    return <Tree contract="stat" slots={{ meta: Label, body: Value }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "StatPair" } as const
