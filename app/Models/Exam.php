<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = ['name', 'user_id', 'question_package_id', 'start_time', 'end_time', 'duration', 'status'];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questionPackage()
    {
        return $this->belongsTo(QuestionPackage::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'exam_user');
    }

    public function examAnswers()
    {
        return $this->hasMany(ExamAnswer::class);
    }

    public function examResult()
    {
        return $this->hasOne(ExamResult::class)->latestOfMany();
    }

    public function examResults()
    {
        return $this->hasMany(ExamResult::class);
    }
}
