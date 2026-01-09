<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\DoctorController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Doctor listing  (for dropdown)
    Route::get('/doctors', [DoctorController::class, 'index']);

    // Student appointment routes
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/mine', [AppointmentController::class, 'mine']);

    // Doctor routes
    Route::get('/doctor/appointments', [AppointmentController::class, 'doctorAppointments']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    

});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/appointments', [AppointmentController::class, 'allAppointments']);
    Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'users']);
    Route::put('/appointments/{id}/assign-doctor', [\App\Http\Controllers\Api\AdminController::class, 'assignDoctor']);
    Route::put('/appointments/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateAppointmentStatus']);

});

