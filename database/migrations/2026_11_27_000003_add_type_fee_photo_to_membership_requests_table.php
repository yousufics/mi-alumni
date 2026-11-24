<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('member_type_id')->nullable()->index()->after('batch');
            $table->unsignedInteger('fee_amount')->nullable()->after('member_type_id');
            $table->string('payment_status', 10)->default('unpaid')->index()->after('fee_amount');
            $table->timestamp('paid_at')->nullable()->after('payment_status');
            $table->string('payment_note')->nullable()->after('paid_at');
            $table->string('photo')->nullable()->after('payment_note');
        });
    }

    public function down(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->dropColumn(['member_type_id', 'fee_amount', 'payment_status', 'paid_at', 'payment_note', 'photo']);
        });
    }
};
