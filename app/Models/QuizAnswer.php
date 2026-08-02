<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAnswer extends Model
{
    protected $fillable = [
        'quiz_attempt_id',
        'question_id',
        'selected_option',
        'selected_options',
        'matrix_answers',
        'answer_text',
        'is_correct',
        'is_marked',
    ];

    protected $casts = [
        'selected_options' => 'array',
        'matrix_answers' => 'array',
        'is_correct' => 'boolean',
        'is_marked' => 'boolean',
    ];

    public function quizAttempt()
    {
        return $this->belongsTo(QuizAttempt::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
