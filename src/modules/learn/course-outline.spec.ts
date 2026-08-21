import { describe, expect, it } from "vitest"
import type { CourseOutline } from "@/modules/api/graphql/queries/types/course-outline"
import { filterCourseOutlineModules, resolveCourseOutlineTarget } from "./course-outline"

const outline: CourseOutline = {
    course: { id: "course-1", title: "Systems", displayId: "systems" },
    modules: [{
        id: "module-1",
        title: "Distributed foundations",
        orderIndex: 1,
        isPremium: false,
        lessons: [
            {
                id: "lesson-1",
                displayId: "latency",
                title: "Latency budgets",
                minutesRead: 12,
                difficulty: "beginner",
                isPremium: false,
                isRead: false,
                challenges: [{
                    id: "challenge-1",
                    title: "Budget a request",
                    difficulty: "easy",
                    maxScore: 10,
                    status: "notStarted",
                    lastScore: 0,
                    completed: false,
                }],
            },
            {
                id: "lesson-2",
                displayId: "queues",
                title: "Queueing models",
                minutesRead: 15,
                difficulty: null,
                isPremium: false,
                isRead: true,
                challenges: [],
            },
        ],
    }],
    milestones: [],
    progress: {
        lessonsRead: 1,
        lessonsTotal: 2,
        challengesCompleted: 0,
        challengesTotal: 1,
        tasksCompleted: 0,
        tasksTotal: 0,
        completionPercent: 50,
    },
    currentTask: null,
    nextContentTask: { kind: "lesson", id: "lesson-1", milestoneId: null },
}

describe("course outline helpers", () => {
    it("keeps whole modules for a module match and narrows lessons for a lesson match", () => {
        expect(filterCourseOutlineModules(outline.modules, "distributed")[0]?.lessons).toHaveLength(2)
        expect(filterCourseOutlineModules(outline.modules, "queue")[0]?.lessons).toEqual([
            expect.objectContaining({ id: "lesson-2" }),
        ])
        expect(filterCourseOutlineModules(outline.modules, "missing")).toEqual([])
    })

    it("resolves lesson and challenge pointers to their enclosing route", () => {
        expect(resolveCourseOutlineTarget(outline, outline.nextContentTask)).toEqual({
            kind: "lesson",
            moduleId: "module-1",
            lessonId: "lesson-1",
        })
        expect(resolveCourseOutlineTarget(outline, { kind: "challenge", id: "challenge-1", milestoneId: null })).toEqual({
            kind: "challenge",
            moduleId: "module-1",
            lessonId: "lesson-1",
            challengeId: "challenge-1",
        })
    })

    it("does not invent a content route for capstone or stale pointers", () => {
        expect(resolveCourseOutlineTarget(outline, { kind: "milestoneTask", id: "task-1", milestoneId: "milestone-1" })).toBeNull()
        expect(resolveCourseOutlineTarget(outline, { kind: "lesson", id: "missing", milestoneId: null })).toBeNull()
    })

})
