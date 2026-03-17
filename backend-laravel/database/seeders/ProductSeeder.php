<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    \DB::table('products')->insert([
        [
            'nombre' => 'Aceite Sintético 5W30',
            'precio' => 45.00,
            'stock' => 15,
            'imagen' => 'https://images.unsplash.com/photo-1635843104392-4fce109833d3?q=80&w=400&auto=format&fit=crop'
        ],
        [
            'nombre' => 'Pastillas de Freno (Juego)',
            'precio' => 85.50,
            'stock' => 8,
            'imagen' => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop'
        ],
        [
            'nombre' => 'Batería 75Ah',
            'precio' => 120.00,
            'stock' => 5,
            'imagen' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400&auto=format&fit=crop'
        ]
    ]);
}
}
