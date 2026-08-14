import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** A consultant with viewer-gated contact truth exactly as returned by the backend. */
export interface Consultant {
    readonly id: string
    readonly displayId: string
    readonly fullName: string
    readonly jobTitle: string | null
    readonly description: string | null
    readonly linkedinUrl: string | null
    readonly email: string | null
    readonly phoneNumber: string | null
    readonly zaloNumber: string | null
    readonly avatarUrl: string | null
    readonly sortIndex: number
    readonly companyId: string
    readonly contactUnlocked: boolean
    readonly cvScoreUnlockThreshold: number
}

/** Paginated consultant roster returned for one company. */
export interface ConsultantsPage {
    readonly count: number
    readonly data: ReadonlyArray<Consultant>
}

interface QueryConsultantsRequest {
    readonly companyId: string
    readonly filters?: {
        readonly pageNumber?: number
        readonly limit?: number
        readonly search?: string
        readonly sorts?: ReadonlyArray<{
            readonly by: "fullName" | "sortIndex" | "createdAt" | "updatedAt"
            readonly order: "ASC" | "DESC"
        }>
    }
}

interface QueryConsultantsResponse {
    readonly consultants: GraphQLResponse<ConsultantsPage>
}

const query1 = gql`
    query Consultants($request: ConsultantsRequest!) {
        consultants(request: $request) {
            success
            message
            error
            data {
                count
                data {
                    id
                    displayId
                    fullName
                    jobTitle
                    description
                    linkedinUrl
                    email
                    phoneNumber
                    zaloNumber
                    avatarUrl
                    sortIndex
                    companyId
                    contactUnlocked
                    cvScoreUnlockThreshold
                }
            }
        }
    }
`

export enum QueryConsultants { Query1 = "query1" }

const queryConsultantsMap: Record<QueryConsultants, DocumentNode> = {
    [QueryConsultants.Query1]: query1,
}

/** Lists consultants for one company with server-side ordering and contact gating. */
export const queryConsultants = async ({
    query = QueryConsultants.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryConsultants, QueryConsultantsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryConsultantsResponse>({
        query: queryConsultantsMap[query],
        variables: { request },
    })
}
