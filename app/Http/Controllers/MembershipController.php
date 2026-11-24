<?php

namespace App\Http\Controllers;

use App\Models\MemberType;
use App\Models\MembershipRequest;
use App\Support\Content;
use App\Support\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembershipController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Membership', [
            'types' => MemberType::where('is_active', true)
                ->orderBy('sort_order')->orderBy('id')->get(['id', 'name', 'fee', 'description']),
            'content' => Content::get('membership'),
            'payment' => Payment::data(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $hasTypes = MemberType::where('is_active', true)->exists();

        // trxID বড় হাতের অক্ষরে ও ফাঁকা ছাড়া সংরক্ষণ
        if ($request->filled('trx_id')) {
            $request->merge(['trx_id' => strtoupper(preg_replace('/\s+/', '', (string) $request->input('trx_id')))]);
        }
        $payNow = $request->input('pay_option') === 'now';

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'batch' => ['required', 'string', 'max:20'],
            'member_type_id' => [
                $hasTypes ? 'required' : 'nullable',
                Rule::exists('member_types', 'id')->where('is_active', true),
            ],
            'profession' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:500'],
            'message' => ['nullable', 'string', 'max:2000'],
            'pay_option' => ['nullable', Rule::in(['now', 'later'])],
            'payment_method' => [Rule::requiredIf($payNow), 'nullable', Rule::in(Payment::options())],
            'trx_id' => [
                Rule::requiredIf($payNow), 'nullable', 'string', 'max:60', 'regex:/^[A-Za-z0-9\-_\/]+$/',
                Rule::unique('membership_requests', 'trx_id'),
                Rule::unique('donations', 'trx_id'),
            ],
        ], [
            'required' => ':attribute আবশ্যক।',
            'email' => 'সঠিক ইমেইল ঠিকানা দিন।',
            'max' => ':attribute অনেক বড় হয়ে গেছে।',
            'exists' => 'সঠিক মেম্বার টাইপ বাছাই করুন।',
            'in' => 'সঠিক পেমেন্ট মাধ্যম বাছাই করুন।',
            'unique' => 'এই ট্রানজেকশন আইডি আগেই জমা দেওয়া হয়েছে।',
            'trx_id.regex' => 'ট্রানজেকশন আইডি ইংরেজি অক্ষর ও সংখ্যায় লিখুন।',
        ], [
            'name' => 'নাম',
            'email' => 'ইমেইল',
            'phone' => 'মোবাইল নম্বর',
            'batch' => 'ব্যাচ',
            'member_type_id' => 'মেম্বার টাইপ',
            'profession' => 'পেশা',
            'address' => 'ঠিকানা',
            'message' => 'বার্তা',
            'payment_method' => 'পেমেন্ট মাধ্যম',
            'trx_id' => 'ট্রানজেকশন আইডি',
        ]);

        unset($data['pay_option']);

        // "পরে পরিশোধ করব" হলে পেমেন্টের তথ্য রাখা হয় না
        if (! $payNow) {
            $data['payment_method'] = null;
            $data['trx_id'] = null;
        }

        // আবেদনের সময়ের ফি সংরক্ষণ — পরে টাইপের ফি বদলালেও এই আবেদনের ফি অপরিবর্তিত থাকবে
        if (! empty($data['member_type_id'])) {
            $data['fee_amount'] = MemberType::find($data['member_type_id'])->fee;
        }

        MembershipRequest::create($data);

        return back()->with('success', $payNow
            ? 'আপনার আবেদন ও ট্রানজেকশন আইডি গ্রহণ করা হয়েছে। পেমেন্ট যাচাই করে কমিটি আপনার সঙ্গে যোগাযোগ করবে।'
            : 'আপনার সদস্যপদের আবেদন গ্রহণ করা হয়েছে। অনুমোদনের পর ফি পরিশোধ করতে পারবেন, শীঘ্রই আমরা যোগাযোগ করব।');
    }
}
