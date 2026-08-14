/** Request for the enrollment-gated sandbox snapshot URL. */
export type SandboxRepoUrlRequest = {
    readonly contentId: string
}

/** The resolver returns the URL scalar directly rather than a response envelope. */
export type QuerySandboxRepoUrlResponse = {
    readonly sandboxRepoUrl: string
}
