import { ModalBranch } from "@/components/branches/ModalBranch"
import { GlobalSearchResultsBase } from "@/components/blocks/search/GlobalSearchResults/component"
import { SearchCommandField } from "@/components/leaves/SearchCommandField"
import { SelectionList } from "@/components/leaves/SelectionList"
import { Text } from "@/components/leaves/Text"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import type { IconName } from "@/components/leaves/Icon"

/** One localized scope row shown by the pure workspace. */
export type GlobalSearchScopeView = {
    readonly id: string
    readonly textValue: string
    readonly label: string
    readonly icon: IconName
    readonly count: number
}

/** One safe, localized result row shown by the pure workspace. */
export type GlobalSearchResultView = {
    readonly id: string
    readonly textValue: string
    readonly title: string
    readonly snippet?: string
    readonly kindLabel: string
    readonly statusLabel?: string
}

/** Detail API state for the selected result; autocomplete copy never fills this slot. */
export type GlobalSearchDetailView =
    | { readonly status: "idle" }
    | { readonly status: "pending"; readonly kindLabel: string }
    | { readonly status: "error"; readonly kindLabel: string }
    | {
        readonly status: "ready"
        readonly id: string
        readonly title: string
        readonly description?: string
        readonly kindLabel: string
        readonly statusLabel?: string
    }

type GlobalSearchSettledState = {
    readonly query: string
    readonly scopes: ReadonlyArray<GlobalSearchScopeView>
    readonly selectedScope: string
    readonly results: ReadonlyArray<GlobalSearchResultView>
    readonly selectedResult?: string
    readonly isPending?: boolean
    readonly detail: GlobalSearchDetailView
}

/** Settled and transitional states the pure overlay can render. */
export type GlobalSearchOverlayRenderState =
    | ({ readonly status: "idle" } & GlobalSearchSettledState)
    | ({ readonly status: "pending-empty" } & GlobalSearchSettledState)
    | ({ readonly status: "pending-stale" } & GlobalSearchSettledState)
    | ({ readonly status: "ready" } & GlobalSearchSettledState)
    | ({ readonly status: "empty" } & GlobalSearchSettledState)
    | ({ readonly status: "error" } & GlobalSearchSettledState)

/** Complete localized copy required by the workspace. */
export type GlobalSearchOverlayCopy = {
    readonly label: string
    readonly placeholder: string
    readonly clearLabel: string
    readonly shortcut: string
    readonly scopesLabel: string
    readonly resultsLabel: string
    readonly idleMessage: string
    readonly idleDescription: string
    readonly emptyMessage: string
    readonly emptyDescription: string
    readonly errorMessage: string
    readonly errorDescription: string
    readonly browseCourses: string
    readonly retry: string
    readonly openResult: string
    readonly detailLoading: string
    readonly detailError: string
}

/** Named outcomes reported by workspace controls. */
export type GlobalSearchOverlayActions = {
    readonly queryChange?: (value: string) => void
    readonly clear?: () => void
    readonly scopeSelect?: (key: string) => void
    readonly resultPreview?: (key: string) => void
    readonly resultOpen?: (key: string) => void
    readonly previous?: () => void
    readonly next?: () => void
    readonly submit?: () => void
    readonly retry?: () => void
    readonly browseCourses?: () => void
    readonly dismiss?: () => void
}

/** Pure data, copy and actions accepted by the workspace twin. */
export type GlobalSearchOverlayViewProps = {
    readonly isOpen: boolean
    readonly state: GlobalSearchOverlayRenderState
    readonly copy: GlobalSearchOverlayCopy
    readonly on?: GlobalSearchOverlayActions
}

/** Pure rendering half for the large, keyboard-operated search workspace. */
export const GlobalSearchOverlayView = (props: GlobalSearchOverlayViewProps) => {
    const scopeList = (
        <SelectionList
            props={{
                label: props.copy.scopesLabel,
                variant: "scopes",
                selectedKey: props.state.selectedScope,
                items: props.state.scopes.map((scope) => ({
                    id: scope.id,
                    textValue: scope.textValue,
                    title: scope.label,
                    icon: scope.icon,
                    badge: String(scope.count),
                })),
            }}
            on={{ select: props.on?.scopeSelect, activate: props.on?.scopeSelect }}
        />
    )
    const notice = (() => {
        if (props.state.status === "error") return { message: props.copy.errorMessage, description: props.copy.errorDescription, actionLabel: props.copy.retry, action: props.on?.retry }
        if (props.state.status === "empty") return { message: props.copy.emptyMessage, description: props.copy.emptyDescription, actionLabel: props.copy.browseCourses, action: props.on?.browseCourses }
        return { message: props.copy.idleMessage, description: props.copy.idleDescription, actionLabel: props.copy.browseCourses, action: props.on?.browseCourses }
    })()
    const resultRegion = (
        <GlobalSearchResultsBase
            props={{
                label: props.copy.resultsLabel,
                items: props.state.results.map((result) => ({
                    id: result.id,
                    textValue: result.textValue,
                    title: result.title,
                    badge: result.statusLabel ?? result.kindLabel,
                })),
                selectedKey: props.state.selectedResult,
                emptyMessage: notice.message,
                emptyDescription: notice.description,
                emptyActionLabel: notice.actionLabel,
            }}
            isLoading={props.state.status === "pending-stale"}
            on={{ select: props.on?.resultPreview, recover: notice.action }}
        />
    )
    const detailTitle = (() => {
        if (props.state.detail.status === "idle") return undefined
        if (props.state.detail.status === "pending") return props.copy.detailLoading
        if (props.state.detail.status === "error") return props.copy.detailError
        return props.state.detail.title
    })()
    const detailKind = props.state.detail.status === "idle" ? undefined : props.state.detail.kindLabel
    const detailDescription = props.state.detail.status === "ready" ? props.state.detail.description : undefined
    const detailStatus = props.state.detail.status === "ready" ? props.state.detail.statusLabel : undefined
    const detailId = props.state.detail.status === "ready" ? props.state.detail.id : undefined
    const context = detailTitle === undefined || detailKind === undefined ? undefined : (
        <div>
            <Text props={{ content: detailTitle, size: "sm", weight: "medium" }} />
            <Text props={{ content: detailKind, size: "xs", tone: "muted" }} />
            {detailDescription === undefined ? null : <Text props={{ content: detailDescription, size: "sm" }} />}
            {detailStatus === undefined ? null : <Badge props={{ content: detailStatus, tone: "accent" }} />}
            {(() => {
                if (props.state.detail.status === "error") {
                    return <Button props={{ label: props.copy.retry, variant: "secondary", size: "sm" }} on={{ press: props.on?.retry }} />
                }
                if (detailId === undefined) return undefined
                return (
                    <Button
                        props={{ label: props.copy.openResult, variant: "primary", size: "sm", icon: "next", iconPlacement: "trailing" }}
                        on={{ press: () => props.on?.resultOpen?.(detailId) }}
                    />
                )
            })()}
        </div>
    )
    return (
        <ModalBranch
            isOpen={props.isOpen}
            size="cover"
            onDismiss={() => props.on?.dismiss?.()}
        >
            <SearchCommandField
                props={{
                    id: "global-search-command", value: props.state.query, label: props.copy.label,
                    placeholder: props.copy.placeholder, clearLabel: props.copy.clearLabel, shortcut: props.copy.shortcut,
                    activeDescendant: props.state.selectedResult, isPending: props.state.isPending,
                }}
                on={{ change: props.on?.queryChange, clear: props.on?.clear, previous: props.on?.previous, next: props.on?.next, submit: props.on?.submit }}
            />
            <div>{scopeList}{resultRegion}{context}</div>
        </ModalBranch>
    )
}

/** Source-level identity for the pure search overlay twin. */
