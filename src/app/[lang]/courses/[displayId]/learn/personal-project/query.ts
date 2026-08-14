import { gql } from "@apollo/client"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"
import type { A2Attempt, A2Feedback, A2Outline } from "./types"

const courseQuery = gql`
  query A2Course($request: CourseRequest!) {
    course(request: $request) { success data { id displayId title } }
  }
`

const outlineQuery = gql`
  query A2MyCourseOutline($request: MyCourseOutlineRequest!) {
    myCourseOutline(request: $request) { success data {
      course { id title displayId }
      milestones { id title orderIndex tasks { id title type maxScore completed lastScore } }
      progress { tasksCompleted tasksTotal completionPercent }
      currentTask { kind id milestoneId }
    } }
  }
`

const attemptsQuery = gql`
  query A2Attempts($request: UserPersonalTaskAttemptsRequest!) {
    userPersonalTaskAttempts(request: $request) { success data { count data {
      id attemptNumber passed score shortFeedback processedAt servedModel servedProvider
    } } }
  }
`

const feedbackQuery = gql`
  query A2Feedback($request: UserPersonalTaskAttemptFeedbacksRequest!) {
    userPersonalTaskAttemptFeedbacks(request: $request) { success data { count data {
      id message severity sortIndex location suggestion
    } } }
  }
`

type CourseResponse = { course: { success: boolean; data?: { id: string } | null } }
type OutlineResponse = { myCourseOutline: { success: boolean; data?: A2Outline | null } }
type AttemptsResponse = { userPersonalTaskAttempts: { success: boolean; data?: { data: A2Attempt[] } | null } }
type FeedbackResponse = { userPersonalTaskAttemptFeedbacks: { success: boolean; data?: { data: A2Feedback[] } | null } }

export const loadA2Outline = async (displayId: string, signal?: AbortSignal) => {
    const client = createApolloClient({ withAuth: true, signal })
    const course = await client.query<CourseResponse>({ query: courseQuery, variables: { request: { displayId } }, fetchPolicy: "no-cache" })
    const courseId = course.data?.course.data?.id
    if (!courseId) return null
    const outline = await client.query<OutlineResponse>({ query: outlineQuery, variables: { request: { courseId } }, fetchPolicy: "no-cache" })
    return outline.data?.myCourseOutline.data ?? null
}

export const loadA2Attempts = async (courseId: string, taskId: string, signal?: AbortSignal) => {
    const client = createApolloClient({ withAuth: true, signal })
    const response = await client.query<AttemptsResponse>({
        query: attemptsQuery,
        variables: { request: { courseId, taskId, filters: { limit: 20, cursor: null } } },
        fetchPolicy: "no-cache",
    })
    return response.data?.userPersonalTaskAttempts.data?.data ?? []
}

export const loadA2Feedback = async (attemptId: string, signal?: AbortSignal) => {
    const client = createApolloClient({ withAuth: true, signal })
    const response = await client.query<FeedbackResponse>({
        query: feedbackQuery,
        variables: { request: { attemptId, filters: { limit: 100, cursor: null } } },
        fetchPolicy: "no-cache",
    })
    return response.data?.userPersonalTaskAttemptFeedbacks.data?.data ?? []
}
