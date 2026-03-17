<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Esta es la ruta que buscará tu React
Route::get('/productos', function () {
    return response()->json(DB::table('products')->get());
});