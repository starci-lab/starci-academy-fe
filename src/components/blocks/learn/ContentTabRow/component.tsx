import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import type { IconName } from "@/components/leaves/Icon"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * BLOCK - `ContentTabRow`: the content's two tab axes on one row.
 *
 * Target path on materialization: `src/components/blocks/learn/ContentTabRow/component.tsx`.
 *
 * IT IS ITS OWN COMPONENT for the reason the dashboard's tab row is: two independent selections
 * that share a row are one thing to a reader and two things to the code, and a page that assembles
 * them inline ends up owning both selections plus the rule about which collapses first. The
 * dashboard already answered this by extracting its row; this is the same answer for the reader.
 *
 * LEFT IS WHAT THIS LESSON IS, RIGHT IS HOW YOU WANT IT. Legacy keys the left group by `ContentTab`
 * - article, code explainings, challenges, sandbox, AI lab, captured runs - and each carries a glyph
 * and, when the content is locked, a lock. The right group is the language the examples are shown in,
 * neutral rather than primary, because switching TypeScript for Python does not change which face of
 * the content is open. Two axes, one row, and neither borrows the other's meaning.
 *
 * THE ROW IS NOT DRAWN WHEN THERE IS NOTHING TO CHOOSE. One face and one language is a toolbar that
 * cannot move, which reads as a broken control rather than an absent one.
 */

/** One face of the content - a tab the content actually carries. */
export type ContentFaceId = "reading" | "challenge" | "ai"

/** One finite reader face and whether its producer can currently open it. */
export type ContentFaceTab = {
    readonly id: ContentFaceId
    readonly label: string
    /** The glyph legacy draws beside the name; the shape is the more direct label. */
    readonly icon?: IconName
    readonly disabled?: boolean
    readonly locked?: boolean
}

/** One language the examples can be read in. */
export type ContentLanguageTab = {
    readonly id: string
    readonly label: string
}

/** What the row draws. */
export type ContentTabRowData = {
    readonly facesLabel: string
    readonly faces: ReadonlyArray<ContentFaceTab>
    readonly selectedFace?: ContentFaceId
    readonly languagesLabel?: string
    readonly languages?: ReadonlyArray<ContentLanguageTab>
    readonly selectedLanguage?: string
}

/** What the row reports. */
export type ContentTabRowActions = {
    readonly selectReading?: () => void
    readonly selectChallenge?: () => void
    readonly selectAi?: () => void
    readonly selectLanguage?: (language: string) => void
}

/** Dispatch one finite face without allowing disabled or locked producers to run. */
const selectFace = (
    faces: ReadonlyArray<ContentFaceTab>,
    on: ContentTabRowActions | undefined,
    faceId: string,
) => {
    const face = faces.find((candidate) => candidate.id === faceId)
    if (face === undefined || face.disabled === true || face.locked === true) return
    if (face.id === "reading") on?.selectReading?.()
    if (face.id === "challenge") on?.selectChallenge?.()
    if (face.id === "ai") on?.selectAi?.()
}

/**
 * Build the two-axis toolbar as validated content for `dual-tabs-toolbar`.
 *
 * It returns the contract's content rather than a node, so the page places the row where the page
 * decides and the row keeps its own two selections - the split the dashboard's own tab row uses.
 *
 * @param props - {@link ContentTabRowData}
 * @param on - {@link ContentTabRowActions}
 */
export const contentTabRow = (props: ContentTabRowData, on?: ContentTabRowActions) =>
    defineContractComponent("dual-tabs-toolbar", {
        // The faces are a PANEL switch, so they take the segmented pill rather than the filter
        // underline: pressing one replaces what is being read rather than narrowing it.
        leading: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: props.facesLabel,
                    selectedKey: props.selectedFace ?? props.faces[0]?.id ?? "",
                    variant: "primary",
                    tabs: props.faces.map((face) => ({
                        id: face.id,
                        label: face.label,
                        ...(face.icon === undefined ? {} : { icon: face.icon }),
                    })),
                }}
                on={{ select: (faceId) => selectFace(props.faces, on, faceId) }}
            />
        )),
        trailing: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: props.languagesLabel ?? "",
                    selectedKey: props.selectedLanguage ?? props.languages?.[0]?.id ?? "",
                    // Neutral, as legacy draws it: the language qualifies the examples inside the
                    // face rather than choosing a face, so it must not compete with the pill.
                    variant: "secondary",
                    tabs: (props.languages ?? []).map((language) => ({ id: language.id, label: language.label })),
                }}
                on={{ select: on?.selectLanguage }}
            />
        )),
    })

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
