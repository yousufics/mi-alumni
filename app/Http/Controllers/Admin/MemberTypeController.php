<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberType;
use App\Models\MembershipRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberTypeController extends Controller
{
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'fee' => ['required', 'integer', 'min:0', 'max:10000000'],
            'description' => ['nullable', 'string', 'max:300'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],
        ], [
            'required' => ':attribute আবশ্যক।',
            'integer' => ':attribute সংখ্যায় লিখুন।',
            'max' => ':attribute অনেক বড় হয়ে গেছে।',
        ], [
            'name' => 'টাইপের নাম', 'fee' => 'ফি', 'description' => 'বিবরণ', 'sort_order' => 'ক্রম',
        ]);

        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }

    public function index(): Response
    {
        $used = MembershipRequest::selectRaw('member_type_id, count(*) as total')
            ->whereNotNull('member_type_id')->groupBy('member_type_id')->pluck('total', 'member_type_id');

        return Inertia::render('Admin/MemberTypes', [
            'types' => MemberType::orderBy('sort_order')->orderBy('id')->get()->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'fee' => $t->fee,
                'description' => $t->description,
                'sort_order' => $t->sort_order,
                'is_active' => $t->is_active,
                'members' => (int) ($used[$t->id] ?? 0),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        MemberType::create($this->validated($request));

        return back()->with('success', 'নতুন মেম্বার টাইপ যোগ করা হয়েছে।');
    }

    /** ফি বদলালে আগের আবেদনের সংরক্ষিত ফি বদলায় না, শুধু নতুন আবেদনে প্রযোজ্য */
    public function update(Request $request, MemberType $memberType): RedirectResponse
    {
        $memberType->update($this->validated($request));

        return back()->with('success', 'মেম্বার টাইপ হালনাগাদ হয়েছে।');
    }

    public function destroy(MemberType $memberType): RedirectResponse
    {
        if (MembershipRequest::where('member_type_id', $memberType->id)->exists()) {
            return back()->withErrors(['delete' => 'এই টাইপে সদস্য আছে, তাই মোছা যাবে না। চাইলে "সক্রিয়" বন্ধ করে দিন।']);
        }

        $memberType->delete();

        return back()->with('success', 'মেম্বার টাইপ মুছে ফেলা হয়েছে।');
    }
}
