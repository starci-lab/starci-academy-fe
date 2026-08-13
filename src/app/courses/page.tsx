"use client"

import { CoursesCatalogPage } from "@/components/pages/CoursesCatalogPage"

/**
 * The `/courses` route. It renders the page component and nothing else: the route is a mounting
 * point, so every decision about what the catalog IS lives one tier down where it can be
 * rendered, tested and changed without a router.
 */
const CoursesRoute = () => <CoursesCatalogPage />

export default CoursesRoute
