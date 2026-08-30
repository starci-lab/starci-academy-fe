import type { CvBlock, CvDocument } from "@/modules/types/cv"

const text = (block: CvBlock | undefined, key: string) => {
    const value = block?.items[0]?.fields[key]
    return typeof value === "string" ? value.trim() : ""
}

const escapeTex = (value: string) => value
    .replaceAll("\\", "\\textbackslash{}")
    .replaceAll("&", "\\&")
    .replaceAll("%", "\\%")
    .replaceAll("$", "\\$")
    .replaceAll("#", "\\#")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("~", "\\textasciitilde{}")
    .replaceAll("^", "\\textasciicircum{}")

const section = (title: string, body: string) => body.trim() === "" ? "" : `\\section*{${escapeTex(title)}}\n${body}`

const itemLines = (value: string) => value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `\\item ${escapeTex(line.replace(/^[-•]\s*/, ""))}`)
    .join("\n")

const fallbackTitles = {
    summary: "Tóm tắt", // vn-ok: localized Vietnamese LaTeX section fallback.
    experience: "Kinh nghiệm", // vn-ok: localized Vietnamese LaTeX section fallback.
    project: "Dự án", // vn-ok: localized Vietnamese LaTeX section fallback.
    skills: "Kỹ năng", // vn-ok: localized Vietnamese LaTeX section fallback.
    education: "Học vấn", // vn-ok: localized Vietnamese LaTeX section fallback.
}

/** Serializes the legacy StarCi block schema into a complete ATS-safe LaTeX document. */
export const buildCvTexSource = (document: CvDocument): string => {
    const blocks = [...document.blocks].sort((left, right) => left.order - right.order)
    const get = (type: CvBlock["type"]) => blocks.find((block) => block.type === type)
    const personal = get("personal")
    const summary = get("summary")
    const experience = get("experience")
    const project = get("project")
    const education = get("education")
    const skills = get("skills")
    const contact = [text(personal, "email"), text(personal, "phone"), text(personal, "location"), text(personal, "githubUsername")]
        .filter(Boolean)
        .map(escapeTex)
        .join(" \\textbullet{} ")
    const experienceBody = experience?.items.map((item) => {
        const fields = item.fields
        const role = typeof fields.role === "string" ? fields.role : ""
        const company = typeof fields.company === "string" ? fields.company : ""
        const dates = [fields.startDate, fields.endDate].filter((value): value is string => typeof value === "string" && value !== "").join(" -- ")
        const bullets = typeof fields.bullets === "string" ? itemLines(fields.bullets) : ""
        return `\\textbf{${escapeTex(role)}} ${company ? `--- ${escapeTex(company)}` : ""}\\hfill ${escapeTex(dates)}\n${bullets ? `\\begin{itemize}\n${bullets}\n\\end{itemize}` : ""}`
    }).join("\n\n") ?? ""
    const projectBody = project?.items.map((item) => {
        const fields = item.fields
        const title = typeof fields.title === "string" ? fields.title : ""
        const description = typeof fields.description === "string" ? fields.description : ""
        return title === "" && description === "" ? "" : `\\textbf{${escapeTex(title)}}\\\\\n${escapeTex(description)}`
    }).filter(Boolean).join("\n\n") ?? ""
    const educationBody = education?.items.map((item) => {
        const fields = item.fields
        const school = typeof fields.school === "string" ? fields.school : ""
        const degree = typeof fields.degree === "string" ? fields.degree : ""
        const dates = [fields.startDate, fields.endDate].filter((value): value is string => typeof value === "string" && value !== "").join(" -- ")
        return school === "" && degree === "" ? "" : `\\textbf{${escapeTex(school)}} --- ${escapeTex(degree)}\\hfill ${escapeTex(dates)}`
    }).filter(Boolean).join("\n") ?? ""
    const skillBody = skills?.items.map((item) => typeof item.fields.name === "string" ? item.fields.name : "").filter(Boolean).map(escapeTex).join(" \\textbullet{} ") ?? ""
    const accent = document.style.accent.replace("#", "").toUpperCase()

    return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{hyperref}
\\definecolor{accent}{HTML}{${accent}}
\\hypersetup{colorlinks=true,urlcolor=accent}
\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{}[{\\color{accent}\\titlerule}]
\\setlist[itemize]{leftmargin=1.2em,itemsep=2pt,topsep=2pt}
\\pagenumbering{gobble}
\\begin{document}
\\begin{center}
{\\LARGE\\bfseries ${escapeTex(text(personal, "name") || document.label)}}\\\\
${escapeTex(text(personal, "role"))}\\\\
${contact}
\\end{center}

${section(summary?.title || fallbackTitles.summary, escapeTex(text(summary, "text")))}

${section(experience?.title || fallbackTitles.experience, experienceBody)}

${section(project?.title || fallbackTitles.project, projectBody)}

${section(skills?.title || fallbackTitles.skills, skillBody)}

${section(education?.title || fallbackTitles.education, educationBody)}
\\end{document}
`
}
