<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DoctorController extends Controller
{
    public function index()
    {
        // Return only doctors (id + name + email)
        return User::where('role', 'doctor')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
    }
}
