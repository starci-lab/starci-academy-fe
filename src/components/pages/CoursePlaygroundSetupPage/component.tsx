import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { Playground } from "@/modules/api/graphql/queries/query-playground"

/** Setup and agent-pairing states exposed by the pure setup page. */
export type CoursePlaygroundSetupState = "loading" | "unpaired" | "paired" | "ready" | "starting" | "failed"

/** Resolved playground, pairing copy and setup actions. */
export type CoursePlaygroundSetupPageProps = {
    readonly state: CoursePlaygroundSetupState
    readonly props: {
        readonly playground?: Playground | null
        readonly titleFallback: string
        readonly preparationTitle: string
        readonly preparationSteps: ReadonlyArray<string>
        readonly startLabel: string
        readonly startingLabel: string
        readonly pairingLabel: string
        readonly waitingLabel: string
        readonly readyLabel: string
        readonly enterLabel: string
        readonly retryLabel: string
        readonly failedText: string
        readonly pairingCode?: string
    }
    readonly on: {
        readonly start: () => void
        readonly enter: () => void
        readonly retry: () => void
    }
}

/** Draw setup and pairing as states of one server-created playground session. */
export const _CoursePlaygroundSetupPage = (input: CoursePlaygroundSetupPageProps) => {
    const loading = input.state === "loading"
    const failed = input.state === "failed"
    const paired = input.state === "paired" || input.state === "ready"
    const notice = failed
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{ message: input.props.failedText, actionLabel: input.props.retryLabel }}
                on={{ act: input.on.retry }}
            />
        ))
        : undefined
    const actions = failed
        ? undefined
        : paired
            ? [defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.enterLabel, variant: "primary", disabled: input.state !== "ready" }}
                    on={{ press: input.on.enter }}
                />
            ))]
            : [defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: input.state === "starting" ? input.props.startingLabel : input.props.startLabel,
                        variant: "primary",
                        isPending: input.state === "starting",
                    }}
                    on={{ press: input.on.start }}
                    isLoading={loading}
                />
            ))]

    return (
        <Tree contract="course-playground-setup-page" render={defineContractComponent("course-playground-setup-page", {
            header: defineContractComponent("page-header-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading
                        props={{ content: input.props.playground?.title ?? input.props.titleFallback, level: 1 }}
                        isLoading={loading}
                    />
                )),
            }),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text
                    props={{ content: input.props.playground?.description ?? "", size: "sm", tone: "muted" }}
                    isLoading={loading}
                />
            )),
            ...(!failed ? {
                preparationTitle: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.preparationTitle, level: 2 }} isLoading={loading} />
                )),
                preparationStep: input.props.preparationSteps.map((step, index) => defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: `${index + 1}. ${step}`, size: "sm" }} isLoading={loading} />
                ))),
            } : {}),
            ...(paired ? {
                pairingLabel: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.pairingLabel, size: "xs", tone: "muted" }} />
                )),
                pairingCode: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                    <Text props={{ content: input.props.pairingCode, size: "sm", weight: "semibold" }} />
                )),
                status: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{
                            content: input.state === "ready" ? input.props.readyLabel : input.props.waitingLabel,
                            size: "sm",
                            tone: "muted",
                            live: "polite",
                        }}
                    />
                )),
            } : {}),
            action: actions,
            notice,
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
