import { test, expect } from '@playwright/test';

test.describe('QA Playground — E2E Flow', () => {

  test('TC-01: Xác minh thông tin Superhero trong Dynamic Table', async ({ page }) => {
    // 1. Điều hướng đến trang Dynamic Table
    await page.goto('/apps/dynamic-table/');
    await expect(page.locator('table')).toBeVisible();

    // 2. Bảng xáo trộn thứ tự hàng ngẫu nhiên mỗi lần load — không thể dùng
    //    nth(N) cố định. Dùng filter({ hasText }) để tìm theo nội dung text,
    //    bất kể hàng đó đứng ở vị trí nào trong bảng.
    const heroes = ['Captain America', 'Spider-Man', 'Iron Man', 'Hulk'];
    for (const hero of heroes) {
      await expect(page.locator('tbody tr').filter({ hasText: hero })).toBeVisible();
    }
  });

  test('TC-02: Tăng tốc Progress Bar và xác nhận kết quả', async ({ page }) => {
    // 1. Điều hướng đến trang Shadow DOM
    await page.goto('/apps/shadow-dom/');

    const progressBar = page.locator('progress-bar');
    await expect(progressBar).toBeVisible();

    // 2. Kiểm tra giá trị ban đầu bằng web-first assertion (tự động đợi attribute sẵn sàng)
    await expect(progressBar).toHaveAttribute('percent', '5');

    // 3. Click Boost để tăng progress
    await page.getByRole('button', { name: /boost/i }).click();

    // 4. toHaveAttribute tự động retry cho đến khi animation hoàn tất.
    //    getAttribute() đọc DOM ngay lập tức — attribute chưa kịp cập nhật
    //    sau animation bất đồng bộ, gây ra race condition.
    await expect(progressBar).toHaveAttribute('percent', '95', { timeout: 15000 });
  });

  test('TC-03: Thêm mục chi tiêu và xác nhận ngày ghi nhận', async ({ page }) => {
    // 1. Điều hướng đến trang Budget Tracker
    await page.goto('/apps/budget-tracker/');
    await expect(page.locator('table.budget-tracker')).toBeVisible();

    // 2. Tạo ngày hôm nay động — không hardcode ngày cụ thể vì sẽ fail mỗi ngày khác.
    //    input[type="date"] lưu và trả về giá trị theo định dạng YYYY-MM-DD.
    const today = new Date();
    const expectedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // 3. Mở form nhập liệu mới bằng accessible role locator
    await page.getByRole('button', { name: 'New Entry', exact: true }).click();

    // 4. Điền thông tin vào hàng mới (hàng cuối cùng trong tbody.entries)
    const newRow = page.locator('tbody.entries tr').last();
    await newRow.getByPlaceholder('Add a Description (e.g. wages, bills, etc.)').fill('Ăn trưa');
    await newRow.getByRole('combobox').selectOption('expense');
    await newRow.locator('input[type="number"]').fill('50000');

    // 5. Xác nhận ngày được tự động điền là ngày hôm nay bằng web-first assertion
    await expect(newRow.locator('input[type="date"]')).toHaveValue(expectedDate);
  });
});
