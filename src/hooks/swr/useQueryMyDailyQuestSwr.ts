import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyDailyQuest } from "../../modules/api/graphql/queries/query-my-daily-quest"
import { type MyDailyQuestData } from "../../modules/api/graphql/queries/types/my-daily-quest"

/**
 * The cache key for the asking learner's quest today.
 *
 * Exported so that whatever COLLECTS the reward can revalidate the board it just changed. A quest
 * still offering a reward the reader has taken is the most confusing kind of stale: they have
 * visible evidence the request happened.
 */
export const QUERY_MY_DAILY_QUEST_SWR_KEY = ["QUERY_MY_DAILY_QUEST_SWR"]

/**
 * Reads the asking learner's quest for today.
 *
 * The envelope is unwrapped here, once, so no component reaches through `data.myDailyQuest.data`.
 * A missing payload becomes `null` rather than `undefined`, so a component can still tell "there
 * is no quest for you today" from "the quest is on its way".
 */
export const useQueryMyDailyQuestSwr = () => {
    const viewer = useViewerKey()
    return useSWR<MyDailyQuestData | null>(
        viewer === undefined ? null : [...QUERY_MY_DAILY_QUEST_SWR_KEY, viewer],
        async () => {
            const result = await queryMyDailyQuest()
            return result.data?.myDailyQuest?.data ?? null
        },
    )
}
