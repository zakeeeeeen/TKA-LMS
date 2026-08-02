<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_content_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('position')->default(1);
            $table->timestamps();

            $table->unique(['course_id', 'name']);
            $table->index(['course_id', 'position']);
        });

        Schema::table('course_materials', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->constrained('course_content_groups')->nullOnDelete();
            $table->index(['course_id', 'group_id']);
        });

        Schema::table('course_question_package', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->constrained('course_content_groups')->nullOnDelete();
            $table->index(['course_id', 'group_id']);
        });

        $courseIds = DB::table('courses')->pluck('id')->all();

        foreach ($courseIds as $courseId) {
            $groupId = DB::table('course_content_groups')->insertGetId([
                'course_id' => $courseId,
                'name' => 'Umum',
                'position' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('course_materials')
                ->where('course_id', $courseId)
                ->whereNull('group_id')
                ->update(['group_id' => $groupId]);

            DB::table('course_question_package')
                ->where('course_id', $courseId)
                ->whereNull('group_id')
                ->update(['group_id' => $groupId]);
        }
    }

    public function down(): void
    {
        Schema::table('course_question_package', function (Blueprint $table) {
            $table->dropConstrainedForeignId('group_id');
        });

        Schema::table('course_materials', function (Blueprint $table) {
            $table->dropConstrainedForeignId('group_id');
        });

        Schema::dropIfExists('course_content_groups');
    }
};

