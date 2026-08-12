import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QueryRecommendedCoursesResponse } from "./types/dashboard-learning-community"

const document = gql`query RecommendedCourses { recommendedCourses { success message error data { items { displayId title description thumbnailUrl originalPriceVnd discountedPriceVnd discountPercent discountReason enrolledCount } } } }`
export enum QueryRecommendedCourses { Query1 = "query1" }
/** Fetch auth-scoped course recommendations. */
export const queryRecommendedCourses = async ({ headers, signal, debug }: QueryParams<QueryRecommendedCourses> = {}) => createApolloClient({ withAuth: true, headers, signal, debug }).query<QueryRecommendedCoursesResponse>({ query: document })
