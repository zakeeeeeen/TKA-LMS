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
        if (! Schema::hasColumn('exam_answers', 'answer_text')) {
            Schema::table('exam_answers', function (Blueprint $table) {
                $table->text('answer_text')->nullable()->after('selected_option');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('exam_answers', 'answer_text')) {
            Schema::table('exam_answers', function (Blueprint $table) {
                $table->dropColumn('answer_text');
            });
        }
    }
};

