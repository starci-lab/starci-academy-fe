"use client"

import { useMemo, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useMutateReactActivitySwr, useQueryMyFeedSwr, useQueryResolveRouteSwr } from "@/hooks"
import { MyFeedCategory, MyFeedTab } from "@/modules/api/graphql/queries/types/my-feed"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { FeedExplorerBase } from "./component"

/** Own bulletin cursor pages, reactions and resolved internal navigation. */
/** Props for the connected feed explorer block. */
export type FeedExplorerProps = Record<string, never>
/** Connect the FeedExplorer block to its data source. */
export const FeedExplorer = (props: FeedExplorerProps) => {
    void props
    const t = useTranslations("dashboard.explore")
    const router = useRouter()
    const [scope, setScope] = useState(MyFeedTab.ForYou)
    const [reacting, setReacting] = useState<string>()
    const query = useQueryMyFeedSwr(scope, MyFeedCategory.All)
    const reaction = useMutateReactActivitySwr()
    const route = useQueryResolveRouteSwr()
    const items = useMemo(() => query.data?.flatMap((page) => page.items) ?? [], [query.data])
    const lastPage = query.data?.[query.data.length - 1]
    const hasRows = items.length > 0
    const hasLoadMoreError = query.error !== undefined && hasRows
    const state = (() => {
        if (query.data === undefined && query.error === undefined) return "pending" as const
        if (query.error !== undefined && !hasRows) return "failed" as const
        if (!hasRows && scope !== MyFeedTab.ForYou) return "filteredEmpty" as const
        if (!hasRows) return "platformEmpty" as const
        return "ready" as const
    })()
    const resultCopy = (() => {
        if (state === "failed") return { message: t("feedFailed"), actionLabel: t("retry") }
        if (state === "filteredEmpty") return { message: t("feedEmptyFiltered"), actionLabel: t("resetFilter") }
        if (state === "platformEmpty") return { message: t("feedEmptyPlatform"), description: t("feedEmptyPlatformDescription"), actionLabel: t("browseCourses") }
        return { message: "" }
    })()
    const actions = Object.fromEntries(items.flatMap((item) => [
        [`actor:${item.id}`, async () => {
            const result = await route.trigger({ globalId: item.actorGlobalId })
            const path = result.data?.resolveRoute?.data?.path
            if (path !== null && path !== undefined) router.push(path)
        }],
        [`target:${item.id}`, item.targetGlobalId === null ? undefined : async () => {
            const result = await route.trigger({ globalId: item.targetGlobalId! })
            const path = result.data?.resolveRoute?.data?.path
            if (path !== null && path !== undefined) router.push(path)
        }],
        [`react:${item.id}`, async (type?: ReactionType | null) => {
            setReacting(item.id)
            try {
                await reaction.trigger({ activityId: item.id, type: type ?? null })
                await query.mutate()
            } finally { setReacting(undefined) }
        }],
    ]))

    return <FeedExplorerBase props={{
        label: t("scopeLabel"),
        scope: {
            label: t("scopeLabel"),
            selectedKey: scope,
            tabs: [
                { id: MyFeedTab.ForYou, label: t("forYou") },
                { id: MyFeedTab.Following, label: t("following") },
            ],
        },
        feed: {
            state,
            items,
            ...resultCopy,
            reactingId: reacting,
        },
        loadMoreLabel: t("loadMore"),
        canLoadMore: lastPage?.nextCursor !== null && lastPage !== undefined,
        isLoadingMore: query.isValidating && hasRows,
        loadMoreError: hasLoadMoreError ? t("loadMoreFailed") : undefined,
        retryLabel: t("retry"),
    }} on={{
        selectScope: (key) => setScope(key as MyFeedTab),
        feed: {
            resultAction: (() => {
                if (state === "filteredEmpty") return () => setScope(MyFeedTab.ForYou)
                if (state === "platformEmpty") return () => router.push("/courses")
                return () => { void query.mutate() }
            })(),
            ...actions,
        },
        loadMore: () => { void query.setSize(query.size + 1) },
        retryLoadMore: () => { void query.mutate() },
    }} />
}
