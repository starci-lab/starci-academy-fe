"use client"

import { useRouter } from "@/i18n/navigation"
import { usePlaygroundSession } from "@/components/layouts/PlaygroundSessionLayout"
import { _CoursePlaygroundSetupPage, type CoursePlaygroundSetupState } from "./component"

/** Course and playground route identities consumed by setup. */
export type CoursePlaygroundSetupPageProps = { readonly displayId: string; readonly slug: string }

/** Bind the setup route to the slug layout's persistent query, mutation and socket owner. */
export const CoursePlaygroundSetupPage = ({ displayId, slug }: CoursePlaygroundSetupPageProps) => {
    const router = useRouter()
    const session = usePlaygroundSession()
    const state: CoursePlaygroundSetupState = session.failed || session.startFailed
        ? "failed"
        : session.isLoading ? "loading"
            : session.isStarting ? "starting"
                : session.session === null ? "unpaired"
                    : session.agentConnected ? "ready" : "paired"

    return (
        <_CoursePlaygroundSetupPage
            state={state}
            props={{
                playground: session.playground,
                titleFallback: "Playground",
                preparationTitle: "Prepare your environment",
                preparationSteps: ["Install the StarCi CLI", "Create a session and copy its pairing code", "Pair your machine with this session"],
                startLabel: "Create playground session",
                startingLabel: "Creating session...",
                pairingLabel: "Pairing code",
                waitingLabel: "Waiting for the agent on your machine to connect.",
                readyLabel: "Agent connected. Your workspace is ready.",
                enterLabel: "Enter workspace",
                retryLabel: "Try again",
                failedText: "The playground session could not be prepared.",
                pairingCode: session.session?.pairingCode,
            }}
            on={{
                start: () => { void session.start() },
                enter: () => router.push(`/courses/${displayId}/learn/playground/${slug}/session`),
                retry: session.retry,
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
