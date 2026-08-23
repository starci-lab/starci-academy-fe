import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Podium, type PodiumEntryData } from "@/components/composites/Podium"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { StandingHeroCard } from "@/components/composites/StandingHeroCard"
import { Text } from "@/components/leaves/Text"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { defineContractComponent, defineContractProjection, defineLeafComponent, type LeafProps } from "@/components/contracts/props"

/** Course leaderboard categories selected by the page URL. */
export type CourseLeaderboardBlockCategory = "total" | "challenge" | "reading" | "milestone"
/** Board states owned by the connected course leaderboard block. */
export type CourseLeaderboardBlockState = "pending" | "ready" | "empty" | "failed"
type Board = { readonly standing: { readonly rank?: number; readonly rankLabel?: string; readonly title: string; readonly subtitle: string; readonly fact?: string }; readonly podium: ReadonlyArray<PodiumEntryData>; readonly rows: ReadonlyArray<RankedUserRowData>; readonly selfRow?: RankedUserRowData; readonly ellipsisLabel?: string }
/** Resolved course leaderboard board and copy. */
export type CourseLeaderboardBlockData = { readonly board: Board; readonly listLabel: string; readonly meLabel: string; readonly anonymousLabel: string; readonly climbLabel: string; readonly title: string; readonly trail: ReadonlyArray<BreadcrumbStep>; readonly categoryLabel: string; readonly selectedCategory: CourseLeaderboardBlockCategory; readonly categories: ReadonlyArray<{ readonly id: CourseLeaderboardBlockCategory; readonly label: string }>; readonly emptyMessage: string; readonly errorMessage: string; readonly retryLabel: string; readonly updatedAtLabel?: string }
/** Actions emitted by the course leaderboard board. */
export type CourseLeaderboardBlockActions = { readonly course?: () => void; readonly selectCategory?: (category: string) => void; readonly climb?: () => void; readonly retry?: () => void }
/** Pure board input. */
export type CourseLeaderboardBlockProps = { readonly state: CourseLeaderboardBlockState; readonly data: CourseLeaderboardBlockData; readonly on?: CourseLeaderboardBlockActions }
type ListData = SurfaceListCardData & { readonly rows: ReadonlyArray<RankedUserRowData>; readonly selfRow?: RankedUserRowData; readonly ellipsisLabel?: string }
const List = ({ props, isLoading = false }: LeafProps<ListData>) => <Tree contract="ranked-user-list" render={defineContractProjection("ranked-user-list", () => <>{props.rows.map((row) => <RankedUserRow key={row.id} props={row} isLoading={isLoading} />)}{props.ellipsisLabel === undefined ? null : <Tree contract="ranked-user-ellipsis-row" render={defineContractComponent("ranked-user-ellipsis-row", { label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.ellipsisLabel ?? "", size: "xs", tone: "muted" }} />) })} />}{props.selfRow === undefined ? null : <RankedUserRow props={props.selfRow} />}</>)} />
const ListContent = defineContractComponent("ranked-user-list", List)

/** Render the course board subtree at the page's legal board contract. */
export const CourseLeaderboardBlockBase = (input: CourseLeaderboardBlockProps) => {
    const board = input.data.board
    const boardContent = input.state === "empty" || input.state === "failed"
        ? defineContractProjection("league-board-stack", () => <EmptyNotice props={{ icon: "league", message: input.state === "empty" ? input.data.emptyMessage : input.data.errorMessage, actionLabel: input.state === "failed" ? input.data.retryLabel : input.data.climbLabel }} on={{ act: input.state === "failed" ? input.on?.retry : input.on?.climb }} />)
        : defineContractComponent("league-board-stack", {
            hero: defineContractProjection("standing-hero-card", () => <StandingHeroCard props={{ standing: board.standing, ctaLabel: input.data.climbLabel, progressAccessibleLabel: input.data.title }} on={{ cta: input.on?.climb }} isLoading={input.state === "pending"} />),
            podium: defineContractProjection("podium", () => <Podium props={{ entries: board.podium, meLabel: input.data.meLabel, anonymousLabel: input.data.anonymousLabel }} isLoading={input.state === "pending"} />),
            list: defineContractProjection("ranked-user-followable-list", () => <SurfaceListCard contract="ranked-user-list" render={ListContent} props={{ label: input.data.listLabel, fact: input.data.updatedAtLabel, rows: board.rows, selfRow: board.selfRow, ellipsisLabel: board.ellipsisLabel }} isLoading={input.state === "pending"} />),
        })
    return <Tree contract="league-page-column" render={defineContractComponent("league-page-column", {
        header: defineContractComponent("page-header-stack", { trail: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ steps: input.data.trail, label: input.data.title }} on={{ course: input.on?.course }} />), title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.data.title, level: 1 }} />) }),
        scope: defineContractComponent("scope-switch-row", { tabs: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.data.categoryLabel, selectedKey: input.data.selectedCategory, variant: "primary", tabs: input.data.categories }} on={{ select: input.on?.selectCategory }} />) }),
        board: boardContent,
    })} />
}

/** Source-level ownership marker for the pure course board. */
export const meta = { world: "pure", domain: "learn" } as const
