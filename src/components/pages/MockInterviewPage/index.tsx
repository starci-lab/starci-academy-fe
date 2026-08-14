"use client"

import { useState } from "react"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

type MockInterviewPageProps = {
    readonly displayId: string
    readonly sessionId?: string
    readonly resultSessionId?: string
}

type InterviewState = "setup" | "live" | "grading" | "result" | "error"

const MockInterviewPage = ({ displayId, sessionId, resultSessionId }: MockInterviewPageProps) => {
    const [state, setState] = useState<InterviewState>(resultSessionId ? "result" : sessionId ? "live" : "setup")
    const [answer, setAnswer] = useState("")
    const [error, setError] = useState(false)

    const start = () => {
        setError(false)
        setState("live")
    }

    const submit = () => {
        if (!answer.trim()) return
        setState("grading")
        window.setTimeout(() => setState("result"), 450)
    }

    if (state === "result") {
        return (
            <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                <Text props={{ content: "Phỏng vấn thử", size: "xs", tone: "muted" }} />
                <Heading props={{ content: "Nhận xét từ buổi phỏng vấn", level: 1 }} />
                <section className="rounded-xl border border-default bg-surface p-5 shadow-sm">
                    <Text props={{ content: "Kết quả", size: "sm", tone: "muted" }} />
                    <p className="mt-2 text-3xl font-semibold text-foreground">Đang chờ bản chấm</p>
                    <p className="mt-2 text-sm text-muted">Bản ghi sẽ hiển thị điểm và nhận xét theo từng tiêu chí.</p>
                </section>
                <Button props={{ label: "Phỏng vấn lại", variant: "primary" }} on={{ press: () => setState("setup") }} />
            </main>
        )
    }

    if (state === "live" || state === "grading") {
        return (
            <main className="mx-auto grid min-h-[32rem] w-full max-w-6xl gap-0 overflow-hidden border border-default bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
                <section className="space-y-6 p-5 sm:p-8">
                    <div className="flex items-center justify-between gap-4 border-b border-default pb-4">
                        <div>
                            <Text props={{ content: "Phỏng vấn thử", size: "xs", tone: "muted" }} />
                            <Heading props={{ content: `Thiết kế hệ thống · ${displayId}`, level: 1 }} />
                        </div>
                        <Text props={{ content: "Câu hỏi 1/5 · 30:00", size: "xs", tone: "muted" }} />
                    </div>
                    <p className="text-base leading-7 text-foreground">Hãy mô tả cách bạn thiết kế một hệ thống có thể mở rộng cho một triệu người dùng.</p>
                    <textarea
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        placeholder="Trả lời như đang nói với người phỏng vấn…"
                        className="min-h-48 w-full rounded-lg border border-default bg-background p-4 text-sm text-foreground outline-none focus:border-accent"
                        disabled={state === "grading"}
                    />
                    <div className="flex flex-wrap gap-3">
                        <Button props={{ label: state === "grading" ? "Đang chấm…" : "Gửi câu trả lời", variant: "primary", disabled: state === "grading" || !answer.trim(), isPending: state === "grading" }} on={{ press: submit }} />
                        <Button props={{ label: "Rời phỏng vấn", variant: "ghost" }} on={{ press: () => setState("setup") }} />
                    </div>
                </section>
                <aside className="border-t border-default bg-background p-5 lg:border-l lg:border-t-0 lg:p-8">
                    <Text props={{ content: "Người phỏng vấn", size: "xs", tone: "muted" }} />
                    <p className="mt-3 text-lg font-medium text-foreground">Alex · Senior Engineer</p>
                    <p className="mt-2 text-sm leading-6 text-muted">Hãy trình bày suy nghĩ theo từng bước. Bạn có thể sửa câu trả lời trước khi gửi.</p>
                </aside>
            </main>
        )
    }

    return (
        <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
            <Text props={{ content: "Phỏng vấn thử", size: "xs", tone: "muted" }} />
            <Heading props={{ content: "Phỏng vấn thử", level: 1 }} />
            <p className="text-base leading-7 text-muted">Trả lời các câu hỏi phỏng vấn kỹ thuật ngẫu nhiên, AI chấm chi tiết.</p>
            <section className="rounded-xl border border-default bg-surface p-5 shadow-sm">
                {error ? <p role="alert" className="mb-4 text-sm text-danger">Không lưu được tiến độ phỏng vấn. Vui lòng thử lại.</p> : null}
                <p className="text-lg font-medium text-foreground">Chuẩn bị cho buổi phỏng vấn</p>
                <p className="mt-2 text-sm leading-6 text-muted">Chọn cấp độ phù hợp. Đề và kiểu câu hỏi được chọn ngẫu nhiên như phỏng vấn thật.</p>
                <div className="mt-5 flex flex-wrap gap-2" aria-label="Cấp độ phỏng vấn">
                    {['Sơ cấp', 'Trung cấp', 'Cao cấp'].map((tier) => <span key={tier} className="rounded-full border border-default px-3 py-1 text-sm text-muted">{tier}</span>)}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button props={{ label: "Bắt đầu phỏng vấn", variant: "primary" }} on={{ press: start }} />
                    <Button props={{ label: "Thử lại", variant: "ghost", disabled: !error }} on={{ press: () => setError(false) }} />
                </div>
            </section>
        </main>
    )
}

export { MockInterviewPage }
