<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// 1. Obtener todos los productos (Para la Tienda)
Route::get('/productos', function () {
    return response()->json(DB::table('products')->get());
});

// 2. Guardar un nuevo producto (Para el Panel Admin)
Route::post('/productos', function (Request $request) {
    $id = DB::table('products')->insertGetId([
        'nombre' => $request->nombre,
        'precio' => $request->precio,
        'stock' => $request->stock,
        'imagen' => $request->imagen ?? 'https://via.placeholder.com/150',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    return response()->json(['message' => 'Producto creado', 'id' => $id], 201);
});

// 3. Ruta especial para la IA: Productos con poco stock (menos de 5 unidades)
Route::get('/stock-critico', function () {
    $criticos = DB::table('products')->where('stock', '<', 5)->get();
    return response()->json($criticos);
});

// 4. RESTAR STOCK AL COMPRAR
Route::post('/productos/comprar', function (Request $request) {
    // Recibimos un array de IDs de productos comprados
    foreach ($request->items as $item) {
        DB::table('products')
            ->where('id', $item['id'])
            ->where('stock', '>', 0) // Para no bajar de cero
            ->decrement('stock');
    }
    return response()->json(['message' => 'Stock actualizado correctamente']);
});

// 5. RESUMEN PARA LA IA (Ventas, stock bajo, productos estrella)
Route::get('/ia/analisis-completo', function () {
    $totalProductos = DB::table('products')->count();
    $stockBajo = DB::table('products')->where('stock', '<', 5)->get();
    $valorInventario = DB::table('products')->selectRaw('SUM(precio * stock) as total')->first();
    
    return response()->json([
        'total_piezas' => $totalProductos,
        'piezas_criticas' => $stockBajo,
        'valor_almacen' => $valorInventario->total ?? 0,
        'mensaje_alerta' => $stockBajo->count() > 0 ? "Faltan piezas importantes." : "Almacén al día."
    ]);
});