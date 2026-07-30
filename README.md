# Attendance System TCP

Đây là hệ thống quản lý chấm công và lịch làm việc nội bộ, được xây dựng bằng **Angular** và thư viện UI **PrimeNG**. Hệ thống cung cấp các phân hệ dành riêng cho ban giám đốc, phòng nhân sự (HR) và các nhân viên thuộc nhiều phòng ban khác nhau.

## Tính năng chính

- **Quản lý danh sách nhân viên**: Phân quyền theo phòng ban và chức vụ (Ban Giám đốc, Trưởng phòng, Nhân viên, HR).
- **Lịch làm việc**: Quản lý lịch biểu, hiển thị trạng thái làm việc (Hành chính, Nghỉ phép, Nghỉ không phép, Lễ...).
- **Phân hệ HR (Chốt công)**: 
  - Xem chi tiết và thống kê ngày công của từng nhân viên.
  - Chỉnh sửa trực tiếp ký hiệu lịch làm việc (HC, OFF, AL, KP, L).
  - Tự động cập nhật tổng ngày công khi có thay đổi.
  - Tính năng khóa sổ tháng và xuất báo cáo.
- **Giao diện hiện đại**: Sử dụng PrimeNG mang lại trải nghiệm người dùng tối ưu, hỗ trợ bảng, popup, tooltip và biểu mẫu linh hoạt.

## Công nghệ sử dụng

- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: PrimeNG, PrimeFlex, PrimeIcons
- **Ngôn ngữ**: TypeScript, HTML, SCSS
- **Môi trường chạy**: Node.js

## Cài đặt và khởi chạy

1. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

2. **Chạy server phát triển (Development server):**
   ```bash
   npm run start
   ```
   *Hoặc sử dụng lệnh Angular CLI chuẩn:*
   ```bash
   ng serve
   ```
3. Mở trình duyệt và truy cập vào địa chỉ `http://localhost:4200/`. Hệ thống sẽ tự động tải lại nếu có bất kỳ thay đổi nào trong mã nguồn.

## 📂 Cấu trúc thư mục

- `src/app/core/`: Chứa các dịch vụ (services) như database, và dữ liệu giả lập (mocks).
- `src/app/pages/`: Chứa giao diện của các trang (Ví dụ: HR Reports, Schedules...).
- `src/app/shared/`: Chứa các component dùng chung.

## Ghi chú
Hệ thống hiện tại đang sử dụng dữ liệu giả lập (Mock Data) tại `employees.mock.ts` để mô phỏng hoạt động. Việc lưu trữ dữ liệu (sửa lịch, chốt công) sẽ được lưu cục bộ trong bộ nhớ (Cache) khi ứng dụng đang chạy.
