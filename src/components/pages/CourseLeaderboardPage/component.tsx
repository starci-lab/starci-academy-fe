import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Podium, type PodiumEntryData } from "@/components/composites/Podium"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { StandingHeroCard } from "@/components/composites/StandingHeroCard"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type LeafProps,
} from "@/components/contracts/props"

/** The four backend-derived score lenses supported by the course board. */
export type CourseLeaderboardCategory = "total" | "challenge" | "reading" | "milestone"

type CourseLeaderboardCategoryOption = {
    readonly id: CourseLeaderboardCategory
    readonly label: string
}

type CourseLeaderboardBoard = {
    readonly standing: {
        readonly rank?: number
        readonly rankLabel?: string
        readonly title: string
        readonly subtitle: string
        readonly fact?: string
    }
    readonly podium: ReadonlyArray<PodiumEntryData>
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
}

/** Resolved course-board copy, categories and ranked rows consumed by the pure page. */
export type CourseLeaderboardPageData = {
    readonly title: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly categoryLabel: string
    readonly selectedCategory: CourseLeaderboardCategory
    readonly categories: ReadonlyArray<CourseLeaderboardCategoryOption>
    readonly board: CourseLeaderboardBoard
    readonly listLabel: string
    readonly meLabel: string
    readonly anonymousLabel: string
    readonly climbLabel: string
    readonly updatedAtLabel?: string
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
}

type CourseLeaderboardPageActions = {
    readonly selectCategory?: (category: string) => void
    readonly climb?: () => void
    readonly retry?: () => void
    readonly course?: () => void
}

type CourseLeaderboardPageProps = BlockProps<
    "pending" | "ready" | "empty" | "failed",
    CourseLeaderboardPageData
> & { readonly on?: CourseLeaderboardPageActions }

type CourseLeaderboardListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
}

const CourseLeaderboardList = ({ props, isLoading = false }: LeafProps<CourseLeaderboardListData>) => (
    <Tree contract="ranked-user-list" render={defineContractProjection("ranked-user-list", () => (
        <>
            {props.rows.map((row) => <RankedUserRow key={row.id} props={row} isLoading={isLoading} />)}
            {props.ellipsisLabel === undefined ? null : (
                <Tree contract="ranked-user-ellipsis-row" render={defineContractComponent("ranked-user-ellipsis-row", {
                    label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: props.ellipsisLabel, size: "xs", tone: "muted" }} />
                    )),
                })} />
            )}
            {props.selfRow === undefined ? null : <RankedUserRow props={props.selfRow} />}
        </>
    ))} />
)

const CourseLeaderboardListContent = defineContractComponent("ranked-user-list", CourseLeaderboardList)

/** Pure course leaderboard with category, viewer standing, snapshot time and honest data states. */
export const CourseLeaderboardPageBase = (input: CourseLeaderboardPageProps) => {
    const isLoading = input.state === "pending"
    const board = input.props.board
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs props={{ steps: input.props.trail, label: input.props.title }} on={{ course: input.on?.course }} />
        )),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} />),
    })
    const category = defineContractComponent("scope-switch-row", {
        tabs: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: input.props.categoryLabel,
                    selectedKey: input.props.selectedCategory,
                    variant: "primary",
                    tabs: input.props.categories,
                }}
                on={{ select: input.on?.selectCategory }}
            />
        )),
    })

    if (input.state === "empty" || input.state === "failed") {
        return (
            <Tree contract="league-page-column" render={defineContractComponent("league-page-column", {
                header,
                scope: category,
                board: defineContractProjection("league-board-stack", () => (
                    <EmptyNotice
                        props={{
                            icon: "league",
                            message: input.state === "empty" ? input.props.emptyMessage : input.props.errorMessage,
                            actionLabel: input.state === "failed" ? input.props.retryLabel : input.props.climbLabel,
                        }}
                        on={{ act: input.state === "failed" ? input.on?.retry : input.on?.climb }}
                    />
                )),
            })} />
        )
    }

    return (
        <Tree contract="league-page-column" render={defineContractComponent("league-page-column", {
            header,
            scope: category,
            board: defineContractComponent("league-board-stack", {
                hero: defineContractProjection("standing-hero-card", () => (
                    <StandingHeroCard
                        props={{
                            standing: board.standing,
                            ctaLabel: input.props.climbLabel,
                            progressAccessibleLabel: input.props.title,
                        }}
                        on={{ cta: input.on?.climb }}
                        isLoading={isLoading}
                    />
                )),
                podium: defineContractProjection("podium", () => (
                    <Podium
                        props={{
                            entries: board.podium,
                            meLabel: input.props.meLabel,
                            anonymousLabel: input.props.anonymousLabel,
                        }}
                        isLoading={isLoading}
                    />
                )),
                list: defineContractProjection("ranked-user-followable-list", () => (
                    <>
                        <SurfaceListCard
                            contract="ranked-user-list"
                            render={CourseLeaderboardListContent}
                            props={{
                                label: input.props.listLabel,
                                fact: input.props.updatedAtLabel,
                                rows: board.rows,
                                selfRow: board.selfRow,
                                ellipsisLabel: board.ellipsisLabel,
                            }}
                            isLoading={isLoading}
                        />
                    </>
                )),
            }),
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
