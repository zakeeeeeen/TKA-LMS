<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('exam_results', 'user_id')) {
            Schema::table('exam_results', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->after('exam_id')->constrained()->nullOnDelete();
            });
        }

        DB::table('exam_results')
            ->whereNull('user_id')
            ->orderBy('id')
            ->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    $studentId = DB::table('exam_user')->where('exam_id', $row->exam_id)->value('user_id');
                    if (! $studentId) {
                        continue;
                    }

                    DB::table('exam_results')
                        ->where('id', $row->id)
                        ->update(['user_id' => $studentId]);
                }
            });

        Schema::table('exam_results', function (Blueprint $table) {
            $table->unique(['exam_id', 'user_id'], 'exam_results_exam_id_user_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropUnique('exam_results_exam_id_user_id_unique');
        });

        if (Schema::hasColumn('exam_results', 'user_id')) {
            Schema::table('exam_results', function (Blueprint $table) {
                $table->dropConstrainedForeignId('user_id');
            });
        }
    }
};

