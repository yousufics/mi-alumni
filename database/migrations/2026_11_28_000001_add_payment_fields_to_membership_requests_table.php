<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->string('payment_method', 60)->nullable()->after('payment_status');
            $table->string('trx_id', 100)->nullable()->unique()->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->dropUnique(['trx_id']);
            $table->dropColumn(['payment_method', 'trx_id']);
        });
    }
};
