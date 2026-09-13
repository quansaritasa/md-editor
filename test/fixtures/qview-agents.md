# Rules for AI — qview

Rule chung nằm ở `~/.claude/CLAUDE.md` — global, tự nạp cho mọi repo. Đừng chép
lại vào đây; sửa rule chung thì sửa ở đó.

File này chỉ giữ thứ **riêng** của repo `qview`.

## Override rule chung

| Shortcut | Action | Vì sao khác global |
|---|---|---|
| `cote` | `cote "<entry>" "<commit msg>"` — **hai** tham số, không phải một. Việc nội bộ thì `cote -n "<commit msg>"` | Repo này có `CHANGELOG.md`, nên `cote` đòi thêm entry. Đừng bịa entry cho commit người dùng không thấy — dùng `-n` |

## `CHANGELOG.md` — viết cho người dùng, không cho lập trình viên

Mỗi entry là **một dòng, tối đa 30 từ**, tả thứ người dùng nhìn thấy hoặc làm được.
Không tên file, hàm, biến, CSS, regex, số đo ms. Chi tiết kỹ thuật thuộc về
commit message — ai cần thì đọc `git log`.

File là **danh sách phẳng, mới nhất trên cùng** — không tiêu đề, không mục
`## Unreleased`, không nhóm theo version. `cote` chèn thẳng vào dòng đầu; thêm
heading vào sẽ khiến entry sau lọt lên trên nó.

Chỉ được nhắc tên khi người dùng thật sự thấy nó trên màn hình: nhãn menu,
tên setting, phím tắt, định dạng file.

| Nên | Không nên |
|---|---|
| Nói cái gì đổi từ góc nhìn người dùng | Kể cách sửa |
| Bắt đầu bằng tính năng hoặc động từ | Bắt đầu bằng tên file |
| Một câu | Một đoạn |

Ví dụ — cùng một thay đổi:

- ❌ `Content search stops normalizing every candidate file's full text. Making the 🗂 content search fuzzy on punctuation put normalizeSearch(text) inside the per-file loop, which allocated two whole copies of every candidate — up to the 2 MB CONTENT_MAX_BYTES ceiling each — ... 0.6 ms worst case`
- ✅ `Content search no longer lags while you type in large folders.`

- ❌ `sanitizeChapterHtml() (epublinks.js) used to leave a chapter's <img src="cover.jpg"> as real HTML; the moment that string became DOM, Chromium eagerly fetched it against index.html's location ...`
- ✅ `EPUB images now load reliably, including ones that use srcset or unquoted paths.`

- ❌ `The swap is pure CSS order on #app-row — each panel keeps its id, its saved width key and its own resizer — so no other part of the app has to know the tree moved ...`
- ✅ `Settings → Layout: "Swap the side panels" moves the file tree to the right and the outline to the left.`

## `cote` — kỷ luật tiết kiệm token

Mỗi tool call gửi lại toàn bộ conversation, nên số call mới là thứ tốn tiền —
không phải độ dài lệnh. `cote` phải gói trọn trong **1–2 Bash call**.

| Tình huống | Làm gì | Số call |
|---|---|---|
| Vừa làm việc trong session này (đã biết đổi gì) | `cote "<entry>" "<commit msg>"` | 1 |
| Cold start / không rõ đổi gì | `cote peek` rồi `cote` | 2 |
| Commit không có gì để nói với người dùng (tooling, CI, sửa docs) | `cote -n "<commit msg>"` | 1 |

`cote` nằm trên PATH (`~/.local/bin/cote`) và dùng chung cho mọi repo.
`scripts/cote.sh` trong repo giờ chỉ là forwarder — gọi cách nào cũng được.

Cấm:

- Chạy `git diff` không có `--stat`. Diff thô vào context, dùng một lần rồi bỏ.
- `Read` / `Edit` `CHANGELOG.md`. Script tự chèn entry lên **dòng đầu file**,
  và tự thêm dấu `- ` — đừng tự gõ bullet vào entry.
- Verify sau commit bằng `git log` / `git status`. Lệnh fail thì Bash đã báo lỗi;
  `ship` tự in một dòng `git log --oneline -1` là đủ.
- Tách `git add`, `git commit`, `git push` thành nhiều call.

Commit message truyền vào `cote` phải giữ nguyên hai dòng trailer
`Co-Authored-By:` và `Claude-Session:` như các commit trước trong repo.
