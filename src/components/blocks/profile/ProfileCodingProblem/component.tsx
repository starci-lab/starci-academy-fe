import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
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
            <Button
                props={{ label: "← Solve history", variant: "ghost", size: "sm" }}
                on={{ press: props.on.back }}
            />
            <Heading
                props={{
                    content: problem?.title ?? (props.slug ? `Coding problem · ${props.slug}` : error ? "Coding proof unavailable" : "Coding problem"),
                    level: 2,
                }}
                isLoading={loading}
            />
            {problem ? <Text props={{ content: `${problem.difficulty} · ${problem.domain}`, size: "sm", tone: "muted" }} isLoading={loading} /> : null}
            {error ? <Button props={{ label: "Try again", variant: "secondary", size: "sm", icon: "retry" }} on={{ press: props.on.retry }} /> : null}
            {problem || error ? <SurfaceCard props={{ label: "Problem statement" }}>
                <Text props={{ content: error ? "This proof couldn't be loaded." : problem?.statement ?? "No public coding proof was found." }} isLoading={loading} />
                {problem?.tags.map((tag) => <Badge key={tag} props={{ content: tag }} />)}
            </SurfaceCard> : null}
            {noPublicProof ? <SurfaceCard props={{ label: "Public proof" }}><EmptyNotice props={{ icon: "practice", message: `No public accepted proof was found for ${attemptedIdentity}.`, description: "Accepted solutions appear here when the learner publishes this problem's evidence." }} /></SurfaceCard> : <SurfaceCard props={{ label: "Submission" }}>
                {loading ? (
                    <Text props={{ content: undefined }} isLoading />
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
                    <EmptyNotice props={{ icon: "practice", message: "No accepted submission", description: "This learner has not published solved evidence for this problem." }} />
                )}
            </SurfaceCard>}
        </div>
    )
}
