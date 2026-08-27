import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
/** Public CV state and content. */
export type ProfilePublicCvProps = { readonly state: "pending" | "empty" | "uncompiled" | "ready" | "error"; readonly label: string; readonly message: string; readonly title: string; readonly pdfUrl?: string; readonly editLabel: string; readonly retryLabel: string; readonly isSelf: boolean; readonly on?: { readonly edit?: () => void; readonly retry?: () => void } }
/** Draw the public CV or its recovery notice. */
export const ProfilePublicCvBase = (props: ProfilePublicCvProps) => <SurfaceCard props={{ label: props.label, isFrameless: true }}>{props.state === "ready" || props.state === "pending" ? <><ProfileCvDocument props={{ title: props.title, src: props.pdfUrl }} isLoading={props.state === "pending"} />{props.isSelf && <Button props={{ label: props.editLabel, variant: "secondary", icon: "review" }} on={{ press: props.on?.edit }} />}</> : <EmptyNotice props={{ icon: "review", message: props.message, actionLabel: props.state === "error" ? props.retryLabel : props.isSelf ? props.editLabel : undefined }} on={{ act: props.state === "error" ? props.on?.retry : props.on?.edit }} />}</SurfaceCard>
