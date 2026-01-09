# Clinic Appointment System 🏥

A full-stack clinic appointment management system built using **Laravel (API)** and **React (Vite)**.

## 🚀 Features
- Role-based authentication (Admin, Doctor, Student)
- Appointment booking and management
- Doctor approval / rejection
- Admin doctor assignment
- Token-based auth using Laravel Sanctum
- Responsive UI with status badges

## 🛠 Tech Stack
**Backend**
- Laravel 11
- MySQL
- Laravel Sanctum

**Frontend**
- React + Vite
- Axios
- CSS (Custom)

## 🔐 Roles
- **Admin**: Manage users, assign doctors
- **Doctor**: View & approve appointments
- **Student**: Book and track appointments

## 📦 Setup
```bash
# Backend
cd clinic-backend
composer install
php artisan migrate
php artisan serve

# Frontend
cd clinic-frontend
npm install
npm run dev
