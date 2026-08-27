import { CourseLeaderboardBlock, type CourseLeaderboardBlockCategory } from "@/components/blocks/learn/CourseLeaderboardBlock"

/** The four URL-selected score lenses supported by the course board. */
export type CourseLeaderboardCategory = CourseLeaderboardBlockCategory
/** Route identity passed from the page entry to its connected block. */
export type CourseLeaderboardPageProps = { readonly displayId: string; readonly selectedCategory: CourseLeaderboardCategory }

/** Compose the connected block directly; the page does not proxy its rendered state or data. */
export const CourseLeaderboardPageBase = (props: CourseLeaderboardPageProps) => <CourseLeaderboardBlock displayId={props.displayId} category={props.selectedCategory} />
