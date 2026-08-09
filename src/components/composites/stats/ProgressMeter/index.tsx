import { Badge } from "@/components/atoms/Badge"
import { Progress } from "@/components/atoms/Progress"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { badgeToneFor, type SemanticVerdict } from "@/components/composites/_semantic-contracts"
import type { IconName } from "@/components/atoms/Icon"

/**
 * COMPOSITE - `ProgressMeter`: a named quantity, how far along it is, and the readout that says
 * so in words.
 *
 * PORTED FROM THE LIVE PRODUCT, where it is the generic under three surfaces at once - a course's
 * completion, a weekly goal, a quota's remaining share. It is generic on purpose: the three
 * differ in what they COUNT, never in how the count is drawn, and giving each its own bar is how
 * a product ends up with three progress readouts that round differently.
 *
 * THE FIGURE IS SAID ONCE ON SCREEN AND ONCE TO ASSISTIVE TECHNOLOGY. The bar carries the value
 * in the accessibility tree and prints nothing; the badge shows it. A bar that also printed its
 * own number would put the figure on the card twice, and they would disagree the first time one
 * of them was rounded.
 *
 * THE READOUT IS COPY, NOT ARITHMETIC. `readout` arrives already formatted - "40%", "3 of 10" -
 * because how a quantity is written is a locale's decision, and a composite that built the
 * string would build it in one language for every reader.
 */

/** Props for {@link ProgressMeter}. */
export interface ProgressMeterProps {
    /** The already-resolved name of what is progressing. It also names the bar to a reader. */
    label: string
    /** The meaning drawn before the label, when the name alone is slower to find. */
    icon?: IconName
    /** How far along, 0 to 100. The caller clamps: a payload is not a promise about the range. */
    percent: number
    /** The already-formatted readout - "40%", "3 of 10". A locale decides its shape, not this file. */
    readout: string
    /**
     * What the figure MEANS. Defaults to a fact carrying no judgement, because most quantities
     * are exactly that; a caller naming a verdict is saying something true about the state, not
     * choosing a colour.
     */
    verdict?: SemanticVerdict
    /** Nothing to show YET: the row keeps its height, with no figure to read. */
    isLoading?: boolean
}

/**
 * Draw a named quantity and how far along it is.
 *
 * @param props - {@link ProgressMeterProps}
 */
export const ProgressMeter = ({
    label,
    icon,
    percent,
    readout,
    verdict = "neutral",
    isLoading = false,
}: ProgressMeterProps) => {
    /** The `meta` role of the `stat` key: the name, read before the figure below it. */
    const Label = () => (
        <Text size="sm" weight="medium" icon={icon} isLoading={isLoading}>
            {label}
        </Text>
    )

    /** The `body` role: the bar, and what it draws said once in words. */
    const Body = () => {
        if (isLoading) return <Progress value={0} label={label} isLoading />
        return (
            <>
                <Progress value={percent} label={label} />
                <Badge tone={badgeToneFor(verdict)}>{readout}</Badge>
            </>
        )
    }

    return <Tree contract="stat" slots={{ meta: Label, body: Body }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "ProgressMeter" } as const
