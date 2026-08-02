<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('option_a_image_path')->nullable()->after('option_a');
            $table->string('option_b_image_path')->nullable()->after('option_b');
            $table->string('option_c_image_path')->nullable()->after('option_c');
            $table->string('option_d_image_path')->nullable()->after('option_d');
            $table->string('option_e_image_path')->nullable()->after('option_e');
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn([
                'option_a_image_path',
                'option_b_image_path',
                'option_c_image_path',
                'option_d_image_path',
                'option_e_image_path',
            ]);
        });
    }
};
