import { PersonalProjectPage } from "./component"

interface PersonalProjectRouteProps { params: Promise<{ lang: string; displayId: string }> }

const PersonalProjectRoute = async ({ params }: PersonalProjectRouteProps) => { const resolved = await params; return <PersonalProjectPage lang={resolved.lang} displayId={resolved.displayId} /> }

export default PersonalProjectRoute
