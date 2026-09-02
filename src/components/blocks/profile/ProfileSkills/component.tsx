import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { ProfileMetric } from "@/components/composites/ProfileMetric"
import { ProfileSegment } from "@/components/composites/ProfileSegment"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
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
                    <Badge key={item.key} tone={"neutral"}>{`${item.key} ${item.solved}`}</Badge>
                ) : (
                    <ProfileSegment
                        key={item.key}
                        props={{ label: `${item.key} ${item.solved}` }}
                        isLoading={loading}
                    />
                ),
            )}</div>{!loading && items.length === 0 ? <EmptyNotice message={"No public breakdown yet."} iconSource={iconSourceFor("practice", "leading")} /> : null}
        </section>
    )
    return (
        <div className={profileMainClassName}>
            <SurfaceCard label={"Coding metrics"} composition="joined">
                <div className={profileMetricRibbonClassName}>{metrics.map((metric) => (
                    <ProfileMetric key={metric.id} props={metric} isLoading={loading} />
                ))}</div>
            </SurfaceCard>
            {hasNoEvidence ? <div className={profileEvidenceSurfaceClassName}><SurfaceListCard label={"Coding evidence"}><EmptyNotice message={"No coding evidence yet."} description={"Complete challenges and practice problems to build your public skills history."} actionLabel={"Browse courses"} iconSource={iconSourceFor("practice", "leading")} actionStartContent={<Icon source={iconSourceFor("course", "chip")} usage="chip" />} onAction={({ act: props.on?.browseCourses })?.act} /></SurfaceListCard></div> : <>
                <SurfaceCard label={"Stats"} composition="joined">
                    <div className={profileBreakdownStackClassName}>
                        {breakdown("By difficulty", props.props.byDifficulty)}
                        {breakdown("By topic", props.props.byDomain, true)}
                        {breakdown("By language", props.props.byLanguage)}
                    </div>
                </SurfaceCard>
                <SurfaceCard label={"Solve history"} fact={props.state === "ready"
                    ? `${props.props.history.length} results`
                    : undefined} composition="joined">
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
                            <Button size="sm" onPress={props.on?.filter}>{props.props.filterLabel}</Button>
                        </div>
                        <SurfaceListCard label={"Solve history"} labelHidden={true} isLoading={loading}>
                            <div className={profileEvidenceListClassName}>{(!loading && props.props.history.length === 0 ? [{ slug: "empty", problemTitle: "", firstSolvedAt: "", domain: "", languages: [] }] : (loading ? Array.from({ length: 4 }, (_, index) => ({ slug: `resting-${index}`, problemTitle: "", firstSolvedAt: "", domain: "", languages: [] })) : props.props.history)).map((row) => (
                                row.slug === "empty" ? <EmptyNotice key={row.slug} message={props.state === "error" ? "Solve history couldn't be loaded." : "No solved problems yet."} actionLabel={props.state === "error" ? "Try again" : undefined} iconSource={iconSourceFor(props.state === "error" ? "retry" : "practice", "leading")} actionStartContent={<Icon source={iconSourceFor("retry", "chip")} usage="chip" />} onAction={({ act: props.on?.retry })?.act} /> : (
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
