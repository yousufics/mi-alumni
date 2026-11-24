<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Support\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DonationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->filled('trx_id')) {
            $request->merge(['trx_id' => strtoupper(preg_replace('/\s+/', '', (string) $request->input('trx_id')))]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'amount' => ['required', 'integer', 'min:1', 'max:100000000'],
            'payment_method' => ['required', Rule::in(Payment::options())],
            'trx_id' => [
                'required', 'string', 'max:60', 'regex:/^[A-Za-z0-9\-_\/]+$/',
                Rule::unique('donations', 'trx_id'),
                Rule::unique('membership_requests', 'trx_id'),
            ],
            'message' => ['nullable', 'string', 'max:1000'],
        ], [
            'required' => ':attribute আবশ্যক।',
            'email' => 'সঠিক ইমেইল ঠিকানা দিন।',
            'integer' => 'অনুদানের পরিমাণ সংখ্যায় (টাকায়) লিখুন।',
            'min' => 'অনুদানের পরিমাণ কমপক্ষে ১ টাকা হতে হবে।',
            'max' => ':attribute অনেক বড় হয়ে গেছে।',
            'in' => 'সঠিক পেমেন্ট মাধ্যম বাছাই করুন।',
            'unique' => 'এই ট্রানজেকশন আইডি আগেই জমা দেওয়া হয়েছে।',
            'trx_id.regex' => 'ট্রানজেকশন আইডি ইংরেজি অক্ষর ও সংখ্যায় লিখুন।',
        ], [
            'name' => 'নাম',
            'phone' => 'মোবাইল নম্বর',
            'amount' => 'অনুদানের পরিমাণ',
            'payment_method' => 'পেমেন্ট মাধ্যম',
            'trx_id' => 'ট্রানজেকশন আইডি',
            'message' => 'বার্তা',
        ]);

        Donation::create($data);

        return back()->with('success', 'অনুদান গ্রহণ করা হয়েছে।');
    }
}
