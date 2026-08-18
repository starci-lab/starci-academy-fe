import { describe, expect, it } from "vitest"
import { ActivityType, MyFeedCategory, MyFeedTab } from "./my-feed"
import { ReactionType } from "./reactions"

/*
 * These literals ARE the contract. The backend serializes each enum as the string spelled here, so
 * a rename that looks harmless in TypeScript silently stops matching a payload the client cannot
 * see. Asserting the whole object rather than a member also fails when a kind is added without the
 * feed surfaces being told.
 */
describe("dashboard feed enums", () => {
    it("spells every activity kind exactly as the feed payload sends it", () => {
        expect({ ...ActivityType }).toEqual({
            LessonRead: "lessonRead",
            LessonBookmarked: "lessonBookmarked",
            ChallengePassed: "challengePassed",
            CodingSolved: "codingSolved",
            MilestonePassed: "milestonePassed",
            AiLabPassed: "aiLabPassed",
            CourseEnrolled: "courseEnrolled",
            DiscussionCommented: "discussionCommented",
            UserFollowed: "userFollowed",
        })
    })

    it("offers exactly the two feeds the tab strip can request", () => {
        expect({ ...MyFeedTab }).toEqual({ ForYou: "forYou", Following: "following" })
    })

    it("offers exactly the four category filters the feed request accepts", () => {
        expect({ ...MyFeedCategory }).toEqual({
            All: "all",
            Courses: "courses",
            Achievements: "achievements",
            People: "people",
        })
    })
})

describe("reaction kinds", () => {
    it("spells every reaction exactly as the reaction mutation accepts it", () => {
        expect({ ...ReactionType }).toEqual({
            Like: "like",
            Love: "love",
            Haha: "haha",
            Wow: "wow",
            Sad: "sad",
            Angry: "angry",
        })
    })
})
