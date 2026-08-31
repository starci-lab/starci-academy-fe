import { cn } from "@heroui/react"

/** Course-owned Community page flow inside the persistent Learn shell. */
export const communityPageClassName = cn("@container", "box-border", "mx-auto", "flex", "w-full", "max-w-[96rem]", "min-w-0", "flex-col", "gap-6", "px-4", "py-6", "@app-sm:px-6", "@app-lg:px-8", "@app-xl:py-8")
/** Breadcrumb and page identity remain one compact reading group. */
export const communityHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Feed tools reflow before either search or filter becomes cramped. */
export const communityToolbarClassName = `${cn("grid", "min-w-0", "grid-cols-1", "gap-3", "@app-sm:items-center", "[&>form]:min-w-0")} @app-sm:grid-cols-[minmax(0,1fr)_auto]`
/** Filter controls form one peer group, not two unrelated actions. */
export const communityFiltersClassName = cn("flex", "min-w-0", "items-center", "gap-2")
/** Dominant feed/detail column uses a stable vertical rhythm. */
export const communityPrimaryClassName = cn("flex", "min-w-0", "flex-col", "gap-5")
/** Fatal access/load recovery owns a readable centered measure instead of leaving an empty rail column. */
export const communityFatalClassName = cn("mx-auto", "w-full", "max-w-2xl")
/** Supporting facts stack in the rail without creating a second dashboard. */
export const communityRailClassName = cn("grid", "min-w-0", "grid-cols-1", "items-start", "gap-4", "@app-sm:grid-cols-2", "@app-lg:grid-cols-1")
/** Composer content and its recovery feedback stay in one bounded surface. */
export const communityComposerClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4")
/** Composer action follows the field on compact surfaces. */
export const communityComposerFooterClassName = cn("flex", "min-w-0", "flex-col", "items-stretch", "gap-3", "border-t", "border-separator", "pt-3", "@app-sm:flex-row", "@app-sm:items-center", "@app-sm:justify-between", "[&_.button]:shrink-0")
/** Joined feed rows retain their own reading order and shared separators. */
export const communityPostListClassName = cn("m-0", "flex", "min-w-0", "list-none", "flex-col", "divide-y", "divide-separator", "p-0")
/** One post row groups identity, prose and interaction evidence. */
export const communityPostClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4")
/** Author identity and ownership mark remain readable on narrow rows. */
export const communityAuthorRowClassName = cn("flex", "min-w-0", "items-center", "justify-between", "gap-3")
/** Avatar and author copy stay one semantic identity. */
export const communityAuthorClassName = cn("flex", "min-w-0", "items-center", "gap-3")
/** Author name and timestamp wrap safely rather than clipping. */
export const communityAuthorCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-0.5", "break-words", "[overflow-wrap:anywhere]")
/** User-authored prose preserves paragraph rhythm and long tokens. */
export const communityBodyClassName = cn("whitespace-pre-wrap", "break-words", "text-sm", "leading-6", "text-foreground", "[overflow-wrap:anywhere]")
/** Interaction actions wrap as a single compact cluster. */
export const communityActionsClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2", "border-t", "border-separator", "pt-3")
/** Detail-only owner controls stay subordinate to discussion actions. */
export const communityOwnerActionsClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** Comment thread remains a joined chronological list. */
export const communityCommentListClassName = cn("m-0", "flex", "min-w-0", "list-none", "flex-col", "divide-y", "divide-separator", "p-0")
/** One comment keeps its author, prose and actions aligned. */
export const communityCommentClassName = cn("flex", "min-w-0", "items-start", "gap-3", "p-4")
/** Reply rows communicate nesting without a nested elevated card. */
export const communityReplyClassName = cn("ml-6", "border-l-2", "border-accent/25", "pl-3", "@app-sm:ml-10")
/** Resolve the semantic thread depth without leaking styling into the renderer. */
export const getCommunityCommentClassName = (reply: boolean) => cn(communityCommentClassName, reply ? communityReplyClassName : undefined)
/** Comment prose owns remaining width next to its avatar. */
export const communityCommentContentClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-2")
/** Rail facts compare one label and one value on a predictable axis. */
export const communityFactListClassName = cn("flex", "min-w-0", "flex-col", "overflow-hidden", "rounded-2xl", "bg-surface-secondary")
/** One supporting fact row. */
export const communityFactClassName = cn("flex", "min-w-0", "items-baseline", "justify-between", "gap-4", "px-4", "py-3", "[&+&]:border-t", "[&+&]:border-separator")
/** Community guidance stays compact and scannable. */
export const communityGuidanceClassName = cn("m-0", "flex", "min-w-0", "list-disc", "flex-col", "gap-2", "pl-5", "text-sm", "leading-6", "text-muted")
/** Stale-data failure is visible without replacing still-usable content. */
export const communityStaleNoticeClassName = cn("flex", "min-w-0", "flex-col", "items-start", "gap-2", "rounded-2xl", "bg-warning-soft", "p-4", "text-warning-soft-foreground", "@app-sm:flex-row", "@app-sm:items-center", "@app-sm:justify-between")
/** Inline mutation failure remains adjacent to the retained authored text. */
export const communityInlineErrorClassName = cn("text-sm", "leading-5", "text-danger")
/** Back control remains at the start of the detail reading flow. */
export const communityBackClassName = cn("self-start")
