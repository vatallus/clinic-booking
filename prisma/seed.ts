import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete all existing records
  await prisma.appointment.deleteMany()
  await prisma.user.deleteMany()

  // Create doctors as users with DOCTOR role
  const doctors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.smith@example.com',
        name: 'John Smith',
        role: 'DOCTOR',
        specialty: 'Cardiology',
        description: 'Experienced cardiologist with over 15 years of practice',
        image: '/doctors/doctor1.jpg'
      }
    }),
    prisma.user.create({
      data: {
        email: 'dr.jones@example.com',
        name: 'Sarah Jones',
        role: 'DOCTOR',
        specialty: 'Pediatrics',
        description: 'Caring pediatrician dedicated to children\'s health',
        image: '/doctors/doctor2.jpg'
      }
    }),
    prisma.user.create({
      data: {
        email: 'dr.wilson@example.com',
        name: 'Michael Wilson',
        role: 'DOCTOR',
        specialty: 'Dermatology',
        description: 'Board-certified dermatologist specializing in skin health',
        image: '/doctors/doctor3.jpg'
      }
    }),
    prisma.user.create({
      data: {
        email: 'dr.brown@example.com',
        name: 'Emily Brown',
        role: 'DOCTOR',
        specialty: 'Neurology',
        description: 'Expert neurologist focusing on brain and nerve disorders',
        image: '/doctors/doctor4.jpg'
      }
    }),
    prisma.user.create({
      data: {
        email: 'dr.davis@example.com',
        name: 'Robert Davis',
        role: 'DOCTOR',
        specialty: 'Orthopedics',
        description: 'Skilled orthopedic surgeon with expertise in joint replacement',
        image: '/doctors/doctor5.jpg'
      }
    })
  ])

  // Create patients
  const patients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'patient1@example.com',
        name: 'Nguyễn Văn A',
        role: 'PATIENT',
        phone: '0901234567',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient2@example.com',
        name: 'Trần Thị B',
        role: 'PATIENT',
        phone: '0902345678',
        address: '456 Đường XYZ, Quận 2, TP.HCM'
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient3@example.com',
        name: 'Lê Văn C',
        role: 'PATIENT',
        phone: '0903456789',
        address: '789 Đường DEF, Quận 3, TP.HCM'
      }
    })
  ])

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clinic.com',
      name: 'Admin',
      role: 'ADMIN',
      phone: '0909999999',
      address: 'Clinic Headquarters'
    }
  })

  // Create appointments
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '09:00',
        status: 'PENDING',
        notes: 'Khám sức khỏe định kỳ',
        symptoms: 'Đau đầu, mệt mỏi'
      }
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        time: '14:30',
        status: 'CONFIRMED',
        notes: 'Tái khám sau điều trị',
        symptoms: 'Sốt nhẹ, ho'
      }
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[2].id,
        doctorId: doctors[2].id,
        date: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
        time: '10:15',
        status: 'PENDING',
        notes: 'Kiểm tra da liễu',
        symptoms: 'Nổi mẩn đỏ, ngứa'
      }
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctors[3].id,
        date: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 days from now
        time: '15:45',
        status: 'COMPLETED',
        notes: 'Khám thần kinh',
        symptoms: 'Đau đầu, chóng mặt'
      }
    })
  ])

  console.log('Database has been seeded with:')
  console.log('-', doctors.length, 'doctors')
  console.log('-', patients.length, 'patients')
  console.log('- 1 admin')
  console.log('-', appointments.length, 'appointments')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })