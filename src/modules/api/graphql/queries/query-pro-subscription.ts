import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import {
    type QueryMyProSubscriptionResponse,
    type QueryProOfferResponse,
} from "./types/pro-subscription"

const proOfferQuery = gql`
    query ProOffer {
        proOffer {
            success
            message
            error
            data {
                planId
                displayName
                description
                priceVnd
                billingPeriodMonths
                offerRevision
                creditsPer5h
                creditsPerWeek
                enabled
            }
        }
    }
`

const myProSubscriptionQuery = gql`
    query MyProSubscription {
        myProSubscription {
            success
            message
            error
            data {
                active
                subscription {
                    status
                    currentPeriodEnd
                    renewalIntent
                    cancelledAt
                    accessVersion
                }
            }
        }
    }
`

/** Read the mounted public offer without treating client copy as pricing authority. */
export const queryProOffer = async () => {
    const apollo = createApolloClient()
    return apollo.query<QueryProOfferResponse>({ query: proOfferQuery, fetchPolicy: "network-only" })
}

/** Read the authenticated learner's date-aware Pro lifecycle. */
export const queryMyProSubscription = async () => {
    const apollo = createApolloClient({ withAuth: true })
    return apollo.query<QueryMyProSubscriptionResponse>({ query: myProSubscriptionQuery, fetchPolicy: "network-only" })
}
