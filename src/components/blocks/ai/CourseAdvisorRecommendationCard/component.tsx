import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Badge } from "@/components/leaves/Badge"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
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
    <SurfaceCard props={{ isFrameless: true }}>
        <article className={recommendationCardClassNames.root} data-course-recommendation={props.props.courseDisplayId}>
            <div className={recommendationCardClassNames.identity}>
                <div className={recommendationCardClassNames.copy}>
                    <Text props={{ content: props.props.labels.aiAssessment, size: "xs", weight: "semibold" }} />
                    <Heading props={{ content: props.props.labels.whyFit, level: 3 }} />
                    <div className={recommendationCardClassNames.reason}><Text props={{ content: props.props.reason, size: "sm" }} /></div>
                </div>
                <Badge props={{ content: props.props.labels.confidence, tone: "neutral" }} />
            </div>
            <div className={recommendationCardClassNames.evidence}>
                {props.props.fitGap === null || props.props.fitGap === undefined || props.props.fitGap === "" ? null : (
                    <div className={recommendationCardClassNames.gap}>
                        <div className={recommendationCardClassNames.gapCopy}><Text props={{ content: `${props.props.labels.fitGap}: ${props.props.fitGap}`, size: "xs", tone: "muted" }} /></div>
                    </div>
                )}
                <section className={recommendationCardClassNames.platform} aria-label={props.props.labels.courseAction}>
                    <div className={recommendationCardClassNames.platformHeading}>
                        <Text props={{ content: props.props.labels.courseAction, size: "xs", weight: "semibold", tone: "muted" }} />
                        <Heading props={{ content: props.props.title ?? props.props.courseDisplayId, level: 3 }} isLoading={props.isLoading} />
                        <Badge
                            props={{ content: props.props.isEnrolled === true ? props.props.labels.enrolled : props.props.labels.available, tone: props.props.isEnrolled === true ? "success" : "accent" }}
                            isLoading={props.isLoading}
                        />
                    </div>
                    <a href={props.action.href} className={recommendationCardClassNames.cta}>{props.action.label}<span aria-hidden="true">→</span></a>
                </section>
            </div>
        </article>
    </SurfaceCard>
)
