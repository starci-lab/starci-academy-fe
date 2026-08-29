import { SurfaceCard } from "@/components/branches/SurfaceCard"
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
    readonly filterLabel: string;
  };
  readonly on?: {
    readonly search?: (query: string) => void;
    readonly filter?: () => void;
    readonly select?: (slug: string) => void;
  };
};
/** Draw metrics, breakdowns and solve history. */
export const ProfileSkillsBase = (props: ProfileSkillsProps) => {
    const loading = props.state === "pending"
    const metrics = loading ? [] : props.props.metrics
    const breakdown = (
        label: string,
        items: ReadonlyArray<ProfileBreakdown>,
        chips = false,
    ) => (
        <section className={profileBreakdownClassName}>
            <strong>{label}</strong>
            <div className={chips ? profileTopicChipRunClassName : profileSegmentRunClassName}>{(loading ? [] : items).map((item) =>
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
            )}</div>
        </section>
    )
    return (
        <div className={profileMainClassName}>
            <SurfaceCard props={{ label: "Coding metrics" }}>
                <div className={profileMetricRibbonClassName}>{metrics.map((metric) => (
                    <ProfileMetric key={metric.id} props={metric} isLoading={loading} />
                ))}</div>
            </SurfaceCard>
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
                    <div className={profileEvidenceListClassName}>{(loading ? [] : props.props.history).map((row) => (
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
                    ))}</div>
                </div>
            </SurfaceCard>
        </div>
    )
}
/** Backward-compatible name for connected page consumers during migration. */
export type ProfileSkillsBlockProps = ProfileSkillsProps
