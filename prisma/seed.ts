import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.appointment.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.user.deleteMany()

  // Create sample doctors with Vietnamese names and specialties
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: 'Bác sĩ Nguyễn Văn An',
        specialty: 'Nội khoa',
        description: 'Chuyên gia về các bệnh lý nội khoa, có hơn 10 năm kinh nghiệm',
        image: '/doctors/doctor1.jpg',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Bác sĩ Trần Thị Bình',
        specialty: 'Nhi khoa',
        description: 'Chuyên gia về chăm sóc và điều trị bệnh nhi, có hơn 8 năm kinh nghiệm',
        image: '/doctors/doctor2.jpg',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Bác sĩ Lê Minh Cường',
        specialty: 'Tim mạch',
        description: 'Chuyên gia về các bệnh lý tim mạch, có hơn 12 năm kinh nghiệm',
        image: '/doctors/doctor3.jpg',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Bác sĩ Phạm Thị Dung',
        specialty: 'Da liễu',
        description: 'Chuyên gia về các bệnh lý da liễu, có hơn 7 năm kinh nghiệm',
        image: '/doctors/doctor4.jpg',
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Bác sĩ Hoàng Văn Đức',
        specialty: 'Xương khớp',
        description: 'Chuyên gia về các bệnh lý xương khớp, có hơn 9 năm kinh nghiệm',
        image: '/doctors/doctor5.jpg',
      },
    }),
  ])

  // Create sample users with Vietnamese names
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'nguyenvana@gmail.com',
        name: 'Nguyễn Văn A',
        role: 'PATIENT',
        phone: '0901234567',
        address: '123 Đường ABC, Quận 1, TP.HCM',
      },
    }),
    prisma.user.create({
      data: {
        email: 'tranthib@gmail.com',
        name: 'Trần Thị B',
        role: 'PATIENT',
        phone: '0902345678',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@phongkham.com',
        name: 'Quản trị viên',
        role: 'ADMIN',
        phone: '0903456789',
        address: '789 Đường DEF, Quận 3, TP.HCM',
      },
    }),
  ])

  // Create sample appointments with more realistic dates and times
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: users[0].id,
        doctorId: doctors[0].id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '09:00',
        status: 'PENDING',
        notes: 'Khám sức khỏe định kỳ',
        symptoms: 'Đau đầu, mệt mỏi',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: users[1].id,
        doctorId: doctors[1].id,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        time: '14:30',
        status: 'CONFIRMED',
        notes: 'Tái khám sau điều trị',
        symptoms: 'Sốt nhẹ, ho',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: users[0].id,
        doctorId: doctors[2].id,
        date: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
        time: '10:15',
        status: 'PENDING',
        notes: 'Kiểm tra huyết áp',
        symptoms: 'Huyết áp không ổn định',
      },
    }),
  ])

  console.log('Seed data created successfully!')
  console.log('Doctors:', doctors)
  console.log('Users:', users)
  console.log('Appointments:', appointments)
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })