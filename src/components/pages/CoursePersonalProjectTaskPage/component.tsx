import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { Field } from "@/components/composites/Field"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { Article } from "@/components/leaves/Article"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Select } from "@/components/leaves/Select"
import { Text } from "@/components/leaves/Text"

/** One scored requirement authored for a personal-project task. */
export type PersonalProjectCriterion = { readonly id: string; readonly text: string; readonly score: number }
/** One selectable language or grading-model choice exposed by the task workspace. */
export type PersonalProjectModelOption = { readonly id: string; readonly label: string; readonly disabled?: boolean }
/** The settled loading, interaction and recovery conditions of the task page. */
export type CoursePersonalProjectTaskPageState = "pending" | "ready" | "submitting" | "failed" | "forbidden"

/** Localized words and fact formatters owned by the connected task page. */
export type CoursePersonalProjectTaskPageLabels = {
    readonly back: string
    readonly criteria: string
    readonly showCriteria: string
    readonly hideCriteria: string
    readonly implementation: string
    readonly points: (score: number) => string
    readonly submission: string
    readonly repository: string
    readonly repositoryPlaceholder: string
    readonly settings: string
    readonly language: string
    readonly model: string
    readonly branch: string
    readonly branchPlaceholder: string
    readonly token: string
    readonly tokenPlaceholder: string
    readonly tokenStored: (last4: string) => string
    readonly settingsSaved: string
    readonly evaluate: string
    readonly feedback: string
    readonly history: string
    readonly latest: string
    readonly passed: string
    readonly needsWork: string
    readonly saveSettings: string
    readonly retry: string
}

/** Complete authored task, submission and grading-settings input for the pure page. */
export type CoursePersonalProjectTaskPageProps = {
    readonly state: CoursePersonalProjectTaskPageState
    readonly props: {
        readonly title: string
        readonly description: string
        readonly difficulty?: string
        readonly maxScore: number
        readonly brief?: string
        readonly hint?: string
        readonly criteria: ReadonlyArray<PersonalProjectCriterion>
        readonly criteriaExpanded: boolean
        readonly implementation?: string
        readonly repositoryUrl?: string
        readonly repositoryDraft?: string
        readonly repositoryState: "ready" | "saving" | "invalid" | "failed"
        readonly branch?: string
        readonly tokenLast4?: string
        readonly languageOptions: ReadonlyArray<PersonalProjectModelOption>
        readonly selectedLanguage?: string
        readonly modelOptions: ReadonlyArray<PersonalProjectModelOption>
        readonly selectedModel?: string
        readonly settingsOpen: boolean
        readonly settingsState: "ready" | "saving" | "saved" | "failed"
        readonly latestAttempt?: { readonly score: number; readonly passed: boolean }
        readonly notice?: string
        readonly labels: CoursePersonalProjectTaskPageLabels
    }
    readonly on?: {
        readonly back?: () => void
        readonly toggleCriteria?: () => void
        readonly changeRepository?: (value: string) => void
        readonly openSettings?: () => void
        readonly closeSettings?: () => void
        readonly selectLanguage?: (value: string) => void
        readonly selectModel?: (value: string) => void
        readonly changeBranch?: (value: string) => void
        readonly changeToken?: (value: string) => void
        readonly saveSettings?: () => void
        readonly submit?: () => void
        readonly retry?: () => void
        readonly openFeedback?: () => void
        readonly openHistory?: () => void
    }
}

const factRun = (input: CoursePersonalProjectTaskPageProps, isLoading: boolean) => [
    defineLeafComponent("badge", {}, () => (
        <Badge props={{ content: input.props.labels.points(input.props.maxScore) }} isLoading={isLoading} />
    )),
    ...(input.props.difficulty === undefined ? [] : [defineLeafComponent("badge", {}, () => (
        <Badge props={{ content: input.props.difficulty }} isLoading={isLoading} />
    ))]),
]

/** Draws the accepted long brief, persistent submission panel and grading-settings drawer. */
export const CoursePersonalProjectTaskPageBase = (input: CoursePersonalProjectTaskPageProps) => {
    const isLoading = input.state === "pending"
    const disabled = isLoading || input.state === "submitting" || input.state === "forbidden"
    const repositoryInvalid = input.props.repositoryState === "invalid"
    const criteria = input.props.criteriaExpanded
        ? input.props.criteria.map((criterion) => defineContractComponent("personal-project-criterion-row", {
            text: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: criterion.text, size: "sm" }} isLoading={isLoading} />
            )),
            score: defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: input.props.labels.points(criterion.score) }} isLoading={isLoading} />
            )),
        }))
        : []
    const briefContent = defineContractComponent("personal-project-task-brief", {
        body: defineLeafComponent("article", {}, () => <Article props={{ body: input.props.brief }} isLoading={isLoading} />),
        ...(input.props.criteria.length === 0 && !isLoading ? {} : {
            criteriaTitle: defineLeafComponent("text", { weight: "semibold" }, () => (
                <Text props={{ content: input.props.labels.criteria, weight: "semibold" }} isLoading={isLoading} />
            )),
            criteriaToggle: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.criteriaExpanded ? input.props.labels.hideCriteria : input.props.labels.showCriteria, size: "sm" }}
                    on={{ press: input.on?.toggleCriteria }}
                    isLoading={isLoading}
                />
            )),
            ...(criteria.length === 0 ? {} : { criterion: criteria }),
        }),
        ...(input.props.implementation === undefined ? {} : {
            implementationTitle: defineLeafComponent("text", { weight: "semibold" }, () => (
                <Text props={{ content: input.props.labels.implementation, weight: "semibold" }} />
            )),
            implementation: defineLeafComponent("article", {}, () => <Article props={{ body: input.props.implementation }} />),
        }),
        ...(input.props.hint === undefined ? {} : {
            hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.hint, size: "sm", tone: "muted", icon: "review" }} />
            )),
        }),
    })
    const brief = defineContractProjection("personal-project-task-brief", () => (
        <SurfaceCard contract="personal-project-task-brief" render={briefContent} />
    ))
    const submissionContent = defineContractComponent("personal-project-submission-panel", {
        title: defineLeafComponent("text", { weight: "semibold" }, () => (
            <Text props={{ content: input.props.labels.submission, weight: "semibold" }} />
        )),
        repository: defineCompositeComponent("field", {}, () => (
            <Field
                props={{
                    id: "personal-project-repository",
                    name: "personal-project-repository",
                    label: input.props.labels.repository,
                    placeholder: input.props.repositoryUrl ?? input.props.labels.repositoryPlaceholder,
                    disabled,
                    isInvalid: repositoryInvalid,
                    hint: repositoryInvalid ? input.props.notice : input.props.repositoryUrl,
                }}
                on={{ change: input.on?.changeRepository }}
                isLoading={isLoading}
            />
        )),
        ...(input.props.repositoryState === "ready" && input.state !== "failed" ? {} : {
            status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{
                    content: input.props.notice,
                    size: "xs",
                    tone: "muted",
                    live: repositoryInvalid || input.props.repositoryState === "failed" ? "assertive" : "polite",
                }} />
            )),
        }),
        settings: defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.labels.settings, size: "sm" }} on={{ press: input.on?.openSettings }} />
        )),
        facts: defineContractComponent("profile-fact-run", { fact: factRun(input, isLoading) }),
        actions: defineContractComponent("stacked-peer-controls", {
            control: input.state === "failed"
                ? [defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.labels.retry, variant: "primary" }} on={{ press: input.on?.retry }} />
                ))]
                : [
                    defineLeafComponent("button", {}, () => (
                        <Button
                            props={{
                                label: input.props.labels.evaluate,
                                variant: "primary",
                                isPending: input.state === "submitting",
                                disabled: disabled || repositoryInvalid || (input.props.repositoryDraft ?? input.props.repositoryUrl ?? "").trim() === "",
                            }}
                            on={{ press: input.on?.submit }}
                            isLoading={isLoading}
                        />
                    )),
                    defineLeafComponent("button", {}, () => (
                        <Button props={{ label: input.props.labels.feedback }} on={{ press: input.on?.openFeedback }} />
                    )),
                ],
        }),
        ...(input.props.latestAttempt === undefined ? {} : {
            latest: defineContractComponent("personal-project-latest-result", {
                label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.labels.latest, size: "xs", tone: "muted" }} />
                )),
                result: defineContractComponent("profile-fact-run", { fact: [
                    defineLeafComponent("badge", {}, () => (
                        <Badge props={{ content: input.props.labels.points(input.props.latestAttempt?.score ?? 0) }} />
                    )),
                    defineLeafComponent("badge", {}, () => (
                        <Badge props={{
                            content: input.props.latestAttempt?.passed === true ? input.props.labels.passed : input.props.labels.needsWork,
                            tone: input.props.latestAttempt?.passed === true ? "success" : "warning",
                        }} />
                    )),
                ] }),
                action: defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.labels.history, size: "sm" }} on={{ press: input.on?.openHistory }} />
                )),
            }),
        }),
    })
    const submission = defineContractProjection("personal-project-submission-panel", () => (
        <SurfaceCard contract="personal-project-submission-panel" render={submissionContent} />
    ))
    const drawer = defineContractComponent("personal-project-grading-settings-drawer", {
        language: defineLeafComponent("select", {}, () => (
            <Select props={{
                id: "personal-project-language",
                name: "personal-project-language",
                label: input.props.labels.language,
                options: input.props.languageOptions,
                selectedKey: input.props.selectedLanguage,
                disabled: input.props.settingsState === "saving",
            }} on={{ select: input.on?.selectLanguage }} />
        )),
        model: defineLeafComponent("select", {}, () => (
            <Select props={{
                id: "personal-project-model",
                name: "personal-project-model",
                label: input.props.labels.model,
                options: input.props.modelOptions.filter((option) => option.disabled !== true),
                selectedKey: input.props.selectedModel,
                disabled: input.props.settingsState === "saving",
            }} on={{ select: input.on?.selectModel }} />
        )),
        branch: defineCompositeComponent("field", {}, () => (
            <Field props={{
                id: "personal-project-branch",
                name: "personal-project-branch",
                label: input.props.labels.branch,
                placeholder: input.props.branch ?? input.props.labels.branchPlaceholder,
                disabled: input.props.settingsState === "saving",
            }} on={{ change: input.on?.changeBranch }} />
        )),
        token: defineCompositeComponent("field", {}, () => (
            <Field props={{
                id: "personal-project-token",
                name: "personal-project-token",
                label: input.props.labels.token,
                kind: "newPassword",
                placeholder: input.props.labels.tokenPlaceholder,
                disabled: input.props.settingsState === "saving",
                revealLabel: input.props.labels.token,
                hideLabel: input.props.labels.token,
            }} on={{ change: input.on?.changeToken }} />
        )),
        ...(input.props.tokenLast4 === undefined ? {} : {
            tokenFact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.labels.tokenStored(input.props.tokenLast4 ?? ""), size: "xs", tone: "muted" }} />
            )),
        }),
        ...(input.props.settingsState === "ready" ? {} : {
            status: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{
                    content: input.props.settingsState === "saved" ? input.props.labels.settingsSaved : input.props.notice,
                    size: "sm",
                    tone: "muted",
                    live: input.props.settingsState === "failed" ? "assertive" : "polite",
                }} />
            )),
        }),
        action: defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.labels.saveSettings, variant: "primary", isPending: input.props.settingsState === "saving" }} on={{ press: input.on?.saveSettings }} />
        )),
    })

    return <>
        <Tree contract="course-personal-project-task-page" render={defineContractComponent("course-personal-project-task-page", {
            header: defineContractComponent("personal-project-task-header", {
                back: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.back, size: "sm" }} on={{ press: input.on?.back }} />),
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />),
                description: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.description }} isLoading={isLoading} />),
                meta: defineContractComponent("profile-fact-run", { fact: factRun(input, isLoading) }),
            }),
            workspace: defineContractComponent("personal-project-task-workspace", { brief, submission }),
            ...(input.state === "forbidden" ? { notice: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.notice, live: "assertive" }} />) } : {}),
        })} />
        <DrawerBranch
            isOpen={input.props.settingsOpen}
            title={input.props.labels.settings}
            onDismiss={() => input.on?.closeSettings?.()}
            contract="personal-project-grading-settings-drawer"
            render={drawer}
        />
    </>
}

/** Source-level ownership marker for the pure learning page. */
export const meta = { world: "pure", domain: "learn" } as const
