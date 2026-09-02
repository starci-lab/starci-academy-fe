import { Avatar } from "@/components/leaves/Avatar"
import { SurfaceCard } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
import { TextAction } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"

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

    return <SurfaceCard composition="single" state={loading ? "pending" : "neutral"}>
        <div className={profileHeroGridClassName}>
            <Avatar props={{ name: data.name, src: data.avatar, size: "lg" }} isLoading={loading} />
            <div className={profileIdentityStackClassName}>
                <div className={profileNameHandleStackClassName}>
                    <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{`@${data.handle}`}</Text>
                    <Heading level={1} isSkeleton={loading}>{data.name}</Heading>
                </div>
                <div className={profileProfessionalStackClassName}>
                    {data.role && <Heading level={2} isSkeleton={loading}>{data.role}</Heading>}
                    {data.bio && <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{data.bio}</Text>}
                </div>
                {facts.length > 0 && <div className={profileFactRunClassName}>{facts.map((fact) => <Text key={fact} size={"xs"} tone={"muted"} isSkeleton={loading}>{fact}</Text>)}</div>}
                <div className={profileProofRowClassName}>
                    <Text size={"sm"} weight={"normal"} isSkeleton={loading}>{data.followerLabel}</Text>
                    <Text size={"sm"} weight={"normal"} isSkeleton={loading}>{data.followingLabel}</Text>
                </div>
            </div>
            <div className={profileActionColumnClassName}>
                <div className={profileActionRowClassName}>
                    <Button variant={"primary"} isPending={data.primaryPending} isSkeleton={loading} onPress={({ press: props.on?.primary })?.press}>{data.primaryLabel}</Button>
                    <Button variant="secondary" isPending={data.sharePending} onPress={props.on?.share}>{data.shareLabel}</Button>
                </div>
                <Text size={"xs"} isSkeleton={loading}>{data.joinedLabel}</Text>
                <div className={profileMetaListClassName}>
                    {data.githubUrl && <TextAction href={data.githubUrl} startContent={<Icon source={iconSourceFor("github", "chip")} usage="chip" />}>{"GitHub"}</TextAction>}
                    {data.linkedinUrl && <TextAction href={data.linkedinUrl}>{"LinkedIn"}</TextAction>}
                    {data.websiteUrl && <TextAction href={data.websiteUrl} startContent={<Icon source={iconSourceFor("explore", "chip")} usage="chip" />}>{data.websiteUrl}</TextAction>}
                </div>
            </div>
            <div className={profileEvidenceSummaryClassName}>
                <Text size={"sm"} weight={"semibold"} isSkeleton={evidenceLoading}>{data.evidenceLabel}</Text>
                <div className={profileEvidenceFactRunClassName}>
                    {data.evidenceItems.map((item, index) => <Text key={`${index}-${item}`} size={"xs"} isSkeleton={evidenceLoading}>{item}</Text>)}
                </div>
            </div>
        </div>
    </SurfaceCard>
}
