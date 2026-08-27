"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import type { IconName } from "@/components/leaves/Icon"
import { useQueryAutocompleteGlobalSearchSwr, useQueryGlobalSearchDetailSwr } from "@/hooks"
import {
    countGlobalSearchScope,
    flattenGlobalSearch,
    GLOBAL_SEARCH_SCOPES,
    GLOBAL_SEARCH_SCOPE_ENTITIES,
    type GlobalSearchResult,
    type GlobalSearchScope,
} from "@/modules/search/global-search"
import {
    GlobalSearchOverlayView,
    type GlobalSearchOverlayRenderState,
    type GlobalSearchResultView,
} from "./component"

/** Identity and summoner recorded for one overlay opening. */
export type GlobalSearchOpenIntent = {
    readonly requestId: number
    readonly source: "navbar" | "shortcut"
}

/** Connected overlay intent and its single dismissal outcome. */
export type GlobalSearchOverlayProps = {
    readonly intent?: GlobalSearchOpenIntent
    readonly on?: { readonly dismissed?: () => void }
}

const resultStatusKey = (result: GlobalSearchResult): "enrolled" | "free" | "premium" | undefined => {
    if (result.isEnrolled === true) return "enrolled"
    if (result.isFree === true) return "free"
    if (result.isPremium === true) return "premium"
    return undefined
}

const SCOPE_ICONS: Record<GlobalSearchScope, IconName> = {
    all: "viewGrid",
    courses: "course",
    learning: "review",
    practice: "practice",
    projects: "jobs",
    foundations: "talents",
}

/** Connected owner for query timing, bucket mapping, selection and canonical navigation. */
export const GlobalSearchOverlay = (props: GlobalSearchOverlayProps) => {
    const t = useTranslations("globalSearch")
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [scope, setScope] = useState<GlobalSearchScope>("all")
    const [selectedResult, setSelectedResult] = useState<string>()
    const isOpen = props.intent !== undefined

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 200)
        return () => window.clearTimeout(timer)
    }, [query])

    const search = useQueryAutocompleteGlobalSearchSwr({
        query: debouncedQuery,
        entities: GLOBAL_SEARCH_SCOPE_ENTITIES[scope],
        size: 6,
        enabled: isOpen,
    })
    const results = useMemo(
        () => flattenGlobalSearch(search.data, scope),
        [scope, search.data],
    )
    const selected = results.find((result) => result.key === selectedResult)
    const detail = useQueryGlobalSearchDetailSwr(selected === undefined ? undefined : {
        bucket: selected.bucket,
        id: selected.id,
        displayId: selected.displayId,
    })
    useEffect(() => {
        if (selectedResult !== undefined && !results.some((result) => result.key === selectedResult)) {
            setSelectedResult(undefined)
        }
    }, [results, selectedResult])

    const resultViews: ReadonlyArray<GlobalSearchResultView> = results.map((result) => {
        const status = resultStatusKey(result)
        return {
            id: result.key,
            textValue: result.title,
            title: result.title,
            snippet: result.segments.map((segment) => segment.text).join(""),
            kindLabel: t(`kinds.${result.bucket}`),
            statusLabel: status === undefined ? undefined : t(`status.${status}`),
        }
    })
    const scopes = GLOBAL_SEARCH_SCOPES.map((id) => ({
        id,
        textValue: t(`scopes.${id}`),
        label: t(`scopes.${id}`),
        icon: SCOPE_ICONS[id],
        count: countGlobalSearchScope(search.data, id),
    }))
    const status: GlobalSearchOverlayRenderState["status"] = (() => {
        if (query.trim().length === 0) return "idle"
        if (search.error !== undefined) return "error"
        if (search.isLoading && results.length === 0) return "pending-empty"
        if (search.isValidating && results.length > 0) return "pending-stale"
        return results.length === 0 ? "empty" : "ready"
    })()
    const detailState: GlobalSearchOverlayRenderState["detail"] = (() => {
        if (selected === undefined) return { status: "idle" as const }
        if (detail.error !== undefined) return { status: "error" as const, kindLabel: t(`kinds.${selected.bucket}`) }
        if (detail.isLoading || detail.data === undefined) return { status: "pending" as const, kindLabel: t(`kinds.${selected.bucket}`) }
        if (detail.data === null) return { status: "error" as const, kindLabel: t(`kinds.${selected.bucket}`) }
        const selectedStatus = resultStatusKey(selected)
        return {
            status: "ready" as const,
            id: selected.key,
            title: detail.data.title,
            description: detail.data.description ?? undefined,
            kindLabel: t(`kinds.${selected.bucket}`),
            statusLabel: selectedStatus === undefined ? undefined : t(`status.${selectedStatus}`),
        }
    })()
    const state: GlobalSearchOverlayRenderState = {
        status,
        query,
        scopes,
        selectedScope: scope,
        results: resultViews,
        selectedResult,
        isPending: search.isLoading || search.isValidating,
        detail: detailState,
    }

    const openResult = useCallback((key: string) => {
        const result = results.find((candidate) => candidate.key === key)
        if (result?.path === undefined || result.path === null) return
        props.on?.dismissed?.()
        router.push(result.path)
    }, [props.on, results, router])
    const move = useCallback((offset: number) => {
        if (results.length === 0) return
        const current = Math.max(0, results.findIndex((result) => result.key === selectedResult))
        const next = (current + offset + results.length) % results.length
        setSelectedResult(results[next]?.key)
    }, [results, selectedResult])

    return (
        <GlobalSearchOverlayView
            isOpen={isOpen}
            state={state}
            copy={{
                label: t("label"),
                placeholder: t("placeholder"),
                clearLabel: t("clear"),
                shortcut: t("shortcut"),
                scopesLabel: t("scopesLabel"),
                resultsLabel: t("resultsLabel"),
                idleMessage: t("idle.message"),
                idleDescription: t("idle.description"),
                emptyMessage: t("empty.message"),
                emptyDescription: t("empty.description"),
                errorMessage: t("error.message"),
                errorDescription: t("error.description"),
                browseCourses: t("actions.browseCourses"),
                retry: t("actions.retry"),
                openResult: t("actions.openResult"),
                detailLoading: t("detail.loading"),
                detailError: t("detail.error"),
            }}
            on={{
                queryChange: (value) => { setQuery(value); setSelectedResult(undefined) },
                clear: () => { setQuery(""); setSelectedResult(undefined) },
                scopeSelect: (key) => { setScope(key as GlobalSearchScope); setSelectedResult(undefined) },
                resultPreview: setSelectedResult,
                resultOpen: openResult,
                previous: () => move(-1),
                next: () => move(1),
                submit: () => selectedResult === undefined ? undefined : openResult(selectedResult),
                retry: () => selected === undefined ? void search.mutate() : void detail.mutate(),
                browseCourses: () => {
                    props.on?.dismissed?.()
                    router.push("/courses")
                },
                dismiss: props.on?.dismissed,
            }}
        />
    )
}

/** Source-level identity for the connected search owner. */
