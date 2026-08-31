import { Avatar } from "@/components/leaves/Avatar"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"
import {
    profileActionColumnClassName,
    profileActionRowClassName,
    profileEvidenceFactRunClassName,
    profileEvidenceSummaryClassName,
    profileFactRunClassName,
    profileHeroGridClassName,
    profileIdentityStackClassName,
    profileMetaListClassName,
    profileNameHandleStackClassName,
    profileProfessionalStackClassName,
    profileProofRowClassName,
} from "./classNames"
/** Resolved public identity drawn by the profile rail. */
export type ProfileHeroData = {
    readonly name: string
    readonly handle: string
    readonly avatar?: string
    readonly role?: string
    readonly bio?: string
    readonly location?: string
    readonly workMode?: string
    readonly followerLabel: string
    readonly followingLabel: string
    readonly primaryLabel: string
    readonly primaryPending: boolean
    readonly shareLabel: string
    readonly sharePending: boolean
    readonly githubUrl?: string
    readonly linkedinUrl?: string
    readonly websiteUrl?: string
    readonly joinedLabel: string
    readonly evidenceLabel: string
    readonly evidenceItems: ReadonlyArray<string>
    readonly evidenceLoading?: boolean
}
/** Profile hero actions. */
export type ProfileHeroActions = { readonly primary?: () => void; readonly share?: () => void }
/** Traditional profile hero props. */
export type ProfileHeroProps = { readonly state: "pending" | "ready"; readonly props: ProfileHeroData; readonly on?: ProfileHeroActions }
/** Draw the complete profile identity rail. */
export const ProfileHeroBase = (props: ProfileHeroProps) => {
    const loading = props.state === "pending"
    const data = props.props
    const facts = [data.location, data.workMode].filter((fact): fact is string => Boolean(fact))

    const evidenceLoading = loading || data.evidenceLoading === true

    return <SurfaceCard props={{ inset: "compact" }} isLoading={loading}>
        <div className={profileHeroGridClassName}>
            <Avatar props={{ name: data.name, src: data.avatar, size: "lg" }} isLoading={loading} />
            <div className={profileIdentityStackClassName}>
                <div className={profileNameHandleStackClassName}>
                    <Text props={{ content: `@${data.handle}`, size: "xs", tone: "muted" }} isLoading={loading} />
                    <Heading props={{ content: data.name, level: 1 }} isLoading={loading} />
                </div>
                <div className={profileProfessionalStackClassName}>
                    {data.role && <Heading props={{ content: data.role, level: 2 }} isLoading={loading} />}
                    {data.bio && <Text props={{ content: data.bio, size: "sm", tone: "muted" }} isLoading={loading} />}
                </div>
                {facts.length > 0 && <div className={profileFactRunClassName}>{facts.map((fact) => <Text key={fact} props={{ content: fact, size: "xs", tone: "muted" }} isLoading={loading} />)}</div>}
                <div className={profileProofRowClassName}>
                    <Text props={{ content: data.followerLabel, size: "sm", weight: "normal" }} isLoading={loading} />
                    <Text props={{ content: data.followingLabel, size: "sm", weight: "normal" }} isLoading={loading} />
                </div>
            </div>
            <div className={profileActionColumnClassName}>
                <div className={profileActionRowClassName}>
                    <Button props={{ label: data.primaryLabel, variant: "primary", isPending: data.primaryPending }} on={{ press: props.on?.primary }} isLoading={loading} />
                    <Button props={{ icon: "send", label: data.shareLabel, variant: "secondary", isPending: data.sharePending }} on={{ press: props.on?.share }} />
                </div>
                <Text props={{ content: data.joinedLabel, size: "xs" }} isLoading={loading} />
                <div className={profileMetaListClassName}>
                    {data.githubUrl && <Link props={{ label: "GitHub", externalHref: data.githubUrl, icon: "github" }} />}
                    {data.linkedinUrl && <Link props={{ label: "LinkedIn", externalHref: data.linkedinUrl }} />}
                    {data.websiteUrl && <Link props={{ label: data.websiteUrl, externalHref: data.websiteUrl, icon: "explore" }} />}
                </div>
            </div>
            <div className={profileEvidenceSummaryClassName}>
                <Text props={{ content: data.evidenceLabel, size: "sm", weight: "semibold" }} isLoading={evidenceLoading} />
                <div className={profileEvidenceFactRunClassName}>
                    {data.evidenceItems.map((item, index) => <Text key={`${index}-${item}`} props={{ content: item, size: "xs" }} isLoading={evidenceLoading} />)}
                </div>
            </div>
        </div>
    </SurfaceCard>
}
