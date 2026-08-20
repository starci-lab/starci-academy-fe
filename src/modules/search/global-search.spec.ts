import { describe, expect, it } from "vitest"
import {
    countGlobalSearchScope,
    flattenGlobalSearch,
    GLOBAL_SEARCH_BUCKETS,
    GLOBAL_SEARCH_SCOPE_ENTITIES,
    GLOBAL_SEARCH_SCOPES,
    parseGlobalSearchSnippet,
} from "./global-search"
import type { GlobalSearchData } from "@/modules/api/graphql/queries/types/global-search"

const item = (id: string) => ({ id, displayId: id, title: id, texts: [`<em>${id}</em>`], path: `/courses/${id}` })
const data: GlobalSearchData = {
    courses: [item("course")],
    modules: [item("module")],
    contents: [item("content")],
    challenges: [item("challenge")],
    flashcardDecks: [item("deck")],
    milestones: [item("milestone")],
    milestoneTasks: [item("task")],
    foundations: [item("foundation")],
}

describe("global search domain", () => {
    it("maps six product scopes to backend entity class names", () => {
        expect(GLOBAL_SEARCH_SCOPE_ENTITIES.all).toBeUndefined()
        expect(GLOBAL_SEARCH_SCOPE_ENTITIES.learning).toEqual(["ModuleEntity", "ContentEntity"])
        expect(GLOBAL_SEARCH_SCOPE_ENTITIES.practice).toEqual(["ChallengeEntity", "FlashcardDeckEntity"])
        expect(GLOBAL_SEARCH_SCOPE_ENTITIES.projects).toEqual(["MilestoneEntity"])
    })

    it("keeps the approved All bucket order", () => {
        expect(flattenGlobalSearch(data, "all").map((result) => result.id)).toEqual([
            "course", "module", "content", "challenge", "deck", "milestone", "task", "foundation",
        ])
    })

    it("flattens only buckets admitted by the selected scope", () => {
        expect(flattenGlobalSearch(data, "learning").map((result) => result.id)).toEqual(["module", "content"])
        expect(flattenGlobalSearch(data, "projects").map((result) => result.id)).toEqual(["milestone", "task"])
    })

    it("counts displayed rows rather than inventing a server total", () => {
        expect(countGlobalSearchScope(data, "all")).toBe(8)
        expect(countGlobalSearchScope(data, "courses")).toBe(1)
    })

    it("offers the six scopes and the eight buckets the All order draws from", () => {
        expect(GLOBAL_SEARCH_SCOPES).toEqual(["all", "courses", "learning", "practice", "projects", "foundations"])
        expect(GLOBAL_SEARCH_BUCKETS).toHaveLength(8)
        expect(GLOBAL_SEARCH_SCOPE_ENTITIES.courses).toEqual(["CourseEntity"])
        expect(GLOBAL_SEARCH_SCOPE_ENTITIES.foundations).toEqual(["FoundationEntity"])
    })

    it("shows nothing rather than throwing before the first answer arrives", () => {
        expect(flattenGlobalSearch(undefined, "all")).toEqual([])
        expect(flattenGlobalSearch(null, "all")).toEqual([])
        expect(countGlobalSearchScope(undefined, "all")).toBe(0)
        expect(countGlobalSearchScope(null, "all")).toBe(0)
    })

    it("admits the practice and foundation buckets under their own scopes", () => {
        expect(flattenGlobalSearch(data, "practice").map((result) => result.id)).toEqual(["challenge", "deck"])
        expect(flattenGlobalSearch(data, "foundations").map((result) => result.key))
            .toEqual(["foundations:foundation"])
        expect(countGlobalSearchScope(data, "learning")).toBe(2)
    })

    it("falls back to the title when the backend returned no snippet text", () => {
        const untexted: GlobalSearchData = {
            ...data,
            courses: [{ id: "c", displayId: "c", title: "Plain title", texts: [], path: "/courses/c" }],
        }
        expect(flattenGlobalSearch(untexted, "courses")[0]?.segments)
            .toEqual([{ text: "Plain title", highlighted: false }])
    })

    it("recognizes only em markers and leaves hostile markup as text", () => {
        expect(parseGlobalSearchSnippet("A <em>match</em> <img src=x>")).toEqual([
            { text: "A ", highlighted: false },
            { text: "match", highlighted: true },
            { text: " <img src=x>", highlighted: false },
        ])
    })
})
