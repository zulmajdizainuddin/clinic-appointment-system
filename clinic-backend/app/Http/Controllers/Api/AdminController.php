<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'role', 'created_at')
                ->orderBy('id')
                ->get()
        );
    }

    public function updateAppointmentStatus(Request $request, $id)
    {
    $data = $request->validate([
        'status' => ['required', 'in:approved,rejected,pending'],
    ]);

    $appointment = Appointment::with(['student', 'doctor'])->findOrFail($id);
    $appointment->status = $data['status'];
    $appointment->save();

    // Mock email notification (logs into laravel.log)
    $studentEmail = $appointment->student?->email ?? '(no student email)';
    $doctorName = $appointment->doctor?->name ?? '(no doctor)';
    Log::info("MOCK EMAIL: Appointment #{$appointment->id} status changed to '{$appointment->status}' for student {$studentEmail} (doctor: {$doctorName})");

    return response()->json($appointment->load(['student:id,name,email', 'doctor:id,name,email']));
    }

    public function assignDoctor(Request $request, $id)
    {
    $data = $request->validate([
        'doctor_id' => ['required', 'exists:users,id'],
    ]);

    $appointment = Appointment::findOrFail($id);

    // Optional safety: only allow assigning users with role doctor
    $doctor = \App\Models\User::find($data['doctor_id']);
    if ($doctor->role !== 'doctor') {
        return response()->json(['message' => 'Selected user is not a doctor'], 422);
    }

    $appointment->doctor_id = $data['doctor_id'];
    $appointment->save();

    return response()->json($appointment->load(['student:id,name,email', 'doctor:id,name,email']));
    }
}
