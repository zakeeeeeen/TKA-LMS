<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('questions', 'question_type')) {
            DB::statement("ALTER TABLE questions MODIFY question_type VARCHAR(255) NOT NULL DEFAULT 'single_choice'");
        }

        Schema::table('questions', function (Blueprint $table) {
            if (! Schema::hasColumn('questions', 'correct_options')) {
                $table->json('correct_options')->nullable()->after('correct_option');
            }

            if (! Schema::hasColumn('questions', 'matrix_left_label')) {
                $table->string('matrix_left_label')->nullable()->after('answer_text');
            }

            if (! Schema::hasColumn('questions', 'matrix_right_label')) {
                $table->string('matrix_right_label')->nullable()->after('matrix_left_label');
            }

            if (! Schema::hasColumn('questions', 'matrix_rows')) {
                $table->json('matrix_rows')->nullable()->after('matrix_right_label');
            }
        });

        DB::table('questions')
            ->where('question_type', 'multiple_choice')
            ->update(['question_type' => 'single_choice']);

        Schema::table('quiz_answers', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_answers', 'selected_options')) {
                $table->json('selected_options')->nullable()->after('selected_option');
            }

            if (! Schema::hasColumn('quiz_answers', 'matrix_answers')) {
                $table->json('matrix_answers')->nullable()->after('selected_options');
            }
        });

        Schema::table('exam_answers', function (Blueprint $table) {
            if (! Schema::hasColumn('exam_answers', 'selected_options')) {
                $table->json('selected_options')->nullable()->after('selected_option');
            }

            if (! Schema::hasColumn('exam_answers', 'matrix_answers')) {
                $table->json('matrix_answers')->nullable()->after('selected_options');
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('questions', 'question_type')) {
            DB::statement("ALTER TABLE questions MODIFY question_type VARCHAR(255) NOT NULL DEFAULT 'multiple_choice'");
        }

        DB::table('questions')
            ->where('question_type', 'single_choice')
            ->update(['question_type' => 'multiple_choice']);

        Schema::table('questions', function (Blueprint $table) {
            $dropColumns = [];

            if (Schema::hasColumn('questions', 'correct_options')) {
                $dropColumns[] = 'correct_options';
            }

            if (Schema::hasColumn('questions', 'matrix_left_label')) {
                $dropColumns[] = 'matrix_left_label';
            }

            if (Schema::hasColumn('questions', 'matrix_right_label')) {
                $dropColumns[] = 'matrix_right_label';
            }

            if (Schema::hasColumn('questions', 'matrix_rows')) {
                $dropColumns[] = 'matrix_rows';
            }

            if ($dropColumns !== []) {
                $table->dropColumn($dropColumns);
            }
        });

        Schema::table('quiz_answers', function (Blueprint $table) {
            $dropColumns = [];

            if (Schema::hasColumn('quiz_answers', 'selected_options')) {
                $dropColumns[] = 'selected_options';
            }

            if (Schema::hasColumn('quiz_answers', 'matrix_answers')) {
                $dropColumns[] = 'matrix_answers';
            }

            if ($dropColumns !== []) {
                $table->dropColumn($dropColumns);
            }
        });

        Schema::table('exam_answers', function (Blueprint $table) {
            $dropColumns = [];

            if (Schema::hasColumn('exam_answers', 'selected_options')) {
                $dropColumns[] = 'selected_options';
            }

            if (Schema::hasColumn('exam_answers', 'matrix_answers')) {
                $dropColumns[] = 'matrix_answers';
            }

            if ($dropColumns !== []) {
                $table->dropColumn($dropColumns);
            }
        });
    }
};
