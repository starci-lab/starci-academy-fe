import { SurfaceCard } from "@/components/branches/SurfaceCard"
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
export type ProfileCodingProblemBlockProps = {
  readonly state: "pending" | "ready" | "error";
  readonly detail?: CodingDetail | null;
  readonly on: { readonly back: () => void; readonly retry: () => void };
};
/** Draw coding statement and submission evidence. */
export const ProfileCodingProblemBase = (
    props: ProfileCodingProblemBlockProps,
) => {
    const problem = props.detail?.problem
    const submission = props.detail?.submission
    const loading = props.state === "pending"
    const error = props.state === "error"
    return (
        <div>
            <Button
                props={{ label: "← Solve history", variant: "ghost", size: "sm" }}
                on={{ press: props.on.back }}
            />
            <Heading
                props={{
                    content:
            problem?.title ??
            (error ? "Coding proof unavailable" : "Coding problem"),
                    level: 2,
                }}
                isLoading={loading}
            />
            <Text
                props={{
                    content: problem ? `${problem.difficulty} · ${problem.domain}` : "",
                    size: "sm",
                    tone: "muted",
                }}
                isLoading={loading}
            />
            <SurfaceCard props={{ label: "Problem statement" }}>
                {
                    <Text
                        props={{
                            content: error
                                ? "This proof couldn't be loaded."
                                : (problem?.statement ?? "No public coding proof was found."),
                        }}
                        isLoading={loading}
                    />
                }
                {problem?.tags.map((tag) => (
                    <Badge key={tag} props={{ content: tag }} />
                ))}
            </SurfaceCard>
            <SurfaceCard props={{ label: "Submission" }}>
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
                    <EvidenceRow
                        props={{
                            title: "No accepted submission",
                            subtitle:
                "This learner has not published solved evidence for this problem.",
                            fact: undefined,
                            factTone: "neutral",
                        }}
                    />
                )}
            </SurfaceCard>
        </div>
    )
}
