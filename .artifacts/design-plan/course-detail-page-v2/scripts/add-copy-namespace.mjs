import { readFileSync, writeFileSync } from "node:fs"

/**
 * Add the `courses.detail` namespace to both catalogues.
 *
 * BOTH, in one edit, and that is the point rather than thoroughness: a key added to `vi` alone does
 * not fail anything - next-intl falls back and the English reader sees a Vietnamese sentence, or a
 * raw key, on a page that otherwise looks finished. The sibling locale is checked here because
 * nothing downstream checks it.
 *
 * The English copy is a real translation, not the Vietnamese strings copied across. Where a word
 * would be guesswork it uses the plain term rather than inventing product voice.
 */
const ROOT = "D:/Repositories/starci-academy-fe/src/messages"

const DETAIL = {
    vi: {
        navHome: "Trang chủ",
        navCourses: "Khóa học",
        valuePropsTitle: "Bạn sẽ học được gì",
        curriculumTitle: "Nội dung khóa học",
        statLearners: "{count} Học viên",
        statModules: "{count} Module",
        statContents: "{count} Nội dung",
        statHours: "{count} Giờ học",
        statChallenges: "{count} Bài thực hành",
        previewCount: "{count} bài xem trước",
        phaseOpen: "Đang mở",
        savings: "Tiết kiệm {amount}",
        scarcity: "Còn {count} suất ở phase {phase}",
        enrolled: "{count} người đã đăng ký",
        enroll: "Đăng ký học",
        continue: "Tiếp tục học",
        notFound: "Không tìm thấy khóa học này.",
        failed: "Không tải được khóa học.",
        retry: "Thử lại",
        tier: { foundation: "Nền tảng", intermediate: "Trung cấp", advanced: "Nâng cao" },
        phase: { pioneer: "Tiên phong", earlyBird: "Sớm", regular: "Tiêu chuẩn" },
    },
    en: {
        navHome: "Home",
        navCourses: "Courses",
        valuePropsTitle: "What you will learn",
        curriculumTitle: "Course content",
        statLearners: "{count} Learners",
        statModules: "{count} Modules",
        statContents: "{count} Lessons",
        statHours: "{count} Hours",
        statChallenges: "{count} Exercises",
        previewCount: "{count} previews",
        phaseOpen: "Open now",
        savings: "Save {amount}",
        scarcity: "{count} seats left in the {phase} phase",
        enrolled: "{count} learners enrolled",
        enroll: "Enrol now",
        continue: "Continue learning",
        notFound: "This course could not be found.",
        failed: "The course could not be loaded.",
        retry: "Try again",
        tier: { foundation: "Foundation", intermediate: "Intermediate", advanced: "Advanced" },
        phase: { pioneer: "Pioneer", earlyBird: "Early bird", regular: "Standard" },
    },
}

for (const locale of ["vi", "en"]) {
    const path = `${ROOT}/${locale}.json`
    const catalogue = JSON.parse(readFileSync(path, "utf8"))
    catalogue.courses = { ...catalogue.courses, detail: DETAIL[locale] }
    writeFileSync(path, `${JSON.stringify(catalogue, null, 4)}\n`, "utf8")
    console.log(`${locale}.json: courses.detail has ${Object.keys(DETAIL[locale]).length} keys`)
}

// The two catalogues must agree on SHAPE even where they differ on words.
const shape = (value) => (typeof value === "object" && value !== null
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]))
    : 0)
const vi = shape(JSON.parse(readFileSync(`${ROOT}/vi.json`, "utf8")).courses.detail)
const en = shape(JSON.parse(readFileSync(`${ROOT}/en.json`, "utf8")).courses.detail)
console.log(`shapes match: ${JSON.stringify(vi) === JSON.stringify(en)}`)
