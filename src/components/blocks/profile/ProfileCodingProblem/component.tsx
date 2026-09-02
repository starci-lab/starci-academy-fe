import { SurfaceCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
/** Public coding problem and accepted submission payload. */
export type CodingDetail = {
  readonly problem?: {
    readonly title: string;
    readonly statement?: string | null;
    readonly difficulty: string;
    readonly domain: string;
    readonly tags: ReadonlyArray<string>;
  } | null;
  readonly submission?: {
    readonly languages: ReadonlyArray<string>;
    readonly verdict: string;
    readonly passedCount: number;
    readonly totalCount: number;
    readonly firstSolvedAt?: string | null;
  } | null;
};
/** Traditional coding proof props and actions. */
export type ProfileCodingProblemProps = {
  readonly state: "pending" | "ready" | "error";
  readonly slug?: string;
  readonly detail?: CodingDetail | null;
  readonly on: { readonly back: () => void; readonly retry: () => void };
};
/** Draw coding statement and submission evidence. */
export const ProfileCodingProblemBase = (
    props: ProfileCodingProblemProps,
) => {
    const problem = props.detail?.problem
    const submission = props.detail?.submission
    const attemptedIdentity = props.slug?.trim() || "this problem"
    const loading = props.state === "pending"
    const error = props.state === "error"
    const noPublicProof = !loading && !error && (problem === undefined || problem === null) && (submission === undefined || submission === null)
    return (
        <div>
            <Button variant="ghost" size="sm" onPress={props.on.back}>{"← Solve history"}</Button>
            <Heading level={2} isSkeleton={loading}>{problem?.title ?? (props.slug ? `Coding problem · ${props.slug}` : error ? "Coding proof unavailable" : "Coding problem")}</Heading>
            {problem ? <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{`${problem.difficulty} · ${problem.domain}`}</Text> : null}
            {error ? <Button variant="secondary" size="sm" onPress={props.on.retry}>{"Try again"}</Button> : null}
            {problem || error ? <SurfaceCard label={"Problem statement"} composition="joined">
                <Text isSkeleton={loading}>{error ? "This proof couldn't be loaded." : problem?.statement ?? "No public coding proof was found."}</Text>
                {problem?.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </SurfaceCard> : null}
            {noPublicProof ? <SurfaceCard label={"Public proof"} composition="joined"><EmptyNotice message={`No public accepted proof was found for ${attemptedIdentity}.`} description={"Accepted solutions appear here when the learner publishes this problem's evidence."} iconSource={iconSourceFor("practice", "leading")} /></SurfaceCard> : <SurfaceCard label={"Submission"} composition="joined">
                {loading ? (
                    <Text isSkeleton>{undefined}</Text>
                ) : submission ? (
                    <>
                        <EvidenceRow
                            props={{
                                title: submission.languages.join(" · "),
                                subtitle: submission.firstSolvedAt ?? undefined,
                                fact: submission.verdict,
                                factTone: "success",
                            }}
                        />
                        <EvidenceRow
                            props={{
                                title: "Test cases",
                                subtitle: "Accepted submission",
                                fact: `${submission.passedCount}/${submission.totalCount}`,
                                factTone: "neutral",
                            }}
                        />
                    </>
                ) : (
                    <EmptyNotice message={"No accepted submission"} description={"This learner has not published solved evidence for this problem."} iconSource={iconSourceFor("practice", "leading")} />
                )}
            </SurfaceCard>}
        </div>
    )
}
