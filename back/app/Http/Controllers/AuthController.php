<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $credentials = $request->only('username', 'password');
        
        if (Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Login exitoso',
                'user' => Auth::user(),
            ], 200);
        }

        return response()->json([
            'message' => 'Credenciales incorrectas'
        ], 401);
    }
    
    public function logout(Request $request)
    {
        Auth::logout();
        
        return response()->json([
            'message' => 'Logout exitoso'
        ], 200);
    }
}