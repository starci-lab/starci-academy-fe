import type {
    CourseOutline,
    CourseOutlineModule,
    CourseOutlineTarget,
} from "@/modules/api/graphql/queries/types/course-outline"

/** A resume target resolved to the route segments the frontend owns. */
export type ResolvedCourseOutlineTarget = {
    readonly kind: CourseOutlineTarget["kind"]
    readonly moduleId: string
    readonly lessonId: string
    readonly challengeId?: string
}

/** Filter modules while retaining only lessons whose title matches the submitted query. */
export const filterCourseOutlineModules = (
    modules: ReadonlyArray<CourseOutlineModule>,
    query: string,
): ReadonlyArray<CourseOutlineModule> => {
    const normalized = query.trim().toLocaleLowerCase()
    if (normalized === "") return modules

    return modules.flatMap((module) => {
        if (module.title.toLocaleLowerCase().includes(normalized)) return [module]
        const lessons = module.lessons.filter((lesson) => lesson.title.toLocaleLowerCase().includes(normalized))
        return lessons.length === 0 ? [] : [{ ...module, lessons }]
    })
}

/** Resolve a lesson or challenge pointer to its enclosing route segments. */
export const resolveCourseOutlineTarget = (
    outline: CourseOutline,
    target: CourseOutlineTarget | null,
): ResolvedCourseOutlineTarget | null => {
    if (target === null || target.kind === "milestoneTask") return null

    for (const module of outline.modules) {
        for (const lesson of module.lessons) {
            if (target.kind === "lesson" && lesson.id === target.id) {
                return { kind: target.kind, moduleId: module.id, lessonId: lesson.id }
            }
            if (target.kind === "challenge") {
                const challenge = lesson.challenges.find((candidate) => candidate.id === target.id)
                if (challenge !== undefined) {
                    return {
                        kind: target.kind,
                        moduleId: module.id,
                        lessonId: lesson.id,
                        challengeId: challenge.id,
                    }
                }
            }
        }
    }
    return null
}
