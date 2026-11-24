<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Contact');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'subject' => ['nullable', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:3000'],
        ], [
            'required' => ':attribute আবশ্যক।',
            'email' => 'সঠিক ইমেইল ঠিকানা দিন।',
            'max' => ':attribute অনেক বড় হয়ে গেছে।',
        ], [
            'name' => 'নাম',
            'email' => 'ইমেইল',
            'subject' => 'বিষয়',
            'message' => 'বার্তা',
        ]);

        ContactMessage::create($data);

        return back()->with('success', 'আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!');
    }
}
