import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Public CV paper and explicit availability-state input. */
export type ProfilePublicCvPageProps = {
    readonly state: "pending" | "empty" | "uncompiled" | "ready" | "error"
    readonly props: { readonly label: string, readonly message: string, readonly title: string, readonly pdfUrl?: string, readonly editLabel: string, readonly retryLabel: string, readonly isSelf: boolean }
    readonly on?: { readonly edit?: () => void, readonly retry?: () => void }
}

const ReadyCv = (input: ProfilePublicCvPageProps) => <Tree contract="profile-cv-page" render={defineContractComponent("profile-cv-page", {
    ...(input.props.isSelf ? { action: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.editLabel, variant: "secondary", icon: "review" }} on={{ press: input.on?.edit }} />) } : {}),
    paper: defineContractProjection("profile-cv-paper", () => (
        <SurfaceCard contract="profile-cv-paper" render={defineContractComponent("profile-cv-paper", {
            document: defineLeafComponent("profile-cv-document", {}, () => <ProfileCvDocument props={{ title: input.props.title, src: input.props.pdfUrl }} isLoading={input.state === "pending"} />),
        })} />
    )),
})} />

const CvNotice = (input: ProfilePublicCvPageProps) => <Tree contract="empty-notice-card" render={defineContractComponent("empty-notice-card", {
    notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ icon: "review", message: input.props.message, actionLabel: input.state === "error" ? input.props.retryLabel : input.props.isSelf ? input.props.editLabel : undefined }} on={{ act: input.state === "error" ? input.on?.retry : input.on?.edit }} />),
})} />

/** Public CV parity: same paper while loading/ready and honest no-file, uncompiled and error outcomes. */
export const ProfilePublicCvPageBase = (input: ProfilePublicCvPageProps) => <Tree contract="profile-main" render={defineContractComponent("profile-main", {
    section: [defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: input.props.label, isFrameless: true }} contract={input.state === "ready" || input.state === "pending" ? "profile-cv-page" : "empty-notice-card"} render={input.state === "ready" || input.state === "pending" ? defineContractProjection("profile-cv-page", () => <ReadyCv {...input} />) : defineContractProjection("empty-notice-card", () => <CvNotice {...input} />)} />)],
})} />

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
