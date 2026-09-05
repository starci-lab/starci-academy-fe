import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { LookupQueryParams } from "../types"
import type { QueryConceptResponse } from "./types/concept"

/** Stable public identity for one standalone concept. */
export interface ConceptRequest { readonly displayId: string }

const document = gql`
    query Concept($request: ConceptRequest!) {
        concept(request: $request) {
            success
            message
            error
            data {
                displayId
                title
                description
                category
                difficulty
                minutesRead
                implementation
                sortIndex
                body
                learningOutcomes { id text }
                prerequisites { id text }
                references { id label url citation }
                workspace {
                    runtime
                    commands { windows unix }
                    files { path role content }
                }
                activities {
                    id
                    kind
                    stableKey
                    prompt
                    responseKind
                    isDiagnostic
                    outcomeIds
                    afterDays
                    options { id label }
                    exercise { submissionInstructions verificationMode verificationInstructions }
                }
                capabilities { choiceSubmission writtenResponseGrading simulationExecution }
                sections {
                    displayId
                    title
                    phase
                    body
                    sortIndex
                    activities {
                        id
                        kind
                        stableKey
                        prompt
                        responseKind
                        isDiagnostic
                        outcomeIds
                        afterDays
                        options { id label }
                        exercise { submissionInstructions verificationMode verificationInstructions }
                    }
                }
            }
        }
    }
`

/** The public standalone-concept detail document. */
export enum QueryConcept { Query1 = "query1" }

/** Read one concept by the slug carried in its URL. */
export const queryConcept = async ({ request, headers, signal, debug }: LookupQueryParams<QueryConcept, ConceptRequest>) =>
    createApolloClient({ headers, signal, debug }).query<QueryConceptResponse>({
        query: document,
        variables: { request },
    })
