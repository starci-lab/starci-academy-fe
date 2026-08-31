import {
    describe,
    expect,
    it,
} from "vitest"
import {
    mockInterviewVerdictLabel,
} from "./verdict"

describe("mockInterviewVerdictLabel",
    () => {
        it.each<[string, string, string]>([
            ["pass", "vi", "Đạt"],
            ["borderline", "vi", "Cần củng cố"],
            ["fail", "vi", "Chưa đạt"],
            ["fail", "en", "Needs improvement"],
        ])("localizes %s for %s",
            (verdict, locale, expected) => {
                expect(mockInterviewVerdictLabel(verdict, locale)).toBe(expected)
            })
    })
