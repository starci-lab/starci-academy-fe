import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ConceptCatalogPage } from "@/components/pages/ConceptCatalogPage"

/** Localized browser title for the standalone concept catalog. */
export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await getTranslations("concept.catalog"))("title"),
})

const ConceptCatalogRoute = () => <ConceptCatalogPage {...{}} />

export default ConceptCatalogRoute
