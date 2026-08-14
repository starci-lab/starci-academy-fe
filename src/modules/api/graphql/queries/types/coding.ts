/**
 * The coding-practice payloads.
 *
 * Deliberately NOT the backend's full entities. `CodingProblemEntity` reaches into testcases,
 * starter code and reference solutions, almost none of which a catalog row renders and some of
 * which the server never returns to a client at all. Every field here is one the document selects.
 */

import { type GraphQLResponse } from "../../types"

/** One interview topic and how many enabled problems it holds. */
export interface CodingDomainCount {
    /** The domain enum value, which is also the route segment. */
    domain: string
    /** Enabled problems in it. */
    total: number
}

/** The per-domain catalog sizes. A domain holding nothing is ABSENT rather than zero. */
export interface CodingDomainSummaryPayload {
    domains: Array<CodingDomainCount>
}

/** Response of the `codingDomainSummary` query, envelope included. */
export interface CodingDomainSummaryResponse {
    codingDomainSummary: GraphQLResponse<CodingDomainSummaryPayload>
}

/** One problem, as the catalog returns it. */
export interface CodingProblemRow {
    id: string
    slug: string
    title: string
    difficulty: string
    domain: string
    points: number
    tags: Array<string>
}

/** A page of problems plus the total the window was cut from. */
export interface CodingProblemsPayload {
    problems: Array<CodingProblemRow>
    total: number
}

/** Response of the `codingProblems` query. */
export interface CodingProblemsResponse {
    codingProblems: GraphQLResponse<CodingProblemsPayload>
}

/** Distinct problems solved in one domain. Absent for a domain with none. */
export interface CodingDomainSolved {
    domain: string
    solved: number
}

/** The viewer's coding standing. */
export interface MyCodingProgressPayload {
    solvedProblemIds: Array<string>
    attemptedProblemIds: Array<string>
    revealedProblemIds: Array<string>
    totalPoints: number
    /** Solved counts per domain. A domain with no solves is ABSENT, not zero. */
    byDomain: Array<CodingDomainSolved>
}

/** Response of the `myCodingProgress` query. */
export interface MyCodingProgressResponse {
    myCodingProgress: GraphQLResponse<MyCodingProgressPayload>
}

/** One sample testcase a problem shows. */
export interface CodingSampleTestcase {
    input: string
    expectedOutput: string
}

/** Starter code for one language. */
export interface CodingStarterCode {
    language: string
    code: string
}

/** One problem in full, as the detail query returns it. */
export interface CodingProblemDetail {
    id: string
    slug: string
    title: string
    statement: string
    difficulty: string
    domain: string
    points: number
    tags: Array<string>
    timeLimitMs: number
    memoryLimitKb: number
    sampleTestcases: Array<CodingSampleTestcase>
    starterCodes: Array<CodingStarterCode>
}

/** Response of the `codingProblem` query. */
export interface CodingProblemResponse {
    codingProblem: GraphQLResponse<CodingProblemDetail>
}

/** What the submit mutation hands back: identifiers, never a verdict. */
export interface SubmitCodingSolutionPayload {
    /** The created submission row. */
    submissionId: string
    /** The judging job to subscribe to over Socket.IO for the verdict. */
    jobId: string
}

/** Response of the `submitCodingSolution` mutation. */
export interface SubmitCodingSolutionResponse {
    submitCodingSolution: GraphQLResponse<SubmitCodingSolutionPayload>
}
