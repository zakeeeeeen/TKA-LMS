<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'question_package_id',
        'score',
        'total_correct',
        'total_wrong',
        'total_empty',
        'duration',
        'status',
        'started_at',
        'end_time',
        'finished_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'end_time' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function questionPackage()
    {
        return $this->belongsTo(QuestionPackage::class);
    }

    public function answers()
    {
        return $this->hasMany(QuizAnswer::class);
    }
}
