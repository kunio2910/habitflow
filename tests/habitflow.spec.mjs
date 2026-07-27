import { test, expect } from "@playwright/test";

const today=new Date();
const tomorrow=new Date(today);
tomorrow.setDate(today.getDate()+1);
const dayLabel=date=>new Intl.DateTimeFormat("vi-VN",{day:"numeric",month:"long"}).format(date);
const fullDateLabel=date=>new Intl.DateTimeFormat("vi-VN",{day:"numeric",month:"long",year:"numeric"}).format(date);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Chào buổi (sáng|chiều|tối)/ })).toBeVisible();
  await expect(page.locator(".app")).toHaveAttribute("data-hydrated", "true");
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

test("chỉnh sửa thói quen và lưu thay đổi", async ({ page }) => {
  await page.locator("aside nav").getByRole("button", { name: "Thói quen", exact: true }).click();
  await page.getByRole("button", { name: "Tùy chọn Uống 2 lít nước" }).click();
  await page.getByRole("button", { name: "Chỉnh sửa", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Chỉnh sửa thói quen", exact: true })).toBeVisible();
  const nameInput=page.getByPlaceholder("Ví dụ: Đọc sách 20 trang");
  await nameInput.fill("Uống 3 lít nước");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.getByText("Uống 3 lít nước", { exact: true })).toBeVisible();
  await page.reload();
  await page.locator("aside nav").getByRole("button", { name: "Thói quen", exact: true }).click();
  await expect(page.getByText("Uống 3 lít nước", { exact: true })).toBeVisible();
});

test("chỉnh sửa và xóa mục tiêu", async ({ page }) => {
  await page.locator("aside nav").getByRole("button", { name: "Mục tiêu", exact: true }).click();
  await page.getByRole("button", { name: "Tùy chọn mục tiêu Đọc 12 cuốn sách trong năm" }).click();
  await page.getByRole("button", { name: "Chỉnh sửa", exact: true }).click();
  const goalInput=page.getByPlaceholder("Ví dụ: Chạy 100km trong tháng");
  await goalInput.fill("Đọc 15 cuốn sách trong năm");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.getByText("Đọc 15 cuốn sách trong năm", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tùy chọn mục tiêu Đọc 15 cuốn sách trong năm" }).click();
  await page.getByRole("button", { name: "Xóa mục tiêu", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Xóa mục tiêu?" })).toBeVisible();
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await expect(page.locator(".goal-card")).toHaveCount(4);
  await page.reload();
  await page.locator("aside nav").getByRole("button", { name: "Mục tiêu", exact: true }).click();
  await expect(page.locator(".goal-card")).toHaveCount(4);
});

test("chỉnh sửa ghi chú và lưu qua reload", async ({ page }) => {
  await page.locator("aside nav").getByRole("button", { name: "Ghi chú", exact: true }).click();
  await page.getByRole("button", { name: "Chỉnh sửa ghi chú Điều mình biết ơn hôm nay" }).click();
  await page.getByPlaceholder("Tiêu đề ghi chú").fill("Điều tuyệt vời hôm nay");
  await page.getByPlaceholder("Viết điều bạn muốn ghi nhớ...").fill("Đã hoàn thành toàn bộ kế hoạch buổi sáng.");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.getByText("Điều tuyệt vời hôm nay", { exact: true })).toBeVisible();
  await page.reload();
  await page.locator("aside nav").getByRole("button", { name: "Ghi chú", exact: true }).click();
  await expect(page.getByText("Điều tuyệt vời hôm nay", { exact: true })).toBeVisible();
});

test("giao diện tối được ghi nhớ", async ({ page }) => {
  await page.locator("aside nav").getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page.getByRole("button", { name: "Chuyển tối" }).click();
  await expect(page.locator("body")).toHaveClass(/dark-mode/);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/dark-mode/);

});

test("ngày chưa có dữ liệu không tự động hiển thị hoàn thành", async ({ page }) => {
  await page.getByRole("button", { name: `Xem thói quen hoàn thành ${dayLabel(tomorrow)}` }).click();
  await expect(page.getByRole("heading", { name: fullDateLabel(tomorrow) })).toBeVisible();
  await expect(page.locator(".completed-list")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Chưa có thói quen hoàn thành" })).toBeVisible();
});

test("lịch ngày phản ánh đúng thao tác hoàn thành và bỏ hoàn thành", async ({ page }) => {
  await page.getByRole("button", { name: "Cập nhật tiến độ Viết nhật ký" }).click();
  await page.getByLabel("Phần trăm tiến độ").fill("100");
  await page.getByRole("button", { name: "Lưu tiến độ" }).click();
  await page.getByRole("button", { name: `Xem thói quen hoàn thành ${dayLabel(today)}` }).click();
  await expect(page.getByRole("heading", { name: fullDateLabel(today) })).toBeVisible();
  await expect(page.getByText("Viết nhật ký", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Quay lại Tổng quan/ }).click();
  await page.getByRole("button", { name: "Cập nhật tiến độ Viết nhật ký" }).click();
  await page.getByLabel("Phần trăm tiến độ").fill("0");
  await page.getByRole("button", { name: "Lưu tiến độ" }).click();
  await page.getByRole("button", { name: `Xem thói quen hoàn thành ${dayLabel(today)}` }).click();
  await expect(page.getByText("Viết nhật ký", { exact: true })).toHaveCount(0);
});

test("có thể tùy chỉnh phần trăm tiến độ thói quen và lưu qua reload", async ({ page }) => {
  await page.getByRole("button", { name: "Cập nhật tiến độ Học ngoại ngữ 30 phút" }).click();
  await expect(page.getByRole("heading", { name: "Cập nhật tiến độ" })).toBeVisible();
  await page.getByLabel("Phần trăm tiến độ").fill("65");
  await page.getByRole("button", { name: "Lưu tiến độ" }).click();
  await expect(page.getByRole("button", { name: "Cập nhật tiến độ Học ngoại ngữ 30 phút" }).getByText("65%")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Cập nhật tiến độ Học ngoại ngữ 30 phút" }).getByText("65%")).toBeVisible();
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
