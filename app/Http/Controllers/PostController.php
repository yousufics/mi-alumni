<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Support\Bn;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Posts', [
            'posts' => Post::where('is_published', true)
                ->orderByDesc('published_at')->orderByDesc('id')
                ->paginate(9)->through(fn (Post $p) => $p->card()),
        ]);
    }

    public function show(Post $post): Response
    {
        abort_unless($post->is_published, 404);

        return Inertia::render('PostShow', [
            'post' => [
                ...$post->card(),
                'body' => $post->body,
                'date' => Bn::date($post->published_at ?? $post->created_at),
            ],
            'related' => Post::where('is_published', true)->where('id', '!=', $post->id)
                ->orderByDesc('published_at')->orderByDesc('id')->limit(3)->get()
                ->map(fn (Post $p) => $p->card())->all(),
        ]);
    }
}
