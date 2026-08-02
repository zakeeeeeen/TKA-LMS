<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $appends = [
        'image_url',
        'option_a_image_url',
        'option_b_image_url',
        'option_c_image_url',
        'option_d_image_url',
        'option_e_image_url',
    ];

    protected $fillable = [
        'subject_id',
        'grade_level',
        'user_id',
        'question_type',
        'question_text',
        'image_path',
        'option_a',
        'option_a_image_path',
        'option_b',
        'option_b_image_path',
        'option_c',
        'option_c_image_path',
        'option_d',
        'option_d_image_path',
        'option_e',
        'option_e_image_path',
        'correct_option',
        'correct_options',
        'answer_text',
        'matrix_left_label',
        'matrix_right_label',
        'matrix_rows',
        'explanation'
    ];

    protected $casts = [
        'correct_options' => 'array',
        'matrix_rows' => 'array',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->buildStorageUrl($this->image_path);
    }

    public function getOptionAImageUrlAttribute(): ?string
    {
        return $this->buildStorageUrl($this->option_a_image_path);
    }

    public function getOptionBImageUrlAttribute(): ?string
    {
        return $this->buildStorageUrl($this->option_b_image_path);
    }

    public function getOptionCImageUrlAttribute(): ?string
    {
        return $this->buildStorageUrl($this->option_c_image_path);
    }

    public function getOptionDImageUrlAttribute(): ?string
    {
        return $this->buildStorageUrl($this->option_d_image_path);
    }

    public function getOptionEImageUrlAttribute(): ?string
    {
        return $this->buildStorageUrl($this->option_e_image_path);
    }

    private function buildStorageUrl(?string $pathValue): ?string
    {
        if (! $pathValue) {
            return null;
        }

        if (str_starts_with($pathValue, 'http://') || str_starts_with($pathValue, 'https://')) {
            return $pathValue;
        }

        $path = ltrim($pathValue, '/');

        if (str_starts_with($path, 'storage/')) {
            return '/' . $path;
        }

        return '/storage/' . $path;
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questionPackages()
    {
        return $this->belongsToMany(QuestionPackage::class, 'question_package_question')
            ->withPivot('position');
    }

    public function examAnswers()
    {
        return $this->hasMany(ExamAnswer::class);
    }
}
