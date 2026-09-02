import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Podium, type PodiumEntryData } from "@/components/composites/Podium"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { StandingHeroCard } from "@/components/composites/StandingHeroCard"
import { Text } from "@starci/grammar/common"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@starci/grammar/common"
import {
    courseLeaderboardBoardClassName,
    courseLeaderboardHeaderClassName,
    courseLeaderboardPageClassName,
    courseLeaderboardScopeClassName,
    rankedUserEllipsisClassName,
} from "./classNames"

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
/** Render the course board subtree in the page's board region. */
export const CourseLeaderboardBlockBase = (props: CourseLeaderboardBlockProps) => {
    const board = props.data.board
    const isLoading = props.state === "pending"
    return <main className={courseLeaderboardPageClassName}>
        <div className={courseLeaderboardHeaderClassName}>
            <Breadcrumbs props={{ steps: props.data.trail, label: props.data.title }} on={{ course: props.on?.course }} />
            <Heading level={1}>{props.data.title}</Heading>
        </div>
        <div className={courseLeaderboardScopeClassName}>
            <ChoiceTabs props={{ label: props.data.categoryLabel, selectedKey: props.data.selectedCategory, variant: "primary", tabs: props.data.categories }} on={{ select: props.on?.selectCategory }} />
        </div>
        {props.state === "empty" || props.state === "failed" ? (
            <EmptyNotice message={props.state === "empty" ? props.data.emptyMessage : props.data.errorMessage} actionLabel={props.state === "failed" ? props.data.retryLabel : props.data.climbLabel} iconSource={iconSourceFor("league", "leading")} onAction={({ act: props.state === "failed" ? props.on?.retry : props.on?.climb })?.act} />
        ) : <div className={courseLeaderboardBoardClassName}>
            <StandingHeroCard props={{ standing: board.standing, ctaLabel: props.data.climbLabel, progressAccessibleLabel: props.data.title }} on={{ cta: props.on?.climb }} isLoading={isLoading} />
            <Podium props={{ entries: board.podium, meLabel: props.data.meLabel, anonymousLabel: props.data.anonymousLabel }} isLoading={isLoading} />
            <SurfaceListCard label={props.data.listLabel} fact={props.data.updatedAtLabel} isLoading={isLoading}>
                {board.rows.map((row) => <RankedUserRow key={row.id} props={row} isLoading={isLoading} />)}
                {board.ellipsisLabel === undefined ? null : (
                    <div className={rankedUserEllipsisClassName}>
                        <Text size={"xs"} tone={"muted"}>{board.ellipsisLabel}</Text>
                    </div>
                )}
                {board.selfRow === undefined ? null : <RankedUserRow props={board.selfRow} />}
            </SurfaceListCard>
        </div>}
    </main>
}
