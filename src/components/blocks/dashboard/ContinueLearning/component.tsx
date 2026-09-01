import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { IconTile } from "@/components/leaves/IconTile"
import {
    continueLearningCompactContentClassName,
    continueLearningCopyClassName,
    continueLearningFeaturedContentClassName,
    continueLearningGridClassName,
    continueLearningItemClassName,
    continueLearningSurfaceClassName,
} from "./classNames"
/** One resumable learning item. */
export type ResumeItem = { readonly id: string; readonly title: string; readonly kindLabel: string }
/** Shared section label. */
export type ContinueLearningFrame = { readonly label: string }
/** Notice state copy. */
export type ContinueLearningNotice = ContinueLearningFrame & { readonly message: string; readonly actionLabel: string }
/** Continue-learning state and actions. */
export type ContinueLearningProps = { readonly state: "pending" | "onboarding" | "empty" | "failed" | "ready"; readonly props: ContinueLearningFrame & Partial<ContinueLearningNotice> & { readonly items?: ReadonlyArray<ResumeItem>; readonly resumeLabel?: string }; readonly on?: { readonly resume?: (id: string) => void; readonly act?: () => void } }
/** Draw the resume section across pending, notice and ready states. */
export const ContinueLearningBase = (props: ContinueLearningProps) => {
    if (props.state === "onboarding" || props.state === "empty" || props.state === "failed") {
        return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{
            icon: "course",
            message: props.props.message ?? "",
            actionLabel: props.props.actionLabel,
        }} on={{ act: props.on?.act }} /></SurfaceCard>
    }
    const loading = props.state === "pending"
    const items = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, title: "", kindLabel: "" })) : props.props.items ?? []
    return (
        <div className={continueLearningSurfaceClassName}>
            <SurfaceCard props={{ label: props.props.label, isFrameless: true }} isLoading={loading}>
                <div className={continueLearningGridClassName}>
                    {items.map((item, index) => (
                        <div className={continueLearningItemClassName} data-dashboard-resume-item={index === 0 ? "featured" : "supporting"} key={item.id}>
                            <SurfaceCard props={{ ariaLabel: item.title || props.props.label, isHighlight: index === 0 }} isLoading={loading}>
                                <div className={index === 0 ? continueLearningFeaturedContentClassName : continueLearningCompactContentClassName}>
                                    <IconTile props={{ icon: "course", size: "md" }} />
                                    <div className={continueLearningCopyClassName}>
                                        <Text props={{ content: item.kindLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                                        <Text props={{ content: item.title, size: "md", weight: "semibold" }} isLoading={loading} />
                                        {loading || props.props.resumeLabel === undefined ? null : <SeeMoreLink props={{ label: props.props.resumeLabel }} on={{ press: () => props.on?.resume?.(item.id) }} />}
                                    </div>
                                </div>
                            </SurfaceCard>
                        </div>
                    ))}
                </div>
            </SurfaceCard>
        </div>
    )
}
