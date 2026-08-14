"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryContentSwr } from "~candidate/hooks/swr/useQueryContentSwr"
import { useQueryModuleSwr } from "~candidate/hooks/swr/useQueryModuleSwr"
import {
    _CourseLearnContentPage,
    type ContentOutlineEntry,
    type CourseLearnContentPageState,
} from "~candidate/components/pages/CourseLearnContentPage/component"

/**
 * The content reader, connected.
 *
 * IT READS TWO ANSWERS BECAUSE THEY CHANGE AT DIFFERENT RATES. The content is replaced on every
 * page turn; the module around it stays exactly true while that happens. One document for both
 * would re-fetch the whole map each time the reader moved inside it, and the rail would blink on
 * every turn of the page it is supposed to hold still for.
 *
 * LOCKED IS A STATE, NOT AN ERROR, and the server decides it. A premium content arrives with its
 * body already truncated and `isPremium` set; this maps that pair to `locked` and hands the page
 * the body it was given. Nothing here decides how much of a paid lesson a reader may see - a client
 * that cut the body would be a client that could be asked not to.
 *
 * FAILURE IS NOT EMPTINESS. `error` means the request failed and the reader is told so; a settled
 * request with no content is the same sentence for a different reason, and both are `failed`
 * rather than an empty reading surface pretending the lesson has no words.
 *
 * THE OUTLINE IS READ FROM THE MARKDOWN, not from the rendered DOM. The reference scans headings
 * out of the article element after it paints, which needs a live document and a scroll observer;
 * this derives the same list from the source the article is drawn from, so the rail is correct on
 * the first frame. Which entry the reader is LEVEL with still needs that observer, and until it
 * exists no entry claims to be current - a wrong current entry is worse than none.
 */

/** What the route hands this page. */
export interface CourseLearnContentPageProps {
    /** The course this reading belongs to, as its display id. */
    displayId: string
    /** The module the content sits in. */
    moduleId: string
    /** The content being read. */
    contentId: string
}

/** Markdown headings, in order, with the depth the outline indents by. */
const outlineOf = (body: string): Array<ContentOutlineEntry> => {
    const entries: Array<ContentOutlineEntry> = []
    for (const line of body.split(/\r?\n/)) {
        const heading = /^(#{2,4})\s+(.*\S)\s*$/.exec(line)
        if (heading === null) continue
        const depth = heading[1].length - 1
        entries.push({
            id: `${entries.length + 1}`,
            label: heading[2],
            depth: depth <= 1 ? 1 : depth === 2 ? 2 : 3,
        })
    }
    return entries
}

/**
 * Read one content.
 *
 * @param input - {@link CourseLearnContentPageProps}
 */
export const CourseLearnContentPage = (input: CourseLearnContentPageProps) => {
    const t = useTranslations("learn.content")
    const router = useRouter()
    const content = useQueryContentSwr({ id: input.contentId })
    const module = useQueryModuleSwr({ id: input.moduleId })

    const isPending = content.data === undefined && content.error === undefined
    const hasFailed = content.error !== undefined || (content.data === null && !isPending)
    const isLocked = content.data?.isPremium === true
    const state: CourseLearnContentPageState = isPending
        ? "pending"
        : hasFailed ? "failed" : isLocked ? "locked" : "ready"

    const body = content.data?.body
    const outline = useMemo(() => body === undefined ? [] : outlineOf(body), [body])

    // The reader's place in the module: the pager counts contents, and the module states how many.
    const contents = module.data?.contents ?? []
    const ordered = useMemo(
        () => [...contents].sort((first, second) => first.orderIndex - second.orderIndex),
        [contents],
    )
    const position = ordered.findIndex((sibling) => sibling.id === input.contentId)

    const openContent = (id: string) => {
        router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${id}`)
    }

    return (
        <_CourseLearnContentPage
            state={state}
            props={{
                labels: {
                    navCourse: t("navCourse"),
                    navModule: content.data?.module.title ?? t("navModule"),
                    facesLabel: t("facesLabel"),
                    searchPlaceholder: t("searchPlaceholder"),
                    searchLabel: t("searchLabel"),
                    searchClearLabel: t("searchClearLabel"),
                    outlineTitle: t("outlineTitle"),
                    pageLabel: t("pageLabel"),
                    previousLabel: t("previousLabel"),
                    nextLabel: t("nextLabel"),
                    reactionsLabel: t("reactionsLabel"),
                    reactionPrompt: t("reactionPrompt"),
                    nextTitle: t("nextTitle"),
                },
                title: content.data?.title,
                body,
                selectionHint: t("selectionHint"),
                // A premium content and a failed request are told apart by which sentence they get,
                // in the same place, with the same one way out.
                noticeMessage: isLocked ? t("lockedMessage") : hasFailed ? t("failedMessage") : undefined,
                noticeActionLabel: isLocked ? t("lockedAction") : hasFailed ? t("failedAction") : undefined,
                outline,
                modules: module.data === null || module.data === undefined ? [] : [{
                    id: module.data.id,
                    title: module.data.title,
                    countLabel: t("moduleCount", { total: module.data.numContents }),
                    isOpen: true,
                    contents: ordered.map((sibling) => ({
                        id: sibling.id,
                        title: sibling.title,
                        meta: t("minutes", { minutes: sibling.minutesRead }),
                        isCurrent: sibling.id === input.contentId,
                    })),
                }],
                page: position === -1 ? 1 : position + 1,
                totalPages: ordered.length === 0 ? 1 : ordered.length,
            }}
            on={{
                changePage: (page: number) => {
                    const target = ordered[page - 1]
                    if (target === undefined) return
                    openContent(target.id)
                },
                goCourse: () => router.push(`/courses/${input.displayId}`),
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
