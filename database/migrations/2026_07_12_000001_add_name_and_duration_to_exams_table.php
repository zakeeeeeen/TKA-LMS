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
        Schema::table('exams', function (Blueprint $table) {
            if (! Schema::hasColumn('exams', 'name')) {
                $table->string('name')->nullable()->after('id');
            }

            if (! Schema::hasColumn('exams', 'duration')) {
                $table->integer('duration')->default(60)->after('end_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('exams', 'name')) {
                $columnsToDrop[] = 'name';
            }

            if (Schema::hasColumn('exams', 'duration')) {
                $columnsToDrop[] = 'duration';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
