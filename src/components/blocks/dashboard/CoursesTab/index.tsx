"use client"

import { useState } from "react"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"
import { RecommendedCourses } from "@/components/blocks/dashboard/RecommendedCourses"
import { UpcomingLivestreamCard } from "@/components/blocks/dashboard/UpcomingLivestreamCard"
import { CoursePriceOverlay } from "@/components/overlays/courses/CoursePriceOverlay"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import { Tree } from "@/components/branches/Tree"

/**
 * Orchestrate the three legacy learning blocks in fixed order.
 *
 * IT HOLDS THE PRICE SURFACE for the whole tab. A suggested course can explain what it costs, and
 * the answer is a covering surface: mounted per row it would be one focus trap per row, of which
 * only one can ever be open. The block that lists the rows reports which course was asked about;
 * this is the smallest thing that owns the list, so it is the smallest thing that can hold the
 * surface.
 */
export const CoursesTab = () => {
    const [pricedCourseId, setPricedCourseId] = useState<string | undefined>(undefined)

    return (
        <>
            <Tree
                contract="dashboard-tab-main"
                render={defineContractComponent("dashboard-tab-main", {
                    section: [
                        defineContractProjection("label-row-over-card", () => <MyCoursesProgress />),
                        defineContractProjection("label-row-over-card", () => (
                            <RecommendedCourses onOpenPriceDetail={setPricedCourseId} />
                        )),
                        defineContractProjection("label-row-over-card", () => <UpcomingLivestreamCard />),
                    ],
                })}
            />
            <CoursePriceOverlay
                courseId={pricedCourseId}
                isOpen={pricedCourseId !== undefined}
                onDismiss={() => setPricedCourseId(undefined)}
            />
        </>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
