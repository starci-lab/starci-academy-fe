import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Public CV block state and resolved display data. */
export type ProfilePublicCvBlockProps = {
    readonly state: "pending" | "empty" | "uncompiled" | "ready" | "error"
    readonly label: string
    readonly message: string
    readonly title: string
    readonly pdfUrl?: string
    readonly editLabel: string
    readonly retryLabel: string
    readonly isSelf: boolean
    readonly on?: { readonly edit?: () => void; readonly retry?: () => void }
}

/** Draw the public CV block, including its loading paper and recovery notice. */
export const ProfilePublicCvBase = (input: ProfilePublicCvBlockProps) => {
    const paper = input.state === "ready" || input.state === "pending"
        ? defineContractProjection("profile-cv-page", () => <Tree contract="profile-cv-page" render={defineContractComponent("profile-cv-page", {
            ...(input.isSelf ? { action: defineLeafComponent("button", {}, () => <Button props={{ label: input.editLabel, variant: "secondary", icon: "review" }} on={{ press: input.on?.edit }} />) } : {}),
            paper: defineContractProjection("profile-cv-paper", () => <SurfaceCard contract="profile-cv-paper" render={defineContractComponent("profile-cv-paper", {
                document: defineLeafComponent("profile-cv-document", {}, () => <ProfileCvDocument props={{ title: input.title, src: input.pdfUrl }} isLoading={input.state === "pending"} />),
            })} />),
        })} />)
        : defineContractProjection("empty-notice-card", () => <Tree contract="empty-notice-card" render={defineContractComponent("empty-notice-card", {
            notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ icon: "review", message: input.message, actionLabel: input.state === "error" ? input.retryLabel : input.isSelf ? input.editLabel : undefined }} on={{ act: input.state === "error" ? input.on?.retry : input.on?.edit }} />),
        })} />)
    return <SurfaceCard
        props={{ label: input.label, isFrameless: true }}
        contract={input.state === "ready" || input.state === "pending" ? "profile-cv-page" : "empty-notice-card"}
        render={paper}
    />
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
