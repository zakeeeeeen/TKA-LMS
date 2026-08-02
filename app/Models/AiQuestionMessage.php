<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiQuestionMessage extends Model
{
    protected $fillable = [
        'user_id',
        'exam_id',
        'question_id',
        'role',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}

