import { OverviewChallengeSkills } from "@/components/blocks/profile/overview/OverviewChallengeSkills"
import { OverviewCodeSkills } from "@/components/blocks/profile/overview/OverviewCodeSkills"
import { OverviewContributions } from "@/components/blocks/profile/overview/OverviewContributions"
import { OverviewCourses } from "@/components/blocks/profile/overview/OverviewCourses"
import { OverviewJobReadiness } from "@/components/blocks/profile/overview/OverviewJobReadiness"
import {
    profileOverviewGridClassName,
    profileOverviewMainClassName,
    profileOverviewSkillGridClassName,
    profileOverviewSupportingClassName,
} from "./classNames"

/** Keep the five legacy Overview owners and their independently settling request boundaries. */
export type ProfileOverviewPageProps = Record<never, never>
/** Render the profile overview blocks in reading order. */
export const ProfileOverviewPageBase = (props: ProfileOverviewPageProps) => {
    void props
    return <div className={profileOverviewGridClassName}>
        <div className={profileOverviewMainClassName}>
            <OverviewCourses {...{}} />
            <section aria-label="Profile skills" className={profileOverviewSkillGridClassName}>
                <OverviewChallengeSkills {...{}} />
                <OverviewCodeSkills {...{}} />
            </section>
            <OverviewContributions {...{}} />
        </div>
        <aside className={profileOverviewSupportingClassName} aria-label="Profile readiness">
            <OverviewJobReadiness {...{}} />
        </aside>
    </div>
}
