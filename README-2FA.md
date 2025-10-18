# Xác thực hai lớp (2FA) — Hướng dẫn (Tiếng Việt)

Tài liệu này mô tả trình tự và hướng dẫn kỹ thuật cho tính năng Xác thực hai lớp (2FA) đã được triển khai trong dự án.

Mục tiêu chính:

-   Triển khai 2FA theo mô hình hybrid: Auth0 đảm nhiệm 2FA cho người dùng đăng nhập bằng mạng xã hội (social), server quản lý TOTP cho tài khoản đăng ký trực tiếp (email/password).
-   Bảo mật bí mật 2FA (TOTP secret) khi lưu trữ: mã hóa AES-GCM.
-   Cung cấp mã khôi phục (recovery codes) dùng một lần, lưu hashed, hiển thị cho user 1 lần khi kích hoạt.
-   Hạn chế thử đoán mã (rate-limit / lockout) và lưu trạng thái số lần sai để phòng brute-force.

### Tổng quan luồng hoạt động

1. Người dùng (đã đăng nhập) yêu cầu `GET /api/v1/auth/2fa/setup` để lấy secret TOTP tạm và QR code.
    - Backend trả về secret (base32) và một data URL QR code để người dùng quét bằng app authenticator (Google Authenticator, Authy, v.v.).
2. Người dùng quét mã và nhập mã TOTP từ app, gửi `POST /api/v1/auth/2fa/verify` kèm `token` (TOTP) và `secret`.
    - Nếu hợp lệ, server sẽ:
        - Mã hóa `secret` bằng AES-256-GCM trước khi lưu vào DB.
        - Sinh một bộ mã khôi phục (ví dụ 10 mã), mỗi mã được hash (bcrypt) trước khi lưu vào DB.
        - Trả về danh sách mã khôi phục plaintext DUY NHẤT MỘT LẦN cho người dùng (user cần lưu lại an toàn).
        - Đánh dấu `two_factor_enabled = true` cho user.
3. Sau khi kích hoạt 2FA, khi người dùng đăng nhập bằng email/password, server sẽ kiểm tra:
    - Nếu user có `two_factor_enabled = true`, server KHÔNG cấp access token ngay mà trả về `require2fa: true` và một `tmpToken` (token tạm thời) sau bước xác thực password.
    - Client hiển thị giao diện yêu cầu mã TOTP hoặc mã khôi phục; client gọi `POST /api/v1/auth/login/2fa` với `tmpToken` và `token` (TOTP hoặc recovery code).
    - Server xác minh TOTP (hoặc so sánh recovery code bằng bcrypt). Nếu dùng mã khôi phục hợp lệ, mã đó sẽ bị huỷ (xóa) sau khi sử dụng.
    - Nếu xác minh thành công, server cấp access token / refresh token như bình thường.

### Các endpoints chính

-   GET /api/v1/auth/2fa/setup

    -   Auth required (user phải đã đăng nhập)
    -   Trả về: { secret: string (base32), qr: string (dataURL) }

-   POST /api/v1/auth/2fa/verify

    -   Body: { token: string, secret?: string }
    -   Mục đích: người dùng xác minh mã TOTP lần đầu để kích hoạt 2FA
    -   Hành động server:
        -   Xác thực token với secret
        -   Mã hoá secret bằng AES-GCM và lưu
        -   Sinh N mã khôi phục (ví dụ 10), hash (bcrypt) rồi lưu vào cột `two_factor_recovery_codes` (dạng JSON chứa mảng hash)
        -   Đặt `two_factor_enabled = true`
        -   Trả về `{ recovery_codes: string[] }` (plaintext) CHỈ MỘT LẦN

-   POST /api/v1/auth/2fa/disable

    -   Body: { token: string } hoặc { recovery_code: string }
    -   Yêu cầu xác thực bằng TOTP HOẶC mã khôi phục để tắt 2FA

-   POST /api/v1/auth/login

    -   Sau khi xác thực password, nếu user có 2FA bật, trả về `{ require2fa: true, tmpToken: '...' }` thay vì access token.

-   POST /api/v1/auth/login/2fa

    -   Body: { tmpToken: string, token: string }
    -   Xác minh token (TOTP) hoặc recovery code; cập nhật counters, xóa recovery code đã dùng.
    -   Nếu OK -> cấp access token / refresh token.

-   PUT /api/v1/auth/change-password
    -   Body: { oldPassword, newPassword }
    -   Chỉ cho phép với tài khoản local (không có `auth0_id`). Nếu user đăng ký qua social (Auth0), endpoint trả lỗi và UI nên ẩn chức năng này cho user social.

### Các thay đổi DB (migration)

-   Thêm các cột vào bảng `users`:
    -   `two_factor_recovery_codes` TEXT (lưu JSON mảng các hash của recovery codes)
    -   `two_factor_failed_count` INTEGER DEFAULT 0
    -   `two_factor_locked_until` DATETIME (nếu bị khoá tạm thời do nhiều lần sai)

Migration đã được thêm trong file: `src/db/migrations/20251018120000-add-2fa-columns-to-users.js` và áp dụng bằng script `scripts/apply-2fa-migration.js`.

### Biến môi trường cần thiết

-   TFA_ENCRYPTION_KEY — Khóa AES-256-GCM dùng để mã hóa/giải mã secret TOTP. Giá trị phải là base64 của 32 byte (256-bit). Ví dụ đã tạo trong dev: `TFA_ENCRYPTION_KEY=...`
-   REDIS_URL (tuỳ chọn) — nếu dùng Redis cho rate-limit/lockout.

Ghi chú: KHÔNG commit `TFA_ENCRYPTION_KEY` vào repo; phải lưu an toàn (Secrets Manager, Azure Key Vault, AWS Secrets Manager, v.v.) cho môi trường production và có kế hoạch xoay khóa (rotation).

### Bảo mật & cơ chế chống tấn công

-   Bí mật TOTP được mã hóa AES-GCM trước khi lưu vào DB -> bảo vệ nếu DB bị lộ.
-   Recovery codes chỉ được hiển thị 1 lần khi kích hoạt; server lưu hash (bcrypt) của từng code.
-   Hạn chế thử đoán mã: server lưu counters `two_factor_failed_count` và `two_factor_locked_until` (và có helper Redis `src/utils/2faRateLimit.js`) để khóa tạm thời account khi có nhiều lần thử sai.
-   Khi dùng recovery code, server sẽ xóa code đó (1 lần dùng).

### UI/Client notes

-   Khi user vào phần Settings -> Security, có thể bật/tắt 2FA.
-   Khi bật: client gọi `/2fa/setup` để lấy QR + secret, hiển thị QR để quét; sau đó gọi `/2fa/verify` để hoàn tất. Nếu thành công, server trả về danh sách mã khôi phục plaintext — client cần hiển thị và khuyến khích user lưu lại (tải xuống, copy, lưu chỗ an toàn).
-   Khi đăng nhập: nếu server trả về `require2fa:true` và `tmpToken`, client phải hiện màn yêu cầu mã TOTP hoặc recovery code và gọi `/login/2fa` để nhận access token.

### Kiểm thử (dev)

1. Thiết lập .env (thêm `TFA_ENCRYPTION_KEY`):

```powershell
# Generate random 32 bytes key and encode base64 (PowerShell):
[Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))

# Thêm vào .env:
TFA_ENCRYPTION_KEY=<base64-32-bytes>
```

2. Cài dependencies và chạy server:

```powershell
npm install
npm run dev
```

3. Áp dụng migration (nếu chưa áp dụng):

```powershell
# Chạy script migration (đã thêm vào project)
node scripts/apply-2fa-migration.js
```

4. Flow thủ công để test:
    - Đăng ký 1 user local (email/password) hoặc dùng user dev.
    - Đăng nhập (normal) và đi tới `/api/v1/auth/2fa/setup` để lấy QR + secret.
    - Quét QR trong Google Authenticator, nhập mã từ app và gọi `/api/v1/auth/2fa/verify`.
    - Lưu bộ recovery codes trả về.
    - Logout, đăng nhập lại bằng email/password — server sẽ trả `require2fa: true` + `tmpToken`.
    - Gửi `POST /api/v1/auth/login/2fa` với `tmpToken` + `token` (TOTP) hoặc recovery code.

### Lưu ý triển khai production

-   Bí mật mã hóa (`TFA_ENCRYPTION_KEY`) PHẢI được quản lý bởi secret manager; không lưu trong code hoặc repo.
-   Có kế hoạch xoay khóa (key rotation): khi đổi key, cần có script/migration để re-encrypt các secret cũ bằng key mới hoặc yêu cầu người dùng re-kích hoạt 2FA.
-   Triển khai Redis (hoặc store có thể chia sẻ) để lưu counters & lockout nếu hệ thống có nhiều instance backend.
-   Cân nhắc tích hợp alert/monitoring cho số lượng lần unlock/lockout bất thường.

### Tại sao chọn phương án hybrid?

-   Auth0 (hoặc các provider social) thường cung cấp MFA tích hợp; giữ nguyên những user social do provider quản lý giúp đơn giản hoá và tránh trùng trách nhiệm xác thực.
-   Người dùng đăng ký trực tiếp (local) cần server-side 2FA để không phụ thuộc bên thứ ba và để có khả năng khôi phục (recovery codes) theo chính sách của hệ thống.

### Tệp liên quan trong repo

-   `src/controller/auth.controller.js` — logic 2FA (setup, verify, disable, login/2fa)
-   `src/utils/crypto.js` — helper AES-GCM encrypt/decrypt
-   `src/utils/2faRateLimit.js` — helper Redis cho khóa & đếm lỗi
-   `src/db/migrations/20251018120000-add-2fa-columns-to-users.js` — migration
-   `scripts/apply-2fa-migration.js` — script áp dụng migration (dùng QueryInterface trực tiếp)
-   `scripts/test-2fa-e2e.js` — script kiểm thử end-to-end (dev)

### Kết luận

Tài liệu này tóm tắt thiết kế và cách vận hành 2FA đã triển khai. Nếu bạn cần, tôi có thể:

-   Thêm bài kiểm thử tích hợp (integration tests) cho luồng 2FA.
-   Thêm script re-encrypt khi xoay khóa.
-   Viết hướng dẫn triển khai cụ thể cho production (ví dụ Azure Key Vault, AWS Secrets Manager, Redis setup).

---

Phiên bản tài liệu: 2025-10-18
