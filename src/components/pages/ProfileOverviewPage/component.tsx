import { Tree } from "@/components/branches/Tree"
import { OverviewChallengeSkills } from "@/components/blocks/profile/overview/OverviewChallengeSkills"
import { OverviewCodeSkills } from "@/components/blocks/profile/overview/OverviewCodeSkills"
import { OverviewContributions } from "@/components/blocks/profile/overview/OverviewContributions"
import { OverviewCourses } from "@/components/blocks/profile/overview/OverviewCourses"
import { OverviewJobReadiness } from "@/components/blocks/profile/overview/OverviewJobReadiness"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Keep the five legacy Overview owners and their independently settling request boundaries. */
export const _ProfileOverviewPage = () => (
    <Tree contract="profile-main" render={defineContractComponent("profile-main", {
        section: [
            defineContractProjection("label-row-over-card", () => <OverviewJobReadiness />),
            defineContractProjection("label-row-over-card", () => <OverviewCourses />),
            defineContractProjection("label-row-over-card", () => <OverviewContributions />),
            defineContractProjection("profile-overview-skill-grid", () => (
                <Tree contract="profile-overview-skill-grid" render={defineContractComponent("profile-overview-skill-grid", {
                    section: [
                        defineContractProjection("label-row-over-card", () => <OverviewChallengeSkills />),
                        defineContractProjection("label-row-over-card", () => <OverviewCodeSkills />),
                    ],
                })} />
            )),
        ],
    })} />
)

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
