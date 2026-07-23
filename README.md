# WorkNest Playwright Test Suite (E2E + API + Visual)

> Đồ án tốt nghiệp — Khóa học Automation Testing với Playwright + TypeScript (CO-WELL Asia Academy).

Bộ kiểm thử tự động cho ứng dụng **WorkNest** (Company Internal Portal) chạy trực tiếp trên
môi trường Netlify. Suite gồm **20 test case** (12 E2E + 3 data-driven + 3 API + 2 Visual),
áp dụng Page Object Model, `storageState` (RBAC 3 role), Allure Report, và data-driven testing.

---

## 1. Thông tin học viên

| Mục | Nội dung |
|-----|----------|
| Họ tên | Nguyễn Phương Nga |
| MSSV | N/A |
| Lớp | Playwright cowell |
| Ứng dụng mục tiêu | WorkNest — https://worknest-site.netlify.app/ |
| Repo | https://github.com/PhuongNgaNunna/playwright |
| Video demo | _[Điền link YouTube unlisted / Google Drive, 2–4 phút]_ |

## 2. Mô tả đồ án

WorkNest là cổng nội bộ công ty mô phỏng hệ thống HR (Next.js 16 + TypeScript + JWT). Đồ án xây
dựng framework kiểm thử tự động cho 5 module cốt lõi (Authentication, Dashboard, Employees, Leave,
Tasks) trên 3 loại kiểm thử: **E2E** (UI theo POM), **API** (`request` context) và **Visual**
(`toHaveScreenshot` + mask). Suite dùng `storageState` để mỗi role chỉ đăng nhập thật 1 lần rồi tái
sử dụng phiên cho toàn bộ 36 lượt chạy E2E, tối ưu tốc độ. Báo cáo chính thức là **Allure Report**
với step-tree, categories, environment và attachment khi fail.

## 3. Yêu cầu môi trường

| Thành phần | Phiên bản |
|-----------|-----------|
| Node.js | >= 20 LTS |
| Playwright | >= 1.48 (dự án dùng 1.61) |
| allure-playwright | >= 3.0 |
| Java (JRE) | >= 8 — **chỉ cần khi generate/mở Allure HTML report** (`allure` CLI dùng Java) |

## 4. Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Cài trình duyệt Chromium cho Playwright
npx playwright install chromium
```

> Java để xem Allure report: macOS `brew install openjdk` · Ubuntu `sudo apt install default-jre` · Windows: cài Temurin JRE.

## 5. Hướng dẫn chạy test

```bash
# Chạy toàn bộ 6 project (E2E 3 role + API + Visual)
npm test

# Chỉ E2E (3 role)
npm run test:e2e

# Chỉ API
npm run test:api

# Chỉ Visual
npm run test:visual

# Chạy có giao diện trình duyệt
npm run test:headed

# Cập nhật lại Visual baseline (khi UI thay đổi hợp lệ)
npm run test:update-snapshots

# Chạy như CI (bỏ Visual vì baseline phụ thuộc OS)
npm run test:ci
```

## 6. Xem Allure Report

```bash
# Sinh report tĩnh vào reports/allure-report
npm run allure:generate

# Mở report vừa sinh (cần Java)
npm run allure:open

# Hoặc serve trực tiếp từ results
npm run allure:serve
```

Report được cấu hình với `resultsDir`, `environmentInfo` (BASE_URL, Node version, OS), `categories.json`
(phân tách **Product Defects** / **Auto Test Defects**), và mỗi test gắn label `module` + `severity`
+ tag (`@smoke` / `@regression`). Step-tree sinh tự động từ `test.step()`; screenshot/video/trace
auto-attach khi fail.

## 7. Danh sách test case (20)

| Nhóm | Test case |
|------|-----------|
| **E2E (12)** | AUTH-01, AUTH-02, AUTH-04, DASH-01, DASH-02, EMP-01, EMP-02, EMP-05, LEAVE-01, LEAVE-04, TASK-01, TASK-04 |
| **Data-driven (3)** | DD-AUTH × {admin, manager, employee} |
| **API (3)** | API-01 (POST /login → JWT), API-02 (GET /me không token → 401), API-04 (GET /employees) |
| **Visual (2)** | VIS-01 (Login), VIS-02 (Dashboard admin, mask phần tử động) |
| **Bonus** | A11Y-01 (axe-core trên Dashboard) |

Mỗi test case chạy trên 3 role project (`admin-chromium`, `manager-chromium`, `employee-chromium`)
= 36 lượt E2E, trong đó **DASH-02** chỉ áp dụng role `employee` (skip ở admin/manager).

## 8. Bảng kết quả chạy cuối cùng

Chạy `npm test` — kết quả ổn định qua **3 lần chạy liên tiếp** (100% pass, 0 flaky):

| Project | Passed | Skipped | Failed |
|---------|:------:|:-------:|:------:|
| setup | 3 | 0 | 0 |
| admin-chromium (E2E + data-driven + a11y) | 15 | 1 | 0 |
| manager-chromium (E2E) | 11 | 1 | 0 |
| employee-chromium (E2E) | 12 | 0 | 0 |
| api-project | 3 | 0 | 0 |
| visual-admin-chromium | 2 | 0 | 0 |
| **TỔNG** | **46** | **2** | **0** |

- Tổng test: **48** · Pass: **46** · Skip: **2** (DASH-02 ở admin/manager) · Fail: **0**
- Thời gian: ~50–58 giây · Pass rate: **100%** (đạt yêu cầu ≥ 95%).

> 2 skip là chủ đích thiết kế (DASH-02 là test role-specific), không phải lỗi.

## 9. Cấu trúc thư mục

```
worknest-playwright-lite/
├── package.json
├── playwright.config.ts          # 6 projects: setup, 3 role, api, visual
├── tsconfig.json                 # TypeScript strict mode
├── README.md
├── .github/workflows/playwright.yml   # CI (bonus)
├── reports/
│   └── categories.json           # Allure error categories (committed)
├── src/
│   ├── api/WorkNestAPI.ts         # API helper (request context)
│   ├── data/{users.json, users.ts, test-data.ts}
│   ├── fixtures/base-fixtures.ts  # inject page objects + apiClient
│   ├── pages/                     # POM: BasePage + 5 child pages
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── EmployeesPage.ts
│   │   ├── LeavePage.ts
│   │   └── TasksPage.ts
│   ├── types/index.ts
│   └── utils/{VisualCompare.ts, allure.ts}
└── tests/
    ├── setup/auth.setup.ts        # storageState per role
    ├── e2e/{auth, auth-data-driven, dashboard, employees, leave, tasks}.spec.ts
    ├── api/api.spec.ts
    ├── a11y/a11y.spec.ts          # bonus axe-core
    └── visual/{visual.spec.ts, visual.spec.ts-snapshots/}
```

## 10. Điểm kỹ thuật nổi bật

- **POM kế thừa:** `BasePage` trừu tượng hóa navigation/wait/logout + chrome chung; locator được
  đóng gói private trong từng page (truy cập qua getter).
- **storageState:** `auth.setup.ts` login 3 role 1 lần, lưu `.auth/<role>.json`; các role project
  nạp lại phiên → 36+ test chỉ cần 3 lần login thật.
- **Fixtures:** inject sẵn `loginPage`, `dashboardPage`, `employeesPage`, `leavePage`, `tasksPage`,
  `apiClient` vào mọi test.
- **Locator chuẩn:** ưu tiên `getByTestId` / `getByRole` / `getByText`; không dùng CSS/XPath fragile.
- **Web-first assertions:** `toBeVisible`, `toHaveURL`, `toHaveCount`, `toHaveScreenshot`; `waitForTimeout`
  chỉ dùng cho animation modal (~300ms) và có comment giải thích.
- **test.step():** 100% test case chia bước → Allure step-tree.
- **Data-driven:** đọc `src/data/users.json`, loop 3 role.
- **Visual:** `maxDiffPixelRatio: 0.1`, `animations: 'disabled'`, mask phần tử động (stat số,
  recent activity, meeting, notification, search).

## 11. Bonus đã thực hiện

- ✅ **CI/CD GitHub Actions** (`.github/workflows/playwright.yml`): chạy test trên push/PR, upload
  artifact Allure + Playwright HTML report. *(Visual bị loại trên CI vì baseline phụ thuộc OS.)*
- ✅ **Accessibility** (`@axe-core/playwright`): quét WCAG 2A/2AA trên Dashboard (A11Y-01).
- ✅ **Thêm test case bonus:** DD-AUTH (3 role) và A11Y-01 ngoài 20 TC bắt buộc.

## 12. Chuẩn bị bảo vệ (Q&A gợi ý)

- **Vì sao dùng `getByTestId` thay CSS?** — `data-testid` ổn định qua thay đổi style/layout, không vỡ khi refactor UI.
- **`storageState` hoạt động thế nào?** — Lưu cookie + localStorage (JWT) sau login vào file JSON; project nạp lại → bỏ qua bước login, nhanh hơn nhiều so với login mỗi test.
- **Vì sao LEAVE-04 assert `toast-success`?** — POST `/api/leave` thành công → app hiển thị toast; đây là bằng chứng hành vi thực tế của happy path.
- **API-02 trả 401 assert thế nào?** — Gọi `/api/auth/me` không header Authorization → `response.status()` = 401, body `error` khớp `/unauthorized|token|auth/i`.
- **VIS-02 mask gì & vì sao?** — Mask stat số, recent activity, upcoming meetings, notification, search vì chúng thay đổi mỗi lần chạy → tránh flaky.
- **Vì sao 3 role cùng chạy 12 E2E?** — Verify RBAC dưới cả 3 role; `storageState` khiến việc này rẻ; phát hiện bug role-specific (DASH-02).

---

*Ứng dụng đích do CO-WELL Asia cung cấp. Toàn bộ code test do học viên tự viết.*
