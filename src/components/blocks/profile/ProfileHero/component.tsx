import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { IconButton } from "@/components/leaves/IconButton"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"
/** Resolved public identity drawn by the profile rail. */
export type ProfileHeroData = { readonly name: string; readonly handle: string; readonly avatar?: string; readonly role?: string; readonly bio?: string; readonly location?: string; readonly workMode?: string; readonly followerLabel: string; readonly followingLabel: string; readonly primaryLabel: string; readonly primaryPending: boolean; readonly shareLabel: string; readonly githubUrl?: string; readonly linkedinUrl?: string; readonly websiteUrl?: string; readonly joinedLabel: string }
/** Profile hero actions. */
export type ProfileHeroActions = { readonly primary?: () => void; readonly share?: () => void }
/** Traditional profile hero props. */
export type ProfileHeroProps = { readonly state: "pending" | "ready"; readonly props: ProfileHeroData; readonly on?: ProfileHeroActions }
/** Draw the complete profile identity rail. */
export const ProfileHeroBase = (props: ProfileHeroProps) => { const loading = props.state === "pending"; const data = props.props; return <div><Avatar props={{ name: data.name, src: data.avatar, size: "lg" }} isLoading={loading} /><div><Heading props={{ content: data.name, level: 2 }} isLoading={loading} /><Text props={{ content: `@${data.handle}`, size: "xs", tone: "muted" }} isLoading={loading} />{data.role && <Text props={{ content: data.role, size: "sm", weight: "medium" }} isLoading={loading} />}</div>{data.bio && <Text props={{ content: data.bio, size: "sm", tone: "muted" }} isLoading={loading} />}{[data.location, data.workMode].filter(Boolean).map((fact) => <Badge key={fact} props={{ content: fact }} isLoading={loading} />)}<div><Text props={{ content: data.followerLabel, size: "sm", weight: "semibold" }} isLoading={loading} /><Text props={{ content: data.followingLabel, size: "sm", weight: "semibold" }} isLoading={loading} /></div><div><Button props={{ label: data.primaryLabel, variant: "primary", isPending: data.primaryPending }} on={{ press: props.on?.primary }} isLoading={loading} /><IconButton props={{ icon: "send", label: data.shareLabel }} on={{ press: props.on?.share }} /></div><div>{data.githubUrl && <Link props={{ label: "GitHub", externalHref: data.githubUrl, icon: "github" }} />}{data.linkedinUrl && <Link props={{ label: "LinkedIn", externalHref: data.linkedinUrl }} />}{data.websiteUrl && <Link props={{ label: data.websiteUrl, externalHref: data.websiteUrl, icon: "explore" }} />}<Text props={{ content: data.joinedLabel, size: "xs" }} isLoading={loading} /></div></div> }
