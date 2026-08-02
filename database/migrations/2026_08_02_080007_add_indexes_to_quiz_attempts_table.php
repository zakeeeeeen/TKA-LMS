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
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->index(['status', 'finished_at'], 'qa_status_finished_idx');
            $table->index(['user_id', 'question_package_id', 'status'], 'qa_user_package_status_idx');
            $table->index(['course_id', 'question_package_id', 'status'], 'qa_course_package_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropIndex('qa_status_finished_idx');
            $table->dropIndex('qa_user_package_status_idx');
            $table->dropIndex('qa_course_package_status_idx');
        });
    }
};
