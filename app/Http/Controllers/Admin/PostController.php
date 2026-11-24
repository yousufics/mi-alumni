<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Support\Uploads;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    private function prepare(Request $request, ?Post $existing = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:220'],
            'tag' => ['nullable', 'string', 'max:60'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string', 'max:50000'],
            'published_at' => ['nullable', 'date'],
            'is_published' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'remove_image' => ['boolean'],
        ], [
            'required' => ':attribute আবশ্যক।',
            'max' => ':attribute অনেক বড় হয়ে গেছে।',
            'date' => 'সঠিক তারিখ দিন।',
            'image.image' => 'ছবি হিসেবে সঠিক ফাইল দিন।',
            'image.mimes' => 'ছবি jpg, png বা webp হতে হবে।',
            'image.max' => 'ছবি ৩ MB-এর বেশি হতে পারবে না।',
        ], [
            'title' => 'শিরোনাম', 'tag' => 'ট্যাগ', 'excerpt' => 'সারসংক্ষেপ', 'body' => 'বিস্তারিত',
        ]);

        $data['published_at'] = $data['published_at'] ?? now()->toDateString();

        if ($request->hasFile('image')) {
            $data['image'] = Uploads::store($request->file('image'), 'posts');
            Uploads::delete($existing?->image);
        } elseif ($existing && ! empty($data['remove_image'])) {
            Uploads::delete($existing->image);
            $data['image'] = null;
        }

        unset($data['remove_image']);

        return $data;
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Posts', [
            'posts' => Post::orderByDesc('published_at')->orderByDesc('id')->get()->map(fn (Post $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'tag' => $p->tag,
                'excerpt' => $p->excerpt,
                'body' => $p->body,
                'published_at' => optional($p->published_at)->format('Y-m-d'),
                'is_published' => $p->is_published,
                'image' => $p->image_url,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Post::create($this->prepare($request));

        return back()->with('success', 'নিবন্ধ যোগ করা হয়েছে।');
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $post->update($this->prepare($request, $post));

        return back()->with('success', 'নিবন্ধ হালনাগাদ হয়েছে।');
    }

    public function destroy(Post $post): RedirectResponse
    {
        Uploads::delete($post->image);
        $post->delete();

        return back()->with('success', 'নিবন্ধ মুছে ফেলা হয়েছে।');
    }
}
