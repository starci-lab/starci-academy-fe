import { redirect } from "next/navigation"

/**
 * The site root carries no content of its own in this build - the dashboard is the
 * only surface, so the root hands the reader straight to it rather than rendering a
 * second, emptier version of the same page.
 */
const HomePage = () => {
    redirect("/dashboard")
}

export default HomePage
