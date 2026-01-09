<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;



class AppointmentController extends Controller
{
    // Student: book appointment
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can book appointments.'], 403);
        }

        $validated = $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:users,id'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        // Ensure selected doctor is actually a doctor
        $doctor = User::where('id', $validated['doctor_id'])->where('role', 'doctor')->first();
        if (!$doctor) {
            return response()->json(['message' => 'Selected user is not a doctor.'], 422);
        }

        // Prevent double booking: same doctor + date + time
        $exists = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'This time slot is already booked.'], 422);
        }

        $appointment = Appointment::create([
            'student_id' => $user->id,
            'doctor_id' => $validated['doctor_id'],
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($appointment, 201);
    }

    // Student: view own appointments
    public function mine(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can view this list.'], 403);
        }

        $appointments = Appointment::with(['doctor:id,name,email,role'])
            ->where('student_id', $user->id)
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->get();

        return response()->json($appointments);
    }

    // Doctor: view assigned appointments
public function doctorAppointments(Request $request)
{
    $user = $request->user();

    if ($user->role !== 'doctor') {
        return response()->json(['message' => 'Only doctors can access this.'], 403);
    }

    $appointments = Appointment::with(['student:id,name,email,role'])
        ->where('doctor_id', $user->id)
        ->orderBy('appointment_date')
        ->orderBy('appointment_time')
        ->get();

    return response()->json($appointments);
}

// Doctor: update appointment status
public function updateStatus(Request $request, $id)
{
    $user = $request->user();

    if ($user->role !== 'doctor') {
        return response()->json(['message' => 'Only doctors can update status.'], 403);
    }

    $validated = $request->validate([
        'status' => ['required', Rule::in(['approved', 'rejected', 'completed'])],
    ]);

    $appointment = Appointment::where('id', $id)
        ->where('doctor_id', $user->id)
        ->firstOrFail();

    $appointment->update([
        'status' => $validated['status'],
    ]);

    return response()->json($appointment);
}

public function allAppointments()
{
    return Appointment::with([
        'student:id,name,email,role',
        'doctor:id,name,email,role',
    ])
    ->orderByDesc('created_at')
    ->get();
}

}
