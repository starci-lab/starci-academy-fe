"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ProfileCodingHistory, ProfileCodingProgress, ProfileCodingRank, ProfileCodingSkills, ProfileCodingXp } from "@/modules/api/graphql/queries/types/profile-evidence"
import { ProfileSkillsPageBase } from "./component"

const FILTERS = ["all", "easy", "medium", "hard"] as const

/** Resolve and independently cache every public coding evidence family. */
export const ProfileSkillsPage = () => {
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const id = profile.data?.id
    const progress = useQueryProfileEvidenceSwr<ProfileCodingProgress>("coding-progress", id)
    const rank = useQueryProfileEvidenceSwr<ProfileCodingRank | null>("coding-rank", id)
    const xp = useQueryProfileEvidenceSwr<ProfileCodingXp | null>("coding-xp", id)
    const skills = useQueryProfileEvidenceSwr<ProfileCodingSkills>("coding-skills", id)
    const history = useQueryProfileEvidenceSwr<ReadonlyArray<ProfileCodingHistory>>("coding-history", id)
    const [search, setSearch] = useState("")
    const [filterIndex, setFilterIndex] = useState(0)
    const filter = FILTERS[filterIndex]
    const filtered = useMemo(() => (history.data ?? []).filter((item) => (!search || item.problemTitle.toLowerCase().includes(search.toLowerCase())) && (filter === "all" || item.difficulty === filter)), [filter, history.data, search])
    const queries = [progress, rank, xp, skills, history]
    const state = queries.some((query) => query.error) ? "error" : profile.isLoading || queries.some((query) => query.isLoading) ? "pending" : "ready"
    return <ProfileSkillsPageBase state={state} props={{
        metrics: [
            { id: "solved", value: String(progress.data?.solvedProblemIds.length ?? 0), label: "solved" },
            { id: "xp", value: String(xp.data?.codingXp ?? 0), label: "coding XP" },
            { id: "percentile", value: rank.data?.percentile == null ? "—" : `Top ${rank.data.percentile}%`, label: "percentile" },
            { id: "rank", value: rank.data?.rank == null ? "—" : `#${rank.data.rank}`, label: "rank" },
        ],
        byDifficulty: skills.data?.byDifficulty ?? [], byDomain: skills.data?.byDomain ?? [], byLanguage: skills.data?.byLanguage ?? [], history: filtered,
        filterLabel: filter === "all" ? "Filters" : `Filter: ${filter}`,
    }} on={{ search: setSearch, filter: () => setFilterIndex((filterIndex + 1) % FILTERS.length), select: (slug) => router.push(`/profile/${username}/skills/${slug}`) }} />
}

export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
