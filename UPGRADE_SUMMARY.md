# Tài liệu Tổng hợp Nâng cấp Dự án Clinic Booking

## Tổng quan

Dự án đã được nâng cấp toàn diện để phù hợp với yêu cầu của phần mềm quản lý phòng khám tại Việt Nam. Các nâng cấp bao gồm cập nhật cấu trúc database, thêm tính năng mới, và Việt hóa toàn bộ giao diện.

## 1. Cập nhật Cấu trúc Database

### 1.1. Bảng User (Mở rộng)
Đã thêm các trường mới:
- `dateOfBirth`: Ngày sinh
- `gender`: Giới tính (MALE, FEMALE, OTHER)
- `insuranceNumber`: Số BHYT
- `identityCard`: Số CMND/CCCD
- `ethnicity`: Dân tộc
- `occupation`: Nghề nghiệp
- `licenseNumber`: Số chứng chỉ hành nghề (cho bác sĩ)

### 1.2. Bảng Appointment (Mở rộng)
Đã thêm các trường mới:
- `diagnosis`: Chẩn đoán
- `reason`: Lý do khám
- `status`: Thêm trạng thái NO_SHOW

### 1.3. Bảng MedicalRecord (Mới)
Quản lý hồ sơ bệnh án điện tử:
- `recordType`: Loại bệnh án (tham chiếu 29 mẫu của BYT)
- `chiefComplaint`: Lý do khám
- `presentIllness`: Bệnh sử
- `pastHistory`: Tiền sử bệnh
- `examination`: Khám bệnh
- `diagnosis`: Chẩn đoán
- `treatment`: Điều trị
- `content`: Nội dung chi tiết (JSON)
- `attachments`: File đính kèm

### 1.4. Bảng Prescription (Mới)
Quản lý đơn thuốc điện tử:
- Liên kết với appointment, patient, doctor
- `notes`: Lời dặn
- `diagnosis`: Chẩn đoán

### 1.5. Bảng PrescriptionDetail (Mới)
Chi tiết đơn thuốc:
- `medicineName`: Tên thuốc
- `dosage`: Liều lượng
- `quantity`: Số lượng
- `unit`: Đơn vị
- `instructions`: Hướng dẫn sử dụng
- Thời gian uống: morning, noon, afternoon, evening
- Quan hệ với bữa ăn: beforeMeal, afterMeal

### 1.6. Bảng DoctorSchedule (Mới)
Quản lý lịch làm việc của bác sĩ:
- `dayOfWeek`: Thứ trong tuần (0-6)
- `startTime`: Giờ bắt đầu
- `endTime`: Giờ kết thúc
- `isActive`: Trạng thái hoạt động

### 1.7. Bảng DoctorLeave (Mới)
Quản lý ngày nghỉ của bác sĩ:
- `date`: Ngày nghỉ
- `reason`: Lý do
- `isAllDay`: Nghỉ cả ngày hay không
- `startTime`, `endTime`: Thời gian nghỉ (nếu không nghỉ cả ngày)

### 1.8. Bảng Payment (Mới)
Quản lý thanh toán:
- `amount`: Số tiền
- `method`: Phương thức (CASH, VNPAY, MOMO, BANK_TRANSFER, ZALOPAY)
- `status`: Trạng thái (PAID, UNPAID, FAILED, REFUNDED)
- `transactionId`: Mã giao dịch
- `paidAt`: Thời gian thanh toán

### 1.9. Bảng Service (Mới)
Quản lý dịch vụ khám:
- `name`: Tên dịch vụ
- `description`: Mô tả
- `price`: Giá
- `duration`: Thời gian (phút)
- `isActive`: Trạng thái hoạt động

## 2. API Routes Mới

### 2.1. Medical Records API (`/api/medical-records`)
- **GET**: Lấy danh sách hồ sơ bệnh án
  - Query params: `patientId`, `appointmentId`
  - Authorization: Bệnh nhân chỉ xem được hồ sơ của mình
- **POST**: Tạo hồ sơ bệnh án mới
  - Authorization: Chỉ bác sĩ và admin

### 2.2. Prescriptions API (`/api/prescriptions`)
- **GET**: Lấy danh sách đơn thuốc
  - Query params: `patientId`, `doctorId`, `appointmentId`
  - Authorization: Bệnh nhân xem đơn của mình, bác sĩ xem đơn đã kê
- **POST**: Tạo đơn thuốc mới
  - Authorization: Chỉ bác sĩ và admin

### 2.3. Doctor Schedules API (`/api/doctor-schedules`)
- **GET**: Lấy lịch làm việc của bác sĩ
  - Query params: `doctorId`
- **POST**: Tạo lịch làm việc mới
  - Authorization: Bác sĩ hoặc admin
- **DELETE**: Xóa lịch làm việc
  - Query params: `id`
  - Authorization: Bác sĩ chỉ xóa lịch của mình

### 2.4. Payments API (`/api/payments`)
- **GET**: Lấy danh sách thanh toán
  - Query params: `appointmentId`, `status`
  - Authorization: Bệnh nhân xem thanh toán của mình
- **POST**: Tạo thanh toán mới
  - Authorization: Bệnh nhân hoặc admin
- **PATCH**: Cập nhật trạng thái thanh toán
  - Body: `paymentId`, `status`, `transactionId`
  - Authorization: Chỉ admin và bác sĩ

## 3. Components Mới

### 3.1. DoctorScheduleManager
**Đường dẫn**: `src/components/doctor/DoctorScheduleManager.tsx`

**Chức năng**:
- Hiển thị lịch làm việc của bác sĩ theo thứ
- Thêm mới lịch làm việc
- Xóa lịch làm việc

**Props**:
```typescript
interface DoctorScheduleManagerProps {
  doctorId: string;
}
```

**Sử dụng**:
```tsx
import DoctorScheduleManager from '@/components/doctor/DoctorScheduleManager';

<DoctorScheduleManager doctorId={doctorId} />
```

### 3.2. MedicalRecordForm
**Đường dẫn**: `src/components/medical-record/MedicalRecordForm.tsx`

**Chức năng**:
- Form tạo hồ sơ bệnh án mới
- Hỗ trợ các loại bệnh án theo chuẩn BYT
- Các trường: Lý do khám, Bệnh sử, Tiền sử, Khám bệnh, Chẩn đoán, Điều trị

**Props**:
```typescript
interface MedicalRecordFormProps {
  appointmentId: string;
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**Sử dụng**:
```tsx
import MedicalRecordForm from '@/components/medical-record/MedicalRecordForm';

<MedicalRecordForm 
  appointmentId={appointmentId}
  patientId={patientId}
  onSuccess={() => console.log('Success')}
  onCancel={() => console.log('Cancel')}
/>
```

### 3.3. PrescriptionForm
**Đường dẫn**: `src/components/prescription/PrescriptionForm.tsx`

**Chức năng**:
- Form tạo đơn thuốc mới
- Thêm nhiều loại thuốc
- Cấu hình thời gian uống (sáng, trưa, chiều, tối)
- Cấu hình quan hệ với bữa ăn (trước/sau ăn)

**Props**:
```typescript
interface PrescriptionFormProps {
  appointmentId: string;
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**Sử dụng**:
```tsx
import PrescriptionForm from '@/components/prescription/PrescriptionForm';

<PrescriptionForm 
  appointmentId={appointmentId}
  patientId={patientId}
  onSuccess={() => console.log('Success')}
  onCancel={() => console.log('Cancel')}
/>
```

## 4. Hệ thống Đa ngôn ngữ (i18n)

### 4.1. Cấu hình
- Thư viện: `next-intl`
- Ngôn ngữ hỗ trợ: Tiếng Việt (vi), Tiếng Anh (en)
- Ngôn ngữ mặc định: Tiếng Việt

### 4.2. File Messages
- `messages/vi.json`: Nội dung tiếng Việt
- `messages/en.json`: Nội dung tiếng Anh

### 4.3. Cấu trúc Messages
```json
{
  "common": { ... },
  "nav": { ... },
  "auth": { ... },
  "user": { ... },
  "doctor": { ... },
  "appointment": { ... },
  "medicalRecord": { ... },
  "prescription": { ... },
  "payment": { ... },
  "dashboard": { ... },
  "validation": { ... },
  "messages": { ... }
}
```

### 4.4. Sử dụng trong Components
```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('dashboard.overview')}</p>
    </div>
  );
}
```

## 5. Middleware

Middleware đã được cập nhật để tích hợp cả:
- **Authentication**: Kiểm tra đăng nhập và phân quyền
- **Internationalization**: Xử lý đa ngôn ngữ

**Đường dẫn**: `src/middleware.ts`

## 6. Hướng dẫn Triển khai

### 6.1. Cài đặt Dependencies
```bash
cd /home/ubuntu/clinic-booking
pnpm install
```

### 6.2. Cấu hình Environment Variables
File `.env` đã được tạo với các biến:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6.3. Generate Prisma Client
```bash
npx prisma generate
```

### 6.4. Chạy Development Server
```bash
pnpm dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### 6.5. Build cho Production
```bash
pnpm build
pnpm start
```

## 7. Các Bước Tiếp theo (Đề xuất)

### 7.1. Tích hợp Thanh toán
- Tích hợp VNPay API
- Tích hợp MoMo API
- Tích hợp ZaloPay API

### 7.2. Tích hợp Thông báo
- SMS Brandname (eSMS, VietGuys)
- Zalo OA và ZNS
- Email notifications

### 7.3. Báo cáo và Thống kê
- Dashboard báo cáo doanh thu
- Thống kê bệnh nhân
- Thống kê lịch hẹn
- Xuất báo cáo Excel/PDF

### 7.4. Quản lý Bảo hiểm Y tế
- Ghi nhận thông tin BHYT
- Xuất báo cáo BHYT
- Tích hợp với hệ thống BHXH (nếu có API)

### 7.5. Upload và Quản lý File
- Upload kết quả xét nghiệm
- Upload hình ảnh X-quang
- Quản lý file đính kèm trong hồ sơ bệnh án

### 7.6. In ấn
- In đơn thuốc
- In hồ sơ bệnh án
- In hóa đơn thanh toán

## 8. Lưu ý Kỹ thuật

### 8.1. Bảo mật
- Tất cả API routes đều có authentication check
- Role-based access control (RBAC)
- Bệnh nhân chỉ xem được dữ liệu của mình
- Bác sĩ chỉ quản lý được lịch và dữ liệu của mình

### 8.2. Performance
- Sử dụng indexes trên các trường thường xuyên query
- Pagination cho danh sách lớn
- Lazy loading cho components

### 8.3. Data Validation
- Client-side validation với React Hook Form (đề xuất thêm)
- Server-side validation trong API routes
- Prisma schema validation

## 9. Tài liệu Tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Supabase Documentation](https://supabase.com/docs)
- [Thông tư 32/2023/TT-BYT](https://thuvienphapluat.vn/van-ban/The-thao-Y-te/Thong-tu-32-2023-TT-BYT-sua-doi-Thong-tu-48-2017-TT-BYT-huong-dan-ghi-benh-an-570844.aspx)

## 10. Liên hệ và Hỗ trợ

Nếu có bất kỳ câu hỏi hoặc vấn đề nào trong quá trình triển khai, vui lòng tạo issue trên GitHub repository hoặc liên hệ với team phát triển.

---

**Ngày cập nhật**: 20/10/2025
**Phiên bản**: 2.0.0

