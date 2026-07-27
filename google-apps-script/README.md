# Google Apps Script cho HabitFlow

1. Trong Google Sheet, tạo một trang tính tên `Storage`.
2. Nhập `userId`, `jsonData`, `updatedAt` lần lượt vào các ô A1, B1, C1.
3. Mở **Tiện ích mở rộng → Apps Script**.
4. Sao chép toàn bộ nội dung `Code.gs` vào trình chỉnh sửa và lưu.
5. Chạy `testConnection` một lần và cấp quyền.
6. Chọn **Deploy → New deployment → Web app**.
7. Chọn **Execute as: Me** và **Who has access: Anyone**.

Ứng dụng đang dùng deployment:

`https://script.google.com/macros/s/AKfycbwLvtD7TvbY-Mcko6_gqsROQbdSg46K4PHrvbxS-ijGBg2x8QeWuoNlv52vwHCISP4U/exec`

Sau mỗi lần sửa `Code.gs`, vào **Manage deployments**, chọn **Edit**,
chọn **New version**, rồi triển khai lại.
