import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import type {
    DailyQuestContentData,
    DailyQuestContentProps,
} from "@/components/blocks/dashboard/DailyQuest/component"
import { defineContractComponent } from "@/components/contracts/props"

/** A real component type used only to prove the generic contract/props fence. */
const DailyQuestView = (input: DailyQuestContentProps) => {
    void input
    return null
}

/** The exact contract identity carried by the component type. */
const dailyQuestContent = defineContractComponent("daily-quest-list", DailyQuestView)

/** Complete runtime data accepted by both the surface and its content component. */
const dailyQuestProps: DailyQuestContentData = {
    label: "Today's quest",
    tasks: [],
}

/** The intended component-type lane compiles. */
export const validSurfaceList = (
    <SurfaceListCard
        contract="daily-quest-list"
        render={dailyQuestContent}
        props={dailyQuestProps}
    />
)

/** A component branded for another contract cannot enter the list host. */
const wrongContractContent = defineContractComponent("empty-notice-card", DailyQuestView)

/** Compile-time refusal fixture for a mismatched contract identity. */
export const wrongContractSurfaceList = (
    <SurfaceListCard
        contract="daily-quest-list"
        // @ts-expect-error -- this component carries `empty-notice-card`, not `daily-quest-list`.
        render={wrongContractContent}
        props={dailyQuestProps}
    />
)

/** Compile-time refusal fixture for missing content data. */
export const missingDataSurfaceList = (
    <SurfaceListCard
        contract="daily-quest-list"
        render={dailyQuestContent}
        // @ts-expect-error -- `DailyQuestContentData` requires the runtime task collection.
        props={{ label: "Today's quest" }}
    />
)
