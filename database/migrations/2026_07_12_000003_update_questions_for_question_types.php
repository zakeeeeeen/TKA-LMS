<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('question_type')->default('single_choice')->after('user_id');
            $table->text('answer_text')->nullable()->after('correct_option');

            $table->text('option_a')->nullable()->change();
            $table->text('option_b')->nullable()->change();
            $table->text('option_c')->nullable()->change();
            $table->text('option_d')->nullable()->change();
            $table->text('option_e')->nullable()->change();
            $table->string('correct_option', 1)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['question_type', 'answer_text']);

            $table->text('option_a')->nullable(false)->change();
            $table->text('option_b')->nullable(false)->change();
            $table->text('option_c')->nullable(false)->change();
            $table->text('option_d')->nullable(false)->change();
            $table->text('option_e')->nullable()->change();
            $table->string('correct_option', 1)->nullable(false)->change();
        });
    }
};
