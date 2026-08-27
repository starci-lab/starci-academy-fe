import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type MockPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string; readonly resizeLabel: string }
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({ CourseLearnChallengePageBase: ({ displayId, moduleId, contentId, challengeId, resizeLabel }: MockPageProps) => <output data-testid="route">{displayId}:{moduleId}:{contentId}:{challengeId}:{resizeLabel}</output> }))
import { CourseLearnChallengePage } from "./index"
describe("CourseLearnChallengePage route", () => { it("passes route identity and the localized resize label to the challenge shell", () => { render(<CourseLearnChallengePage displayId="course" moduleId="module" contentId="content" challengeId="challenge" />); expect(screen.getByTestId("route")).toHaveTextContent("course:module:content:challenge:resizeRail") }) })
