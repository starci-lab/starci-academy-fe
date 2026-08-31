import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { ProfileMetric } from "@/components/composites/ProfileMetric"
import { ProfileSegment } from "@/components/composites/ProfileSegment"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { SearchBox } from "@/components/leaves/SearchBox"
import type {
    ProfileBreakdown,
    ProfileCodingHistory,
} from "@/modules/api/graphql/queries/types/profile-evidence"
import {
    profileBreakdownClassName,
    profileBreakdownStackClassName,
    profileEvidenceListClassName,
    profileEvidenceSurfaceClassName,
    profileMainClassName,
    profileMetricRibbonClassName,
    profileSearchFilterRowClassName,
    profileSegmentRunClassName,
    profileToolbarOverListClassName,
    profileTopicChipRunClassName,
} from "./classNames"
/** Resolved coding evidence and history. */
export type ProfileSkillsProps = {
  readonly state: "pending" | "ready" | "error";
  readonly props: {
    readonly metrics: ReadonlyArray<{
      readonly id: string;
      readonly value: string;
      readonly label: string;
    }>;
    readonly byDifficulty: ReadonlyArray<ProfileBreakdown>;
    readonly byDomain: ReadonlyArray<ProfileBreakdown>;
    readonly byLanguage: ReadonlyArray<ProfileBreakdown>;
    readonly history: ReadonlyArray<ProfileCodingHistory>;
    readonly historyTotal?: number;
    readonly filterLabel: string;
  };
  readonly on?: {
    readonly search?: (query: string) => void;
    readonly filter?: () => void;
    readonly select?: (slug: string) => void;
    readonly retry?: () => void;
    readonly browseCourses?: () => void;
  };
};
/** Draw metrics, breakdowns and solve history. */
export const ProfileSkillsBase = (props: ProfileSkillsProps) => {
    const loading = props.state === "pending"
    const metrics = loading ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}`, value: "", label: "" })) : props.props.metrics
    const hasNoEvidence = props.state === "ready" && props.props.byDifficulty.length === 0 && props.props.byDomain.length === 0 && props.props.byLanguage.length === 0 && (props.props.historyTotal ?? props.props.history.length) === 0
    const breakdown = (
        label: string,
        items: ReadonlyArray<ProfileBreakdown>,
        chips = false,
    ) => (
        <section className={profileBreakdownClassName}>
            <strong>{label}</strong>
            <div className={chips ? profileTopicChipRunClassName : profileSegmentRunClassName}>{(loading ? Array.from({ length: 3 }, (_, index) => ({ key: `resting-${index}`, solved: 0 })) : items).map((item) =>
                chips ? (
                    <Badge
                        key={item.key}
                        props={{ content: `${item.key} ${item.solved}`, tone: "neutral" }}
                    />
                ) : (
                    <ProfileSegment
                        key={item.key}
                        props={{ label: `${item.key} ${item.solved}` }}
                        isLoading={loading}
                    />
                ),
            )}</div>{!loading && items.length === 0 ? <EmptyNotice props={{ icon: "practice", message: "No public breakdown yet." }} /> : null}
        </section>
    )
    return (
        <div className={profileMainClassName}>
            <SurfaceCard props={{ label: "Coding metrics" }}>
                <div className={profileMetricRibbonClassName}>{metrics.map((metric) => (
                    <ProfileMetric key={metric.id} props={metric} isLoading={loading} />
                ))}</div>
            </SurfaceCard>
            {hasNoEvidence ? <div className={profileEvidenceSurfaceClassName}><SurfaceListCard props={{ label: "Coding evidence" }}><EmptyNotice props={{ icon: "practice", message: "No coding evidence yet.", description: "Complete challenges and practice problems to build your public skills history.", actionLabel: "Browse courses", actionIcon: "course" }} on={{ act: props.on?.browseCourses }} /></SurfaceListCard></div> : <>
                <SurfaceCard props={{ label: "Stats" }}>
                    <div className={profileBreakdownStackClassName}>
                        {breakdown("By difficulty", props.props.byDifficulty)}
                        {breakdown("By topic", props.props.byDomain, true)}
                        {breakdown("By language", props.props.byLanguage)}
                    </div>
                </SurfaceCard>
                <SurfaceCard
                    props={{
                        label: "Solve history",
                        fact:
                props.state === "ready"
                    ? `${props.props.history.length} results`
                    : undefined,
                    }}
                >
                    <div className={profileToolbarOverListClassName}>
                        <div className={profileSearchFilterRowClassName}>
                            <SearchBox
                                props={{
                                    label: "Search solve history",
                                    placeholder: "Search solved problems",
                                    clearLabel: "Clear search",
                                }}
                                on={{ search: props.on?.search }}
                            />
                            <Button
                                props={{ label: props.props.filterLabel, size: "sm" }}
                                on={{ press: props.on?.filter }}
                            />
                        </div>
                        <SurfaceListCard props={{ label: "Solve history", isLabelHidden: true }} isLoading={loading}>
                            <div className={profileEvidenceListClassName}>{(!loading && props.props.history.length === 0 ? [{ slug: "empty", problemTitle: "", firstSolvedAt: "", domain: "", languages: [] }] : (loading ? Array.from({ length: 4 }, (_, index) => ({ slug: `resting-${index}`, problemTitle: "", firstSolvedAt: "", domain: "", languages: [] })) : props.props.history)).map((row) => (
                                row.slug === "empty" ? <EmptyNotice key={row.slug} props={{ icon: props.state === "error" ? "retry" : "practice", message: props.state === "error" ? "Solve history couldn't be loaded." : "No solved problems yet.", actionLabel: props.state === "error" ? "Try again" : undefined, actionIcon: "retry" }} on={{ act: props.on?.retry }} /> : (
                                    <EvidenceRow
                                        key={row.slug}
                                        props={{
                                            title: row.problemTitle,
                                            subtitle: [
                                                row.firstSolvedAt,
                                                row.domain,
                                                row.languages.join(" · "),
                                            ]
                                                .filter(Boolean)
                                                .join(" · "),
                                            fact: row.difficulty ?? undefined,
                                            factTone:
                row.difficulty === "hard"
                    ? "danger"
                    : row.difficulty === "medium"
                        ? "warning"
                        : "success",
                                            isPressable: !loading,
                                        }}
                                        on={{ press: () => props.on?.select?.(row.slug) }}
                                        isLoading={loading}
                                    />
                                )
                            ))}</div>
                        </SurfaceListCard>
                    </div>
                </SurfaceCard>
            </>}
        </div>
    )
}
/** Backward-compatible name for connected page consumers during migration. */
export type ProfileSkillsBlockProps = ProfileSkillsProps
