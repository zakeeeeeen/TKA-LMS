<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseContentGroup extends Model
{
    protected $fillable = [
        'course_id',
        'name',
        'position',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function materials()
    {
        return $this->hasMany(CourseMaterial::class, 'group_id')->orderBy('position');
    }
}

