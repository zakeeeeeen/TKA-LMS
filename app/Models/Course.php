<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Course extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'thumbnail',
        'active',
        'access_type',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    public function getThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail) {
            return null;
        }

        if (str_starts_with($this->thumbnail, 'http://') || str_starts_with($this->thumbnail, 'https://')) {
            return $this->thumbnail;
        }

        $path = ltrim($this->thumbnail, '/');

        if (str_starts_with($path, 'storage/')) {
            return '/'.$path;
        }

        return '/storage/'.$path;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function materials()
    {
        return $this->hasMany(CourseMaterial::class)->orderBy('position');
    }

    public function courseMaterials()
    {
        return $this->materials();
    }

    public function quizzes()
    {
        return $this->belongsToMany(QuestionPackage::class, 'course_question_package')
            ->withPivot(['position', 'group_id'])
            ->orderBy('course_question_package.position');
    }

    public function contentGroups()
    {
        return $this->hasMany(CourseContentGroup::class)->orderBy('position');
    }

    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
            ->withPivot(['id', 'status', 'requested_at', 'approved_at', 'approved_by'])
            ->withTimestamps();
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
