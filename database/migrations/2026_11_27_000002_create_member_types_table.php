<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->unsignedInteger('fee')->default(0);
            $table->string('description', 300)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // শুরুর দুটি টাইপ (অ্যাডমিন থেকে বদলানো ও নতুন যোগ করা যাবে)
        $now = now();
        DB::table('member_types')->insert([
            ['name' => 'সাধারণ মেম্বার', 'fee' => 500, 'description' => null, 'sort_order' => 1, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'স্থায়ী মেম্বার', 'fee' => 10000, 'description' => null, 'sort_order' => 2, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('member_types');
    }
};
