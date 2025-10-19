# Hệ thống Quản lý Phòng khám - Clinic Booking System

Hệ thống quản lý phòng khám toàn diện được thiết kế đặc biệt cho thị trường Việt Nam, tuân thủ các quy định của Bộ Y tế.

## Tính năng chính

### 1. Quản lý Lịch hẹn
- Đặt lịch hẹn trực tuyến
- Xác nhận và quản lý lịch hẹn
- Thông báo nhắc nhở tự động
- Quản lý lịch làm việc của bác sĩ

### 2. Hồ sơ Bệnh án Điện tử (EMR)
- Hỗ trợ 29 mẫu bệnh án theo Thông tư 32/2023/TT-BYT
- Lưu trữ thông tin bệnh nhân đầy đủ
- Quản lý tiền sử bệnh
- Đính kèm kết quả xét nghiệm, hình ảnh

### 3. Quản lý Đơn thuốc
- Kê đơn thuốc điện tử
- Hướng dẫn sử dụng chi tiết
- Lưu trữ lịch sử đơn thuốc
- In đơn thuốc

### 4. Thanh toán
- Hỗ trợ nhiều phương thức thanh toán:
  - Tiền mặt
  - VNPay
  - MoMo
  - Chuyển khoản ngân hàng
  - ZaloPay
- Quản lý lịch sử thanh toán
- Xuất hóa đơn

### 5. Đa ngôn ngữ
- Tiếng Việt (mặc định)
- Tiếng Anh

### 6. Phân quyền người dùng
- **Bệnh nhân**: Đặt lịch, xem hồ sơ, đơn thuốc, thanh toán
- **Bác sĩ**: Quản lý lịch làm việc, khám bệnh, kê đơn
- **Quản trị viên**: Quản lý toàn bộ hệ thống

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Internationalization**: next-intl

## Cài đặt

### Yêu cầu
- Node.js 18+
- pnpm
- PostgreSQL database (hoặc Supabase)

### Các bước cài đặt

1. Clone repository:
```bash
git clone https://github.com/vatallus/clinic-booking.git
cd clinic-booking
```

2. Cài đặt dependencies:
```bash
pnpm install
```

3. Cấu hình môi trường:
Tạo file `.env` và cấu hình các biến:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Chạy migrations:
```bash
npx prisma generate
npx prisma db push
```

5. Chạy development server:
```bash
pnpm dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Cấu trúc thư mục

```
clinic-booking/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Các route theo ngôn ngữ
│   │   │   ├── doctor/        # Dashboard bác sĩ
│   │   │   ├── patient/       # Dashboard bệnh nhân
│   │   │   └── admin/         # Dashboard admin
│   │   └── api/               # API routes
│   │       ├── appointments/
│   │       ├── medical-records/
│   │       ├── prescriptions/
│   │       ├── payments/
│   │       └── doctor-schedules/
│   ├── components/
│   │   ├── common/            # Components dùng chung
│   │   ├── layout/            # Layout components
│   │   ├── doctor/            # Components cho bác sĩ
│   │   ├── medical-record/    # Components hồ sơ bệnh án
│   │   └── prescription/      # Components đơn thuốc
│   └── middleware.ts          # Auth & i18n middleware
├── prisma/
│   └── schema.prisma          # Database schema
├── messages/
│   ├── vi.json                # Tiếng Việt
│   └── en.json                # Tiếng Anh
└── public/                    # Static files
```

## API Endpoints

### Appointments
- `GET /api/appointments` - Lấy danh sách lịch hẹn
- `POST /api/appointments` - Tạo lịch hẹn mới
- `PATCH /api/appointments/[id]` - Cập nhật lịch hẹn

### Medical Records
- `GET /api/medical-records` - Lấy danh sách hồ sơ bệnh án
- `POST /api/medical-records` - Tạo hồ sơ bệnh án mới
- `GET /api/medical-records/[id]` - Xem chi tiết hồ sơ

### Prescriptions
- `GET /api/prescriptions` - Lấy danh sách đơn thuốc
- `POST /api/prescriptions` - Tạo đơn thuốc mới
- `GET /api/prescriptions/[id]` - Xem chi tiết đơn thuốc

### Payments
- `GET /api/payments` - Lấy danh sách thanh toán
- `POST /api/payments` - Tạo thanh toán mới
- `PATCH /api/payments` - Cập nhật trạng thái thanh toán

### Doctor Schedules
- `GET /api/doctor-schedules` - Lấy lịch làm việc
- `POST /api/doctor-schedules` - Tạo lịch làm việc mới
- `DELETE /api/doctor-schedules` - Xóa lịch làm việc

## Triển khai

### Build cho production
```bash
pnpm build
```

### Chạy production server
```bash
pnpm start
```

### Deploy lên Vercel
```bash
vercel --prod
```

## Tính năng sắp tới

- [ ] Tích hợp thanh toán VNPay, MoMo
- [ ] Thông báo qua SMS Brandname
- [ ] Thông báo qua Zalo OA/ZNS
- [ ] Báo cáo và thống kê nâng cao
- [ ] Xuất báo cáo Excel/PDF
- [ ] Quản lý bảo hiểm y tế
- [ ] Upload và quản lý file đính kèm
- [ ] In đơn thuốc, hóa đơn

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## Giấy phép

MIT License

## Liên hệ

- GitHub: https://github.com/vatallus/clinic-booking
- Email: support@clinic-booking.com

---

**Phiên bản**: 2.0.0
**Ngày cập nhật**: 20/10/2025

