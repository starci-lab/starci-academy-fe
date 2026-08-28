import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { CourseLearningSignalDetail, type CourseLearningSignalDetailProps } from "@/components/blocks/learn/CourseLearningSignalDetail"
import { CourseLearningSignals, type CourseLearningSignalsProps } from "@/components/blocks/learn/CourseLearningSignals"
import { CourseNextActions, type CourseNextActionsProps } from "@/components/blocks/learn/CourseNextActions"
import { CourseProgressOverview, type CourseProgressOverviewProps } from "@/components/blocks/learn/CourseProgressOverview"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import type { LearnMobileView } from "@/components/layouts/LearnShellLayout/component"
import { courseLearnTodayHostClassName } from "./classNames"

/** The settled route-level situation of the course dashboard. */
export type CourseLearnTodayState = "pending" | "ready" | "empty" | "failed"
/** One backend-proven next step displayed by the dashboard. */
export type CourseLearnTodayItem = { readonly id: string; readonly title: string; readonly kind: string; readonly actionLabel: string }
/** Accepted dashboard child inputs. */
export type CourseLearnTodayDashboard = { readonly progress: CourseProgressOverviewProps; readonly nextActions: CourseNextActionsProps; readonly signals: CourseLearningSignalsProps; readonly signalDetail: CourseLearningSignalDetailProps }
/** Resolved copy, mobile alternatives and dashboard evidence. */
export type CourseLearnTodayData = { readonly title: string; readonly subtitle: string; readonly primaryLabel: string; readonly secondaryLabel: string; readonly courseLabel: string; readonly progressLabel: string; readonly progressFact?: string; readonly progressValue?: number; readonly primary?: CourseLearnTodayItem; readonly secondary: ReadonlyArray<CourseLearnTodayItem>; readonly course: CourseLearnTodayItem; readonly dashboard: CourseLearnTodayDashboard; readonly emptyMessage: string; readonly failedMessage: string; readonly retryLabel: string }
/** Navigation, selection and recovery events. */
export type CourseLearnTodayActions = { readonly open?: (id: string) => void; readonly selectSignal?: (id: string) => void; readonly openSignal?: () => void; readonly retry?: () => void }
/** Props accepted by the pure dashboard page. */
export type CourseLearnTodayBlockProps = { readonly blockState: CourseLearnTodayState; readonly mobileView: Extract<LearnMobileView, "today" | "course" | "progress">; readonly props: CourseLearnTodayData; readonly on?: CourseLearnTodayActions }

type ResumeCardProps = { readonly item: CourseLearnTodayItem; readonly label: string; readonly open?: (id: string) => void; readonly isLoading: boolean }
const ResumeCard = (props: ResumeCardProps) => <SurfaceCard props={{ label: props.label }} isLoading={props.isLoading}><Text props={{ content: props.item.title, size: "sm", weight: "medium" }} isLoading={props.isLoading} /><Text props={{ content: props.item.kind, size: "sm", tone: "muted" }} isLoading={props.isLoading} />{props.isLoading ? null : <SeeMoreLink props={{ label: props.item.actionLabel }} on={{ press: () => props.open?.(props.item.id) }} />}</SurfaceCard>

/** Draw mobile alternatives and the desktop command-center dashboard. */
export const CourseLearnTodayBlockBase = (props: CourseLearnTodayBlockProps) => {
    const loading = props.blockState === "pending"
    const placeholder = { id: "pending", title: "", kind: "", actionLabel: props.props.course.actionLabel }
    const item = props.props.primary ?? placeholder
    if (props.blockState === "failed" || props.blockState === "empty") return <EmptyNotice props={{ icon: props.blockState === "failed" ? "retry" : "course", message: props.blockState === "failed" ? props.props.failedMessage : props.props.emptyMessage, actionLabel: props.blockState === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on?.retry }} />
    return <main className={courseLearnTodayHostClassName} aria-label={props.props.title}><header><Heading props={{ content: props.props.title, level: 1 }} /><Text props={{ content: props.props.subtitle, size: "sm", tone: "muted" }} /></header>{props.mobileView === "today" ? <section><ResumeCard item={item} label={props.props.primaryLabel} open={props.on?.open} isLoading={loading} /><SurfaceCard props={{ label: props.props.secondaryLabel, isFrameless: true }} isLoading={loading}>{(loading ? [placeholder] : props.props.secondary).map((entry) => <ResumeCard key={entry.id} item={entry} label={props.props.secondaryLabel} open={props.on?.open} isLoading={loading} />)}</SurfaceCard></section> : null}{props.mobileView === "course" ? <ResumeCard item={props.props.course} label={props.props.courseLabel} open={props.on?.open} isLoading={loading} /> : null}{props.mobileView === "progress" ? <SurfaceCard props={{ label: props.props.progressLabel }} isLoading={loading}><Text props={{ content: props.props.progressLabel, size: "sm", weight: "semibold" }} /><Progress props={{ label: props.props.progressLabel, value: props.props.progressValue }} isLoading={loading} /><Text props={{ content: props.props.progressFact, size: "xs", tone: "muted" }} isLoading={loading} /></SurfaceCard> : null}<section aria-label="Dashboard"><CourseProgressOverview {...props.props.dashboard.progress} on={{ retry: props.on?.retry }} /><CourseNextActions {...props.props.dashboard.nextActions} on={{ open: props.on?.open, retry: props.on?.retry }} /><CourseLearningSignals {...props.props.dashboard.signals} on={{ select: props.on?.selectSignal, retry: props.on?.retry }} /><CourseLearningSignalDetail {...props.props.dashboard.signalDetail} on={{ open: props.on?.openSignal, retry: props.on?.retry }} /></section></main>
}
