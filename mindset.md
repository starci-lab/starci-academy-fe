# Mindset FE — Dạy AI làm giao diện đúng tư duy

Tài liệu này mô tả **cách nghĩ**, không phải checklist copy class. AI đọc xong phải biết *vì sao* chỉnh layout, *khi nào* dừng, và *cách* nhận feedback từ người dùng (ảnh, màu, tiếng Việt rút gọn).

Case tham chiếu: refactor **dashboard left rail** trong repo `starci-academy-fe`.

---

## 1. Nguyên tắc gốc

### 1.1 Nhìn trước, code sau

- User gửi **screenshot + khoanh màu** → đó là spec thật, không phải “gợi ý”.
- Đỏ / xanh / viền xanh thường là: **vùng A**, **vùng B**, **border cần bỏ**.
- Câu kiểu `gap-3 → gap-4`, `bỏ border` là **chỉ số cụ thể** — làm đúng số, không đoán thêm decoration.

### 1.2 Một thay đổi visual = một lý do layout

Mỗi lần sửa phải trả lời được:

1. **Phần tử nào** trong DOM tree?
2. **Thuộc tính nào** (padding, gap, sticky, height, overflow)?
3. **Hành vi scroll** thay đổi thế nào ở top, giữa trang, và **cuối trang**?

Nếu không mô tả được hành vi scroll → chưa hiểu bài.

### 1.3 Scope nhỏ, diff sạch

- Sửa classNames trước; đừng refactor component tree khi chưa cần.
- **Không** thêm abstraction “cho đẹp” (helper 3 dòng, wrapper vô nghĩa).
- **Không** đổi copy, API, fetch, test không liên quan.

### 1.4 Convention của repo > sáng tạo riêng

- Class layout đặt trong `classNames.ts` cạnh component.
- Dùng `cn()` từ `@heroui/react`.
- Dùng CSS variable có sẵn (`--max-height-rail`, `--spacing-rail`) thay vì magic number lặp lại.
- Comment ngắn giải thích **hành vi layout**, không giải thích Tailwind cơ bản.

---

## 2. Cách đọc feedback kiểu “thầy / user Việt”

| User nói | AI hiểu |
|----------|---------|
| `gap-3`, `xanh đỏ là gap-3` | Khoảng cách giữa hai khối (profile vs stats), không phải padding trong row |
| `xanh là border`, `bỏ border` | Bỏ `border-t` / separator; thay bằng spacing (`gap-4`) |
| `y chang layout màu xanh` | **Cùng rhythm** (padding row, gap stack), **không** bắt buộc cùng component (list vs div) |
| `không phải list, kiểu style` | Giữ semantics/div; chỉ mirror visual tokens |
| `full height`, `sát mép` | Kiểm tra sticky, rule, padding tầng layout — xem mục 4 |
| `kéo hết thì bị ntn` | Bug **ở cuối scroll** — bắt buộc QA scroll full page |
| `bên phải cũng py-6` | Cân **cùng vertical inset** giữa rail và main track |

**Quy tắc:** User chụp ảnh lần 2 = lần 1 **chưa đạt**. Đừng bảo “đã xong” nếu chưa scroll thử.

---

## 3. Tư duy composition (dashboard rail)

### 3.1 Phân tầng trách nhiệm

```
layout.tsx          → main landmark, padding ngoài cùng
DashboardPage frame → flex row: rail | rule | main
aside (rail)        → identity + stats + quick actions
rule                → separator dọc (chỉ visual / seam)
main track          → nội dung tab (overview, explore, …)
```

Mỗi tầng **một việc**. Đừng nhét sticky + max-height + card + separator vào cùng một block con.

### 3.2 Rail không phải card

Khi user muốn “flush”, “dính sát”, “bỏ card”:

- Bỏ `rounded`, `border`, `bg-gradient`, `SurfaceCard`.
- Padding đặt ở **vùng rail** (`px-3 py-6`), không lặp ở từng block con.
- Separator **giữa section** (identity ↔ quick actions) dùng `gap`, không `border-t` — trừ khi design yêu cầu divider.

### 3.3 Match style giữa hai vùng khác semantics

Ví dụ: stats rows vs quick-action list.

**Sai:** Copy nguyên `ListBox` cho stats.

**Đúng:**

1. Trích **token chung** (stack `gap-1`, item `px-2 py-2 rounded-large`).
2. List giữ thêm layer interactive (`hover`, `focus`, `cursor`).
3. Stats dùng `div` + cùng token, giữ recipe nội dung riêng (`peer` cho label/value).

Pattern:

```ts
// blocks/dashboard/classNames.ts — owner của rhythm rail
export const dashboardRailRowStackClassName = cn("flex", "flex-col", "gap-1", "p-0")
export const dashboardRailRowItemClassName = cn("flex", "items-center", "px-2", "py-2", ...)
```

---

## 4. Sticky, full height, scroll — phần AI hay làm sai

### 4.1 Ba khái niệm dễ lẫn

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **Cột rail cao bằng viewport** | Vùng nhìn thấy cố định chiều cao; nội dung ngắn → có thể trống |
| **Rule full height** | Đường phân cách dọc — nên gắn **viewport**, không kéo theo chiều cao document |
| **Rail scroll riêng** | Nội dung rail dài → `overflow-y-auto` bên trong vùng `max-h` |

### 4.2 Pattern đúng (desktop)

```ts
// Rail: sticky + self-start + max-h + overflow
lg:sticky lg:top-28 lg:self-start lg:max-h-[var(--max-height-rail)] lg:overflow-y-auto

// Rule: sticky + height viewport — KHÔNG self-stretch theo document
lg:sticky lg:top-28 lg:h-[var(--max-height-rail)] lg:self-start

// Frame: items-start — KHÔNG ép min-h full page nếu gây side effect
lg:flex-row lg:items-start
```

### 4.3 Anti-pattern đã gặp trong thực tế

| Làm | Hậu quả |
|-----|---------|
| `h-[100dvh-…]` cố định trên aside | Cột trái trống nửa màn hình khi nội dung ngắn |
| Rule `self-stretch` trong frame cao 3000px | Line chạy hết trang; scroll cuối trông “gãy” |
| `w-screen` + scrollbar | Overflow ngang, layout lệch |
| `py-6` main + `pb-6` layout | Double padding đáy khi scroll hết |
| `mx-auto` main trên desktop rộng | Khoảng trống lớn giữa rail và content |

### 4.4 QA bắt buộc sau mỗi lần chỉnh layout

1. **Top:** Rail và main thẳng hàng `pt`/`py`?
2. **Giữa trang:** Rail sticky còn đọc được? Main scroll mượt?
3. **Cuối trang:** Scroll tới block cuối (vd. Changelog) — còn cột trắng / line lạ / padding thừa?
4. **Rail dài:** Thu nhỏ viewport hoặc thêm item — rail scroll nội bộ, không đẩy cả page?

---

## 5. Quy trình làm việc AI nên follow

```
1. Đọc ảnh + câu user → ghi lại mapping (màu → vùng DOM)
2. Mở classNames.ts + component.tsx liên quan — KHÔNG đoán từ training data Next/React cũ
3. Sửa token nhỏ nhất (gap, border, padding, sticky)
4. Chạy test component spec liên quan (vd. DashboardPage/component.spec.tsx)
5. Mô tả cho user: thay đổi gì + hành vi scroll
6. Chờ ảnh lần 2 — lặp đến khi pass QA mục 4.4
```

### 5.1 Khi abstraction có sẵn không ăn

Trong case dashboard: `DashboardShell` grammar + grid override **không tin cậy**.

**Tư duy:** Nếu override `!important` / grid phức tạp vẫn lệch → **layout native** (flex trực tiếp ở page) là chấp nhận được, miễn giữ được design plan (rail leading, separator, main).

Đừng cố “dùng cho đủ grammar” khi product page cần hành vi pixel-perfect.

### 5.2 ESLint alias

Tránh:

```ts
export const quickActionsListClassName = dashboardRailRowStackClassName // lint fail
```

Dùng:

```ts
export const quickActionsListClassName = cn(dashboardRailRowStackClassName)
```

Hoặc import trực tiếp token gốc ở leaf component.

---

## 6. Checklist trước khi báo “xong”

- [ ] Đã map đúng vùng user khoanh (stats / quick actions / profile)?
- [ ] Border user muốn bỏ đã bỏ hết chưa?
- [ ] Gap/padding khớp **số user nói** (`gap-3` vs `gap-4`)?
- [ ] Hai vùng “cùng style” dùng **shared token**, không duplicate lệch một class?
- [ ] Scroll full page — đặc biệt **cuối trang**?
- [ ] Test spec pass?
- [ ] Diff không lan sang feature/copy/API khác?

---

## 7. Prompt mẫu cho thầy giao AI khác

```text
Bạn làm FE theo mindset.md của repo.

Task: [mô tả visual]
Ảnh: [đính kèm — đỏ/xanh là vùng nào]
Ràng buộc:
- Chỉ sửa layout/spacing/sticky; không đổi data layer
- classNames.ts colocated
- Dùng --max-height-rail nếu liên quan sticky rail
- Sau khi sửa: chạy vitest [path spec] và mô tả hành vi scroll top/giữa/cuối trang

Đừng báo xong nếu chưa giải thích được vì sao scroll cuối trang không bị gãy.
```

---

## 8. File map nhanh (dashboard rail)

| File | Vai trò |
|------|---------|
| `src/app/[lang]/dashboard/layout.tsx` | Padding ngoài `main` |
| `src/components/pages/DashboardPage/classNames.ts` | Frame, rail, rule, main track |
| `src/components/pages/DashboardPage/component.tsx` | Cây DOM dashboard |
| `src/components/blocks/dashboard/classNames.ts` | Token rail row dùng chung |
| `src/components/blocks/dashboard/IdentityRail/` | Profile + stats stack |
| `src/components/leaves/QuickActionsList/` | List interactive, cùng token row |
| `src/app/globals.css` | `--max-height-rail`, `--spacing-rail` |

---

## 9. Một câu tóm tắt cho AI

> **FE không phải “dán class cho giống Figma một lúc” — mà là chỉnh một cây layout có scroll, sticky và padding chồng tầng; mỗi class phải có lý do ở top, giữa và cuối trang.**

Thầy có thể dùng file này làm system prompt phụ, rule Cursor, hoặc handout cho học viên review diff AI.
