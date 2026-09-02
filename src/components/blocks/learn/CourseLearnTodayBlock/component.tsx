import { SurfaceCard } from "@starci/grammar/common"
import { CourseLearningSignalDetail, type CourseLearningSignalDetailProps } from "@/components/blocks/learn/CourseLearningSignalDetail"
import { CourseLearningSignals, type CourseLearningSignalsProps } from "@/components/blocks/learn/CourseLearningSignals"
import { CourseNextActions, type CourseNextActionsProps } from "@/components/blocks/learn/CourseNextActions"
import { CourseProgressOverview, type CourseProgressOverviewProps } from "@/components/blocks/learn/CourseProgressOverview"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import type { LearnMobileView } from "@/components/product-shells/LearnShellLayout/component"
import { courseLearnTodayHostClassName } from "./classNames"
import { Icon, TextAction } from "@starci/grammar/common"


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
const ResumeCard = (props: ResumeCardProps) => <SurfaceCard label={props.label} composition="joined" state={props.isLoading ? "pending" : "neutral"}><Text size={"sm"} weight={"medium"} isSkeleton={props.isLoading}>{props.item.title}</Text><Text size={"sm"} tone={"muted"} isSkeleton={props.isLoading}>{props.item.kind}</Text>{props.isLoading ? null : <TextAction appearance="disclosure" onPress={() => props.open?.(props.item.id)} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{props.item.actionLabel}</TextAction>}</SurfaceCard>

/** Draw mobile alternatives and the desktop command-center dashboard. */
export const CourseLearnTodayBlockBase = (props: CourseLearnTodayBlockProps) => {
    const loading = props.blockState === "pending"
    const placeholder = { id: "pending", title: "", kind: "", actionLabel: props.props.course.actionLabel }
    const item = props.props.primary ?? placeholder
    if (props.blockState === "failed" || props.blockState === "empty") return <EmptyNotice message={props.blockState === "failed" ? props.props.failedMessage : props.props.emptyMessage} actionLabel={props.blockState === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor(props.blockState === "failed" ? "retry" : "course", "leading")} onAction={({ act: props.on?.retry })?.act} />
    return <main className={courseLearnTodayHostClassName} aria-label={props.props.title}><header><Heading level={1}>{props.props.title}</Heading><Text size={"sm"} tone={"muted"}>{props.props.subtitle}</Text></header>{props.mobileView === "today" ? <section><ResumeCard item={item} label={props.props.primaryLabel} open={props.on?.open} isLoading={loading} /><SurfaceCard label={props.props.secondaryLabel} frame={"frameless"} composition="joined" state={loading ? "pending" : "neutral"}>{(loading ? [placeholder] : props.props.secondary).map((entry) => <ResumeCard key={entry.id} item={entry} label={props.props.secondaryLabel} open={props.on?.open} isLoading={loading} />)}</SurfaceCard></section> : null}{props.mobileView === "course" ? <ResumeCard item={props.props.course} label={props.props.courseLabel} open={props.on?.open} isLoading={loading} /> : null}{props.mobileView === "progress" ? <SurfaceCard label={props.props.progressLabel} composition="joined" state={loading ? "pending" : "neutral"}><Text size={"sm"} weight={"semibold"}>{props.props.progressLabel}</Text><Progress label={props.props.progressLabel} value={props.props.progressValue} isSkeleton={loading} /><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{props.props.progressFact}</Text></SurfaceCard> : null}<section aria-label="Dashboard"><CourseProgressOverview {...props.props.dashboard.progress} on={{ retry: props.on?.retry }} /><CourseNextActions {...props.props.dashboard.nextActions} on={{ open: props.on?.open, retry: props.on?.retry }} /><CourseLearningSignals {...props.props.dashboard.signals} on={{ select: props.on?.selectSignal, retry: props.on?.retry }} /><CourseLearningSignalDetail {...props.props.dashboard.signalDetail} on={{ open: props.on?.openSignal, retry: props.on?.retry }} /></section></main>
}
