<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'chapter_id')) {
                $table->dropConstrainedForeignId('chapter_id');
            }

            if (Schema::hasColumn('questions', 'difficulty')) {
                $table->dropColumn('difficulty');
            }
        });

        Schema::dropIfExists('chapters');
    }

    public function down(): void
    {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('questions', function (Blueprint $table) {
            if (! Schema::hasColumn('questions', 'difficulty')) {
                $table->enum('difficulty', ['mudah', 'sedang', 'sulit'])->default('sedang')->after('user_id');
            }

            if (! Schema::hasColumn('questions', 'chapter_id')) {
                $table->foreignId('chapter_id')->nullable()->after('subject_id')->constrained()->nullOnDelete();
            }
        });
    }
};
