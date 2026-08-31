/** Convert the stable backend verdict code into learner-facing copy. */
export const mockInterviewVerdictLabel = (verdict: string | undefined, locale: string) => {
    if (verdict === undefined) return undefined
    const normalized = verdict.trim().toLowerCase()
    const labels = locale === "vi"
        ? { pass: "Đạt", borderline: "Cần củng cố", fail: "Chưa đạt" } // vn-ok: learner-facing Vietnamese verdict labels
        : { pass: "Pass", borderline: "Borderline", fail: "Needs improvement" }
    return labels[normalized as keyof typeof labels] ?? verdict
}
