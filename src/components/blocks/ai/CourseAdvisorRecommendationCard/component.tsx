import { SurfaceCard } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import type { CourseAdvisorRecommendation } from "@/modules/ai/course-advisor-response"
import { recommendationCardClassNames } from "./classNames"

/** Localized evidence and action copy for a recommendation card. */
export type CourseAdvisorRecommendationCardLabels = {
    readonly aiAssessment: string
    readonly whyFit: string
    readonly confidence: string
    readonly fitGap: string
    readonly courseAction: string
    readonly enrolled: string
    readonly available: string
    readonly openCourse: string
    readonly continueCourse: string
}

/** AI evidence combined with platform-owned course identity and enrollment state. */
export type CourseAdvisorRecommendationCardData = CourseAdvisorRecommendation & {
    readonly title?: string
    readonly isEnrolled?: boolean | null
    readonly labels: CourseAdvisorRecommendationCardLabels
}

/** Presentation contract for one fully resolved course recommendation. */
export type CourseAdvisorRecommendationCardProps = {
    readonly props: CourseAdvisorRecommendationCardData
    readonly isLoading?: boolean
    readonly action: { readonly href: string; readonly label: string }
}

/** Render one evidence-backed fit; course truth and navigation are supplied by the connected owner. */
export const CourseAdvisorRecommendationCardBase = (props: CourseAdvisorRecommendationCardProps) => (
    <SurfaceCard frame={true ? "frameless" : "bounded"} composition="joined">
        <article className={recommendationCardClassNames.root} data-course-recommendation={props.props.courseDisplayId}>
            <div className={recommendationCardClassNames.identity}>
                <div className={recommendationCardClassNames.copy}>
                    <Text size={"xs"} weight={"semibold"}>{props.props.labels.aiAssessment}</Text>
                    <Heading level={3}>{props.props.labels.whyFit}</Heading>
                    <div className={recommendationCardClassNames.reason}><Text size={"sm"}>{props.props.reason}</Text></div>
                </div>
                <Badge tone={"neutral"}>{props.props.labels.confidence}</Badge>
            </div>
            <div className={recommendationCardClassNames.evidence}>
                {props.props.fitGap === null || props.props.fitGap === undefined || props.props.fitGap === "" ? null : (
                    <div className={recommendationCardClassNames.gap}>
                        <div className={recommendationCardClassNames.gapCopy}><Text size={"xs"} tone={"muted"}>{`${props.props.labels.fitGap}: ${props.props.fitGap}`}</Text></div>
                    </div>
                )}
                <section className={recommendationCardClassNames.platform} aria-label={props.props.labels.courseAction}>
                    <div className={recommendationCardClassNames.platformHeading}>
                        <Text size={"xs"} tone={"muted"} weight={"semibold"}>{props.props.labels.courseAction}</Text>
                        <Heading level={3} isSkeleton={props.isLoading}>{props.props.title ?? props.props.courseDisplayId}</Heading>
                        <Badge tone={props.props.isEnrolled === true ? "success" : "accent"} isSkeleton={props.isLoading}>{props.props.isEnrolled === true ? props.props.labels.enrolled : props.props.labels.available}</Badge>
                    </div>
                    <a href={props.action.href} className={recommendationCardClassNames.cta}>{props.action.label}<span aria-hidden="true">→</span></a>
                </section>
            </div>
        </article>
    </SurfaceCard>
)
