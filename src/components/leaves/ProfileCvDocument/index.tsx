import { profileCvDocumentClassName } from "./classNames"

/** Intrinsic read-only document carried by the public-CV paper. */
export type ProfileCvDocumentData = { readonly title: string, readonly src?: string }
/** Input for the read-only public-CV document. */
export type ProfileCvDocumentProps = { readonly props: ProfileCvDocumentData; readonly isLoading?: boolean }

/** Embed one compiled public CV without editor controls. */
export const ProfileCvDocument = (props: ProfileCvDocumentProps) => (
    <iframe
        data-loading={props.isLoading ? "true" : "false"}
        title={props.props.title}
        src={props.isLoading ? undefined : props.props.src}
        aria-busy={props.isLoading ? true : undefined}
        className={profileCvDocumentClassName}
    />
)
