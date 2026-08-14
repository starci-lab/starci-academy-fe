import useSWRMutation from "swr/mutation"
import {
    mutationCreateCourseQuestion,
    type CreateCourseQuestionRequest,
} from "@/modules/api/graphql/mutations/mutation-create-course-question"

type Trigger = { readonly arg: CreateCourseQuestionRequest }

const MUTATE_CREATE_COURSE_QUESTION_SWR_KEY = "MUTATE_CREATE_COURSE_QUESTION_SWR"

/** Creates a course-general question through createComment(courseId, body). */
export const useMutateCreateCourseQuestionSwr = () => useSWRMutation(
    MUTATE_CREATE_COURSE_QUESTION_SWR_KEY,
    async (_key: string, { arg }: Trigger) => mutationCreateCourseQuestion({ request: arg }),
)
