import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Chào buổi sáng/ })).toBeVisible();
});

test("dữ liệu mẫu và tất cả màn hình chính hiển thị không lỗi", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && !message.text().includes("favicon")) errors.push(message.text());
  });

  const screens = [
    ["Thói quen", "Thói quen của tôi"],
    ["Lịch", "Lịch thói quen"],
    ["Báo cáo", "Báo cáo"],
    ["Thống kê", "Thống kê"],
    ["Mục tiêu", "Mục tiêu của tôi"],
    ["Thành tựu", "Thành tựu của tôi"],
    ["Ghi chú", "Ghi chú"],
    ["Cài đặt", "Cài đặt"]
  ];

  for (const [nav, heading] of screens) {
    await page.locator("aside nav").getByRole("button", { name: nav, exact: true }).click();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }

  await page.locator("aside nav").getByRole("button", { name: "Thói quen", exact: true }).click();
  await expect(page.locator(".habit-card")).toHaveCount(10);
  expect(errors).toEqual([]);
});

test("tìm kiếm, thêm thói quen và lưu qua lần tải lại", async ({ page }) => {
  const search = page.getByPlaceholder("Tìm thói quen...");
  await search.fill("Uống 2 lít nước");
  await search.press("Enter");
  await expect(page.locator(".habit-card")).toHaveCount(1);

  await search.fill("");
  await page.getByRole("button", { name: /Thêm thói quen/ }).first().click();
  await page.getByPlaceholder("Ví dụ: Đọc sách 20 trang").fill("Chạy bộ 15 phút");
  await page.getByRole("button", { name: /Lưu thói quen/ }).click();
  await expect(page.getByText("Chạy bộ 15 phút", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Chạy bộ 15 phút", { exact: true })).toBeVisible();
});

test("thêm mục tiêu và ghi chú mẫu hoạt động", async ({ page }) => {
  await page.locator("aside nav").getByRole("button", { name: "Mục tiêu", exact: true }).click();
  await page.getByRole("button", { name: /Thêm mục tiêu/ }).click();
  await page.getByPlaceholder("Ví dụ: Chạy 100km trong tháng").fill("Thiền đủ 30 ngày");
  await page.getByRole("button", { name: "Tạo mục tiêu", exact: true }).click();
  await expect(page.getByText("Thiền đủ 30 ngày", { exact: true })).toBeVisible();

  await page.locator("aside nav").getByRole("button", { name: "Ghi chú", exact: true }).click();
  await expect(page.locator(".note-card")).toHaveCount(3);
  await page.getByRole("button", { name: /Tạo ghi chú/ }).click();
  await page.getByPlaceholder("Tiêu đề ghi chú").fill("Ghi chú kiểm thử");
  await page.getByPlaceholder("Viết điều bạn muốn ghi nhớ...").fill("Luồng thêm ghi chú hoạt động.");
  await page.getByRole("button", { name: "Lưu ghi chú" }).click();
  await expect(page.getByText("Ghi chú kiểm thử", { exact: true })).toBeVisible();
});

test("xóa thói quen và giữ trạng thái sau khi tải lại", async ({ page }) => {
  await page.locator("aside nav").getByRole("button", { name: "Thói quen", exact: true }).click();
  await expect(page.locator(".habit-card")).toHaveCount(10);
  await page.getByRole("button", { name: "Tùy chọn Uống 2 lít nước" }).click();
  await page.getByRole("button", { name: "Xóa thói quen" }).click();
  await expect(page.getByRole("heading", { name: "Xóa thói quen?" })).toBeVisible();
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await expect(page.locator(".habit-card")).toHaveCount(9);
  await expect(page.getByText("Uống 2 lít nước", { exact: true })).toHaveCount(0);
  await page.reload();
  await page.locator("aside nav").getByRole("button", { name: "Thói quen", exact: true }).click();
  await expect(page.locator(".habit-card")).toHaveCount(9);
  await expect(page.getByText("Uống 2 lít nước", { exact: true })).toHaveCount(0);
});

test("giao diện di động điều hướng được và không tràn trang", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở menu" }).click();
  await expect(page.locator("aside")).toHaveClass(/open/);
  await page.locator("aside nav").getByRole("button", { name: "Lịch", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lịch thói quen" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
