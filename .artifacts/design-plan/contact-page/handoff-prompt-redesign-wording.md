# Prompt bàn giao — redesign + wording trang `/contact`

Dán nguyên khối dưới đây cho ChatGPT. Nó tự chứa: không cần đọc repo.

---

Bạn là designer sản phẩm kiêm biên tập viên tiếng Việt cho **StarCi Academy** — nền tảng học lập
trình do **một người duy nhất** dựng nên. Toàn bộ giọng sản phẩm dựa trên sự thật đó: người học nhắn
tin là tới thẳng người làm ra nó, không qua bộ phận hỗ trợ nào.

Tôi cần bạn làm **hai việc** cho trang `/contact`:

1. **Redesign** — đề xuất cách sắp xếp và phân cấp tốt hơn.
2. **Wording** — viết lại toàn bộ chuỗi tiếng Việt.

## Sự thật cứng — KHÔNG được bịa, không được đổi

| Dữ kiện | Giá trị |
|---|---|
| Founder | Stacy Nguyen |
| Email | cuongnvtse160875@gmail.com |
| Điện thoại / Zalo | 0828678897 |
| Facebook | facebook.com/starci183 |
| LinkedIn | in/stacy-nguyen |
| Giờ hỗ trợ | T2–T6, 9:00–18:00 |
| Cam kết phản hồi | trong vòng 24 giờ |

Không thêm hotline, không thêm văn phòng, không thêm email thứ hai, không thêm "đội ngũ hỗ trợ".
Chỉ có một người.

## Ràng buộc kỹ thuật — thiết kế phải nằm vừa trong đây

**Trang phục vụ HAI loại người đọc, và chỉ hiện MỘT bề mặt viết tại một thời điểm:**

- **Khách chưa đăng nhập** → form gửi tin. Backend nhận đúng 4 trường: `name`, `email`,
  `category`, `message`. `category` là 3 lựa chọn đóng: hỗ trợ khoá học / hợp tác / câu hỏi chung.
  Không thêm trường nào khác — server không nhận.
- **Học viên đã đăng nhập** → hội thoại riêng với founder, có lịch sử tin nhắn, có ô soạn tin.
  Backend đã có sẵn. Hội thoại KHÔNG có trường `category`.

**Bốn kênh liên hệ (Zalo, Email, Facebook, LinkedIn) nằm phía trên bề mặt viết** và luôn hiển thị ở
cả hai loại người đọc. Lý do: chúng không phụ thuộc vào bất kỳ request nào — kể cả khi mọi thứ khác
lỗi, người đọc vẫn bấm được. Nếu bạn muốn đổi vị trí này, phải nêu lý do thắng được lý do trên.

**Mọi trạng thái phải có chữ.** Đừng chỉ thiết kế trạng thái đẹp:

- Form: trống · sai dữ liệu · đang gửi · đã gửi · gửi hỏng
- Hội thoại: đang tải · chưa có tin nào · có tin · đang gửi · tin gửi hỏng · không đọc được hội thoại

## Bố cục hiện tại (điểm xuất phát, không phải điều phải giữ)

```
Breadcrumb: Trang chủ › Liên hệ
H1: Liên hệ
   câu mời
   dòng thời gian phản hồi (nhỏ, mờ)

[ Zalo ] [ Email ] [ Facebook ] [ LinkedIn ]     ← 4 thẻ ngang, mỗi thẻ: logo / tên / địa chỉ thật

┌─ một thẻ duy nhất ─────────────────────┐
│  khách:      form 4 trường + nút gửi    │
│  đăng nhập:  tên founder + luồng chat   │
│              + ô soạn tin               │
└─────────────────────────────────────────┘
```

## Chuỗi hiện tại — viết lại toàn bộ

Giữ nguyên KEY, chỉ đổi phần chữ.

| key | hiện tại |
|---|---|
| `navHome` | Trang chủ |
| `navContact` | Liên hệ |
| `title` | Liên hệ |
| `intro` | StarCi do một người dựng nên, nên câu hỏi của bạn tới thẳng người làm ra nó. Chọn cách liên hệ nhanh nhất bên dưới, hoặc gửi tin nhắn. |
| `responseTime` | Thường phản hồi trong vòng 24 giờ (giờ hỗ trợ T2–T6, 9:00–18:00). |
| `form.name` | Họ tên |
| `form.namePlaceholder` | Nguyễn Văn A |
| `form.email` | Email |
| `form.emailPlaceholder` | ban@email.com |
| `form.category` | Lý do liên hệ |
| `form.message` | Nội dung |
| `form.messagePlaceholder` | Chúng tôi có thể giúp gì cho bạn? |
| `form.submit` | Gửi tin nhắn |
| `form.submitting` | Đang gửi… |
| `categories.course_support` | Hỗ trợ khoá học / tài khoản |
| `categories.partnership` | Hợp tác / tuyển dụng |
| `categories.general` | Câu hỏi chung |
| `refusals.name` | Vui lòng nhập họ tên. |
| `refusals.email` | Email không hợp lệ. |
| `refusals.message` | Vui lòng nhập nội dung. |
| `submitted.message` | Đã gửi! |
| `submitted.description` | Cảm ơn bạn. Chúng tôi sẽ phản hồi qua email sớm nhất có thể. |
| `submitted.action` | Gửi tin khác |
| `failed.message` | Không gửi được tin nhắn. Vui lòng thử lại. |
| `failed.action` | Gửi tin nhắn |
| `founderRole` | Founder · StarCi Academy |
| `statusLabel` | Thường trả lời trong 24 giờ |
| `composerPlaceholder` | Viết tin nhắn… |
| `send` | Gửi |
| `sending` | Đang gửi… |
| `retry` | Gửi lại |
| `empty.message` | Chưa có tin nhắn nào. |
| `empty.description` | Viết dòng đầu tiên bên dưới — tin nhắn tới thẳng founder. |
| `threadFailed.message` | Không đọc được cuộc trò chuyện. |
| `threadFailed.description` | Bốn kênh phía trên vẫn hoạt động bình thường. |
| `threadFailed.action` | Thử lại |
| kênh Zalo | Zalo · 0828678897 |
| kênh Email | Email · cuongnvtse160875@gmail.com |
| kênh Facebook | Facebook · facebook.com/starci183 |
| kênh LinkedIn | LinkedIn · in/stacy-nguyen |

## Vấn đề tôi tự thấy — bạn không bắt buộc đồng ý

- `intro` và `responseTime` nói hai lần về việc "phản hồi nhanh", hơi thừa.
- `form.messagePlaceholder` xưng "Chúng tôi" trong khi cả trang nói StarCi chỉ có một người. Xưng hô
  đang không nhất quán: chỗ "chúng tôi", chỗ "founder".
- `submitted.description` cũng xưng "Chúng tôi".
- `failed.message` nói hai câu ("Không gửi được" + "Vui lòng thử lại") trong khi ngay dưới đã có nút
  ghi "Gửi tin nhắn" — lặp.
- 4 kênh đang hiện địa chỉ thô (`in/stacy-nguyen`) — đọc hơi kỹ thuật.
- Chưa có gì nói cho khách biết rằng đăng nhập thì được nhắn thẳng founder có lịch sử.

## Việc cần giao lại

**1. Redesign** — đưa 2–3 phương án phân cấp khác nhau. Mỗi phương án nói rõ:
   - thứ tự đọc và vì sao
   - hành động chính là gì
   - cái gì bị hạ cấp, và đánh đổi ra sao
   - hoạt động thế nào trên mobile một cột

**2. Wording** — bảng đầy đủ, cột `key` giữ nguyên, cột chữ mới. Kèm một đoạn ngắn nói bạn đã chốt
giọng và cách xưng hô nào, và vì sao.

**Quy tắc viết:**
- Tiếng Việt tự nhiên, không dịch máy, không sáo rỗng kiểu "Chúng tôi luôn sẵn sàng lắng nghe".
- Chọn MỘT cách xưng hô rồi giữ suốt trang.
- Thông báo lỗi nói người đọc cần làm gì, không đổ lỗi cho họ.
- Nút ghi hành động cụ thể, không ghi "Gửi" trống nghĩa nếu chỗ đó cần rõ hơn.
- Placeholder là ví dụ, không phải hướng dẫn.
- Không hứa điều sự thật cứng không cho phép (không hứa "phản hồi ngay", không hứa hỗ trợ 24/7).

**Định dạng trả về:** phần redesign trước, phần bảng chữ sau. Không viết code, không đề xuất
component — tôi chỉ cần quyết định thiết kế và câu chữ.
