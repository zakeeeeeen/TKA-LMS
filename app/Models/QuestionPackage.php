<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionPackage extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'duration',
        'total_questions',
        'min_score',
        'shuffle_questions',
        'shuffle_options',
        'active',
        'description'
    ];

    protected $casts = [
        'shuffle_questions' => 'boolean',
        'shuffle_options' => 'boolean',
        'active' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'question_package_question')
            ->withPivot('position')
            ->orderBy('question_package_question.position');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_question_package')
            ->withPivot('position')
            ->orderBy('course_question_package.position');
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
