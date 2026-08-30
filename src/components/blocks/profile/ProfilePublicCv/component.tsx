import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { ProfileCvBuilder } from "../ProfileCvBuilder"
/** Public CV state and content. */
export type ProfilePublicCvProps = { readonly state: "pending" | "empty" | "uncompiled" | "ready" | "error"; readonly label: string; readonly message: string; readonly title: string; readonly pdfUrl?: string; readonly editLabel: string; readonly retryLabel: string; readonly isSelf: boolean; readonly on?: { readonly edit?: () => void; readonly retry?: () => void } }
/** Draw the public CV or its recovery notice. */
export const ProfilePublicCvBase = (props: ProfilePublicCvProps) => props.isSelf ? <ProfileCvBuilder /> : <SurfaceCard props={{ label: props.label, isFrameless: true }}>{props.state === "ready" || props.state === "pending" ? <ProfileCvDocument props={{ title: props.title, src: props.pdfUrl }} isLoading={props.state === "pending"} /> : <EmptyNotice props={{ icon: "review", message: props.message, actionLabel: props.state === "error" ? props.retryLabel : undefined }} on={{ act: props.state === "error" ? props.on?.retry : undefined }} />}</SurfaceCard>
