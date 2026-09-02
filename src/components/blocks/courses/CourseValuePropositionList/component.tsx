import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { courseValueListClassName, courseValueRowClassName } from "./classNames"

/** Resolved course promises plus the frame words SurfaceListCard owns. */
export type CourseValuePropositionListData = {
    readonly promises: ReadonlyArray<string>
}
/** Traditional state and data lanes for the promise list. */
export type CourseValuePropositionListProps = {
    readonly props: CourseValuePropositionListData
    readonly isLoading?: boolean
}

/**
 * Draw the shared promise list used by catalog cards and course detail.
 *
 * A promise is neutral product content, not evidence of completion. The foreground circle-check
 * means the value is included in this offering; it must never manufacture achieved success.
 */
export const CourseValuePropositionList = (props: CourseValuePropositionListProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return (
        <ul className={courseValueListClassName}>
            {data.promises.map((promise, index) => (
                <li className={courseValueRowClassName} key={`promise-${index}`}>
                    <Icon source={iconSourceFor("included", "leading")} usage={"leading"} />
                    <Text size={"md"} isSkeleton={isLoading}>{promise}</Text>
                </li>
            ))}
        </ul>
    )
}
