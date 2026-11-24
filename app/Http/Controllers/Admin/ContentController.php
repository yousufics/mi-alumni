<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Content;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    private function rules(string $group): array
    {
        return match ($group) {
            'pillars' => [
                'items' => ['required', 'array', 'min:1', 'max:8'],
                'items.*.title' => ['required', 'string', 'max:100'],
                'items.*.text' => ['required', 'string', 'max:500'],
            ],
            'about' => [
                'intro' => ['required', 'string', 'max:3000'],
                'mission' => ['required', 'string', 'max:2000'],
                'vision' => ['required', 'string', 'max:2000'],
            ],
            'activities' => [
                'items' => ['required', 'array', 'min:1', 'max:20'],
                'items.*' => ['required', 'string', 'max:300'],
            ],
            'donation' => [
                'intro' => ['required', 'string', 'max:2000'],
                'thanks' => ['required', 'string', 'max:1000'],
            ],
            'contact' => [
                'phone' => ['nullable', 'string', 'max:60'],
                'email' => ['nullable', 'email', 'max:120'],
                'whatsapp' => ['nullable', 'string', 'max:30'],
                'address' => ['nullable', 'string', 'max:300'],
                'facebook' => ['nullable', 'string', 'max:300'],
                'youtube' => ['nullable', 'string', 'max:300'],
            ],
            'membership' => [
                'intro' => ['nullable', 'string', 'max:1500'],
                'payment_note' => ['nullable', 'string', 'max:1500'],
            ],
            default => abort(404),
        };
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Content', ['content' => Content::all()]);
    }

    public function update(Request $request, string $group): RedirectResponse
    {
        $data = $request->validate($this->rules($group), [
            'required' => 'ঘরটি ফাঁকা রাখা যাবে না।',
            'email' => 'সঠিক ইমেইল ঠিকানা দিন।',
            'max' => 'লেখা অনেক বড় হয়ে গেছে।',
            'present' => 'তালিকাটি পাঠানো হয়নি।',
            'min' => 'কমপক্ষে একটি আইটেম রাখুন।',
        ]);

        // লিস্টের ইনডেক্স সাজিয়ে রাখা
        foreach (['items', 'methods'] as $k) {
            if (isset($data[$k])) {
                $data[$k] = array_values($data[$k]);
            }
        }

        Setting::updateOrCreate(['key' => $group], ['value' => $data]);

        return back()->with('success', 'পরিবর্তন সংরক্ষিত হয়েছে।');
    }
}
