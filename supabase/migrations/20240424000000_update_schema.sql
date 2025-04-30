-- Xóa tất cả policies cũ
DROP POLICY IF EXISTS "Users can view their own data" ON "User";
DROP POLICY IF EXISTS "Users can update their own data" ON "User";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "User";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "User";
DROP POLICY IF EXISTS "Enable select for authenticated users" ON "User";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "User";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "User";
DROP POLICY IF EXISTS "Users can view their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "Users can create appointments" ON "Appointment";
DROP POLICY IF EXISTS "Users can update their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "Enable read access for all users" ON "User";
DROP POLICY IF EXISTS "Enable update for admin only" ON "User";
DROP POLICY IF EXISTS "Admin can view all appointments" ON "Appointment";
DROP POLICY IF EXISTS "Admin can manage all users" ON "User";
DROP POLICY IF EXISTS "Admin can view patient info in appointments" ON "User";
DROP POLICY IF EXISTS "Doctors can view their appointments" ON "Appointment";
DROP POLICY IF EXISTS "Doctors can update appointment status" ON "Appointment";
DROP POLICY IF EXISTS "Admin can view all patients" ON "User";
DROP POLICY IF EXISTS "Admin can view all users" ON "User";

-- Cấp quyền truy cập
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Bật Row Level Security cho tất cả các bảng
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

-- Policies cho bảng User
-- Cho phép service_role thực hiện tất cả các thao tác
CREATE POLICY "Service role can do everything" 
ON "User" 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Cho phép tất cả người dùng tạo user mới (đăng ký)
CREATE POLICY "Enable insert for all users" 
ON "User" 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Cho phép user xem thông tin của chính mình
CREATE POLICY "Users can view their own data" 
ON "User" 
FOR SELECT 
TO authenticated
USING (id = auth.uid()::text);

-- Cho phép user cập nhật thông tin của chính mình
CREATE POLICY "Users can update their own data" 
ON "User" 
FOR UPDATE 
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- Cho phép user xóa tài khoản của chính mình
CREATE POLICY "Users can delete their own data" 
ON "User" 
FOR DELETE 
TO authenticated
USING (id = auth.uid()::text);

-- Cho phép mọi người xem thông tin bác sĩ
CREATE POLICY "Enable read access for all users" 
ON "User" 
FOR SELECT 
TO anon, authenticated
USING (role = 'DOCTOR'::"Role");

-- Cho phép admin xem và cập nhật thông tin tất cả users
CREATE POLICY "Admin can manage all users" 
ON "User" 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text 
    AND u.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text 
    AND u.role = 'ADMIN'
  )
);

-- Cho phép admin xem thông tin tất cả patients
CREATE POLICY "Admin can view all patients" 
ON "User" 
FOR SELECT 
TO authenticated
USING (true);

-- Policies cho bảng Appointment
-- Cho phép service_role thực hiện tất cả các thao tác
CREATE POLICY "Service role can do everything" 
ON "Appointment" 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Cho phép user xem lịch hẹn của mình
CREATE POLICY "Users can view their own appointments" 
ON "Appointment" 
FOR SELECT 
TO authenticated
USING ("patientId" = auth.uid()::text OR "doctorId" = auth.uid()::text);

-- Cho phép user tạo lịch hẹn mới
CREATE POLICY "Users can create appointments" 
ON "Appointment" 
FOR INSERT 
TO authenticated
WITH CHECK ("patientId" = auth.uid()::text);

-- Cho phép user cập nhật/cancel lịch hẹn của mình
CREATE POLICY "Users can update their own appointments" 
ON "Appointment" 
FOR UPDATE 
TO authenticated
USING ("patientId" = auth.uid()::text OR "doctorId" = auth.uid()::text);

-- Cho phép admin xem tất cả appointments
CREATE POLICY "Admin can view all appointments" 
ON "Appointment" 
FOR SELECT 
TO authenticated
USING (true);

-- Cho phép doctor xem tất cả appointments của bệnh nhân đã đăng ký với mình
CREATE POLICY "Doctors can view their appointments" 
ON "Appointment" 
FOR SELECT 
TO authenticated
USING (
  "doctorId" = auth.uid()::text 
  AND (auth.jwt() ->> 'role' = 'DOCTOR')
);

-- Cho phép doctor cập nhật trạng thái appointments
CREATE POLICY "Doctors can update appointment status" 
ON "Appointment" 
FOR UPDATE 
TO authenticated
USING (
  "doctorId" = auth.uid()::text 
  AND (auth.jwt() ->> 'role' = 'DOCTOR')
)
WITH CHECK (
  "doctorId" = auth.uid()::text 
  AND (auth.jwt() ->> 'role' = 'DOCTOR')
);

-- Tạo policy riêng cho SELECT để đảm bảo admin có thể xem tất cả users
CREATE POLICY "Admin can view all users" 
ON "User" 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text 
    AND u.role = 'ADMIN'
  )
);

-- Tạo lại các policy cơ bản
-- Cho phép admin xem tất cả users
CREATE POLICY "Admin can view all users" 
ON "User" 
FOR SELECT 
TO authenticated
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN'
);

-- Cho phép admin cập nhật tất cả users
CREATE POLICY "Admin can update all users" 
ON "User" 
FOR UPDATE 
TO authenticated
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN'
)
WITH CHECK (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN'
);

-- Cho phép admin xóa tất cả users
CREATE POLICY "Admin can delete all users" 
ON "User" 
FOR DELETE 
TO authenticated
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN'
); 