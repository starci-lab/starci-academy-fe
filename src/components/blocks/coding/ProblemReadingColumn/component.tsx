import { Article } from "@/components/branches/Article"
import { Badge } from "@/components/leaves/Badge"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
/** Available problem reading tabs. */
export type ProblemReadingTab = "statement" | "hint" | "solution" | "submissions"
/** Reading column lifecycle state. */
export type ProblemReadingColumnState = "pending" | "ready" | "hint-absent" | "solution-hidden"
/** Resolved reading column content. */
export type ProblemReadingColumnData = { readonly tab: ProblemReadingTab; readonly tabLabels: { readonly statement: string; readonly hint: string; readonly solution: string; readonly submissions: string; readonly group: string }; readonly title?: string; readonly difficulty?: string; readonly body?: string; readonly tags?: ReadonlyArray<string> }
/** Reading column interaction callbacks. */
export type ProblemReadingColumnActions = { readonly selectTab?: (tab: string) => void }
/** Traditional reading column props. */
export type ProblemReadingColumnProps = { readonly state: ProblemReadingColumnState; readonly props: ProblemReadingColumnData; readonly on?: ProblemReadingColumnActions }
/** Draw the readable problem statement and its tabbed supporting material. */
export const ProblemReadingColumnBase = (props: ProblemReadingColumnProps) => { const loading = props.state === "pending"; return <div><ExtendedTabs props={{ label: props.props.tabLabels.group, selectedKey: props.props.tab, tabs: [{ id: "statement", label: props.props.tabLabels.statement, icon: "course" }, { id: "hint", label: props.props.tabLabels.hint, icon: "review" }, { id: "solution", label: props.props.tabLabels.solution, icon: "complete" }, { id: "submissions", label: props.props.tabLabels.submissions, icon: "practice" }] }} on={{ select: props.on?.selectTab }} /><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} /><Text props={{ content: props.props.difficulty, size: "sm", tone: "muted" }} isLoading={loading} /><Article props={{ body: props.props.body }} isLoading={loading} />{props.props.tags?.map((tag) => <Badge key={tag} props={{ content: tag, tone: "neutral" }} />)}</div> }
