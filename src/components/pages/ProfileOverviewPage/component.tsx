import { OverviewChallengeSkills } from "@/components/blocks/profile/overview/OverviewChallengeSkills"
import { OverviewCodeSkills } from "@/components/blocks/profile/overview/OverviewCodeSkills"
import { OverviewContributions } from "@/components/blocks/profile/overview/OverviewContributions"
import { OverviewCourses } from "@/components/blocks/profile/overview/OverviewCourses"
import { OverviewJobReadiness } from "@/components/blocks/profile/overview/OverviewJobReadiness"

/** Keep the five legacy Overview owners and their independently settling request boundaries. */
export type ProfileOverviewPageProps = Record<never, never>
/** Render the profile overview blocks in reading order. */
export const ProfileOverviewPageBase = (props: ProfileOverviewPageProps) => {
    void props
    return <>
        <OverviewJobReadiness {...{}} />
        <OverviewCourses {...{}} />
        <OverviewContributions {...{}} />
        <section aria-label="Profile skills">
            <OverviewChallengeSkills {...{}} />
            <OverviewCodeSkills {...{}} />
        </section>
    </>
}
