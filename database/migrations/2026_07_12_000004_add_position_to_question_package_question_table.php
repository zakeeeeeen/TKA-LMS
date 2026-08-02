<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('question_package_question', function (Blueprint $table) {
            $table->unsignedInteger('position')->default(0)->after('question_id');
        });

        $rows = DB::table('question_package_question')
            ->orderBy('question_package_id')
            ->orderBy('question_id')
            ->get();

        $positions = [];

        foreach ($rows as $row) {
            $packageId = $row->question_package_id;
            $positions[$packageId] = ($positions[$packageId] ?? 0) + 1;

            DB::table('question_package_question')
                ->where('question_package_id', $packageId)
                ->where('question_id', $row->question_id)
                ->update(['position' => $positions[$packageId]]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_package_question', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
