import { Tree } from "@/components/branches/Tree"
import { _GlobalSearchResults } from "@/components/blocks/search/GlobalSearchResults/component"
import { SearchCommandField } from "@/components/leaves/SearchCommandField"
import { SelectionList } from "@/components/leaves/SelectionList"
import { Text } from "@/components/leaves/Text"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import type { IconName } from "@/components/leaves/Icon"
import { ModalShell } from "@/components/shells/ModalShell"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

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
export const _GlobalSearchOverlay = ({ isOpen, state, copy, on }: GlobalSearchOverlayViewProps) => {
    const scopeList = defineLeafComponent("selection-list", {}, () => (
        <SelectionList
            props={{
                label: copy.scopesLabel,
                variant: "scopes",
                selectedKey: state.selectedScope,
                items: state.scopes.map((scope) => ({
                    id: scope.id,
                    textValue: scope.textValue,
                    title: scope.label,
                    icon: scope.icon,
                    badge: String(scope.count),
                })),
            }}
            on={{ select: on?.scopeSelect, activate: on?.scopeSelect }}
        />
    ))
    const notice = state.status === "error"
        ? { message: copy.errorMessage, description: copy.errorDescription, actionLabel: copy.retry, action: on?.retry }
        : state.status === "empty"
            ? { message: copy.emptyMessage, description: copy.emptyDescription, actionLabel: copy.browseCourses, action: on?.browseCourses }
            : { message: copy.idleMessage, description: copy.idleDescription, actionLabel: copy.browseCourses, action: on?.browseCourses }
    const resultRegion = defineContractProjection("global-search-result-region", () => (
        <_GlobalSearchResults
            props={{
                label: copy.resultsLabel,
                items: state.results.map((result) => ({
                    id: result.id,
                    textValue: result.textValue,
                    title: result.title,
                    badge: result.statusLabel ?? result.kindLabel,
                })),
                selectedKey: state.selectedResult,
                emptyMessage: notice.message,
                emptyDescription: notice.description,
                emptyActionLabel: notice.actionLabel,
            }}
            isLoading={state.status === "pending-stale"}
            on={{ select: on?.resultPreview, recover: notice.action }}
        />
    ))
    const detailTitle = state.detail.status === "idle"
        ? undefined
        : state.detail.status === "pending"
            ? copy.detailLoading
            : state.detail.status === "error"
                ? copy.detailError
                : state.detail.title
    const detailKind = state.detail.status === "idle" ? undefined : state.detail.kindLabel
    const detailDescription = state.detail.status === "ready" ? state.detail.description : undefined
    const detailStatus = state.detail.status === "ready" ? state.detail.statusLabel : undefined
    const detailId = state.detail.status === "ready" ? state.detail.id : undefined
    const context = detailTitle === undefined || detailKind === undefined ? undefined : defineContractComponent("global-search-context-card", {
        title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
            <Text props={{ content: detailTitle, size: "sm", weight: "medium" }} />
        )),
        kind: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: detailKind, size: "xs", tone: "muted" }} />
        )),
        snippet: detailDescription === undefined ? undefined : defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: detailDescription, size: "sm" }} />
        )),
        status: detailStatus === undefined ? undefined : defineLeafComponent("badge", {}, () => (
            <Badge props={{ content: detailStatus, tone: "accent" }} />
        )),
        action: state.detail.status === "error"
            ? defineLeafComponent("button", {}, () => (
                <Button props={{ label: copy.retry, variant: "secondary", size: "sm" }} on={{ press: on?.retry }} />
            ))
            : detailId !== undefined
                ? defineLeafComponent("button", {}, () => (
                    <Button
                        props={{ label: copy.openResult, variant: "primary", size: "sm", icon: "next", iconPlacement: "trailing" }}
                        on={{ press: () => on?.resultOpen?.(detailId) }}
                    />
                ))
                : undefined,
    })
    return (
        <ModalShell isOpen={isOpen} size="cover" onDismiss={() => on?.dismiss?.()}>
            <Tree
                contract="global-search-workspace"
                render={defineContractComponent("global-search-workspace", {
                    query: defineLeafComponent("search-command-field", {}, () => (
                        <SearchCommandField
                            props={{
                                id: "global-search-command",
                                value: state.query,
                                label: copy.label,
                                placeholder: copy.placeholder,
                                clearLabel: copy.clearLabel,
                                shortcut: copy.shortcut,
                                activeDescendant: state.selectedResult,
                                isPending: state.isPending,
                            }}
                            on={{
                                change: on?.queryChange,
                                clear: on?.clear,
                                previous: on?.previous,
                                next: on?.next,
                                submit: on?.submit,
                            }}
                        />
                    )),
                    body: defineContractComponent("global-search-body", {
                        scopes: scopeList,
                        results: resultRegion,
                        context,
                    }),
                })}
            />
        </ModalShell>
    )
}

/** Source-level identity for the pure search overlay twin. */
export const meta = { world: "pure", domain: "search" } as const
