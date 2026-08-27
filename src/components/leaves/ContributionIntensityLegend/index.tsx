import { contributionLegendClassName, contributionLegendLabelClassName, contributionLegendLoadingCellClassName, contributionLegendLoadingLabelClassName, getContributionLegendCellClassName } from "./classNames"

/** Resolved copy around the fixed five-step contribution scale. */
export type ContributionIntensityLegendData = {
    readonly lessLabel?: string
    readonly moreLabel?: string
}

/** Props for the intrinsic contribution intensity key. */
export type ContributionIntensityLegendProps = { readonly props: ContributionIntensityLegendData; readonly isLoading?: boolean }

/** Draw the conventional less-to-more key as one intrinsic legend. */
export const ContributionIntensityLegend = (props: ContributionIntensityLegendProps) => {
    const isLoading = props.isLoading === true
    return (<span className={contributionLegendClassName} data-part="intensity-legend">
        <span className={isLoading ? contributionLegendLoadingLabelClassName : contributionLegendLabelClassName}>{isLoading ? "" : props.props.lessLabel}</span>
        {Array.from({ length: 5 }, (_, level) => (
            <span key={level} data-level={level} aria-hidden="true" className={isLoading ? contributionLegendLoadingCellClassName : getContributionLegendCellClassName(level)} />
        ))}
        <span className={isLoading ? contributionLegendLoadingLabelClassName : contributionLegendLabelClassName}>{isLoading ? "" : props.props.moreLabel}</span>
    </span>
    )
}
