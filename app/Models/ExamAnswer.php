<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model
{
    protected $fillable = ['exam_id', 'user_id', 'question_id', 'selected_option', 'selected_options', 'matrix_answers', 'answer_text', 'is_correct', 'is_marked'];

    protected $casts = [
        'selected_options' => 'array',
        'matrix_answers' => 'array',
        'is_correct' => 'boolean',
        'is_marked' => 'boolean'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
