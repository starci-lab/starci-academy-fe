"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMutateReactActivitySwr, useQueryMyFeedSwr, useQueryResolveRouteSwr } from "@/hooks"
import { MyFeedCategory, MyFeedTab } from "@/modules/api/graphql/queries/types/my-feed"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { _FeedExplorer } from "./component"

/** Own feed filters, cursor pages, reactions and resolved internal navigation. */
export const FeedExplorer = () => {
    const t = useTranslations("dashboard.explore")
    const router = useRouter()
    const [scope, setScope] = useState(MyFeedTab.ForYou)
    const [category, setCategory] = useState(MyFeedCategory.All)
    const [reacting, setReacting] = useState<string>()
    const query = useQueryMyFeedSwr(scope, category)
    const reaction = useMutateReactActivitySwr()
    const route = useQueryResolveRouteSwr()
    const items = useMemo(() => query.data?.flatMap((page) => page.items) ?? [], [query.data])
    const lastPage = query.data?.[query.data.length - 1]
    const hasRows = items.length > 0
    const hasLoadMoreError = query.error !== undefined && hasRows
    const state = query.data === undefined && query.error === undefined
        ? "pending"
        : query.error !== undefined && !hasRows
            ? "failed"
            : !hasRows && category !== MyFeedCategory.All
                ? "filteredEmpty"
                : !hasRows ? "platformEmpty" : "ready"
    const resultCopy = state === "failed"
        ? { message: t("feedFailed"), actionLabel: t("retry") }
        : state === "filteredEmpty"
            ? { message: t("feedEmptyFiltered"), actionLabel: t("resetFilter") }
            : state === "platformEmpty"
                ? { message: t("feedEmptyPlatform"), description: t("feedEmptyPlatformDescription"), actionLabel: t("browseCourses") }
                : { message: "" }
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

    return <_FeedExplorer props={{
        filters: {
            leading: {
                label: t("scopeLabel"),
                selectedKey: scope,
                tabs: [
                    { id: MyFeedTab.ForYou, label: t("forYou") },
                    { id: MyFeedTab.Following, label: t("following") },
                ],
            },
            trailing: {
                label: t("categoryLabel"),
                selectedKey: category,
                tabs: [
                    { id: MyFeedCategory.All, label: t("all") },
                    { id: MyFeedCategory.Courses, label: t("courses") },
                    { id: MyFeedCategory.Achievements, label: t("achievements") },
                    { id: MyFeedCategory.People, label: t("people") },
                ],
            },
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
        selectCategory: (key) => setCategory(key as MyFeedCategory),
        feed: {
            resultAction: state === "filteredEmpty"
                ? () => setCategory(MyFeedCategory.All)
                : state === "platformEmpty"
                    ? () => router.push("/courses")
                    : () => { void query.mutate() },
            ...actions,
        },
        loadMore: () => { void query.setSize(query.size + 1) },
        retryLoadMore: () => { void query.mutate() },
    }} />
}

/** Source-level ownership marker for the connected social block. */
export const meta = { world: "connected", domain: "social" } as const
