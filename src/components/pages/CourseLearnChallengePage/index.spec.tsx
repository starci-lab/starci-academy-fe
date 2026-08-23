import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type MockPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string }
vi.mock("./component", () => ({ CourseLearnChallengePageBase: ({ displayId, moduleId, contentId, challengeId }: MockPageProps) => <output data-testid="route">{displayId}:{moduleId}:{contentId}:{challengeId}</output> }))
import { CourseLearnChallengePage } from "./index"
describe("CourseLearnChallengePage route", () => { it("passes route identity to the challenge shell", () => { render(<CourseLearnChallengePage displayId="course" moduleId="module" contentId="content" challengeId="challenge" />); expect(screen.getByTestId("route")).toHaveTextContent("course:module:content:challenge") }) })
