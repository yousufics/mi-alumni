<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommitteeMember;
use App\Support\Positions;
use App\Support\Uploads;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CommitteeController extends Controller
{
    private function rules(Request $request): array
    {
        $needsSession = ! Positions::isAdvisory($request->input('position'));

        return [
            'position' => ['required', Rule::in(Positions::keys())],
            'session' => [$needsSession ? 'required' : 'nullable', 'string', 'max:60'],
            'role' => ['nullable', 'string', 'max:120'],
            'name' => ['required', 'string', 'max:150'],
            'batch' => ['nullable', 'string', 'max:60'],
            'is_current' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_photo' => ['boolean'],
        ];
    }

    private function messages(): array
    {
        return [
            'required' => ':attribute আবশ্যক।',
            'max' => ':attribute অনেক বড় হয়ে গেছে।',
            'integer' => ':attribute সংখ্যা হতে হবে।',
            'photo.image' => 'ছবি হিসেবে সঠিক ফাইল দিন।',
            'photo.mimes' => 'ছবি jpg, png বা webp হতে হবে।',
            'photo.max' => 'ছবি ২ MB-এর বেশি হতে পারবে না।',
            'in' => 'সঠিক পজিশন বাছাই করুন।',
        ];
    }

    private function attributes(): array
    {
        return ['position' => 'পজিশন', 'session' => 'মেয়াদ', 'role' => 'পদবি', 'name' => 'নাম', 'batch' => 'ব্যাচ', 'sort_order' => 'ক্রম'];
    }

    /** ফর্মের ডাটা সাজিয়ে মডেলে সেভযোগ্য করে */
    private function prepare(Request $request, ?CommitteeMember $existing = null): array
    {
        $data = $request->validate($this->rules($request), $this->messages(), $this->attributes());

        $data['role'] = $data['role'] ?: Positions::label($data['position']);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        // উপদেষ্টা/দাতা সবসময় "বর্তমান" ধরা হয়
        if (Positions::isAdvisory($data['position'])) {
            $data['is_current'] = true;
        }

        if ($request->hasFile('photo')) {
            $data['photo'] = Uploads::store($request->file('photo'), 'committee');
            Uploads::delete($existing?->photo);
        } elseif ($existing && ! empty($data['remove_photo'])) {
            Uploads::delete($existing->photo);
            $data['photo'] = null;
        }

        unset($data['remove_photo']);

        return $data;
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Committee', [
            'positions' => Positions::options(),
            'members' => CommitteeMember::orderByDesc('is_current')
                ->orderByDesc('session')->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'position' => $m->position,
                    'position_label' => Positions::label($m->position),
                    'advisory' => Positions::isAdvisory($m->position),
                    'session' => $m->session,
                    'role' => $m->role,
                    'name' => $m->name,
                    'batch' => $m->batch,
                    'is_current' => $m->is_current,
                    'sort_order' => $m->sort_order,
                    'photo' => $m->photo_url,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CommitteeMember::create($this->prepare($request));

        return back()->with('success', 'সদস্য যোগ করা হয়েছে।');
    }

    public function update(Request $request, CommitteeMember $committeeMember): RedirectResponse
    {
        $committeeMember->update($this->prepare($request, $committeeMember));

        return back()->with('success', 'সদস্যের তথ্য হালনাগাদ হয়েছে।');
    }

    public function destroy(CommitteeMember $committeeMember): RedirectResponse
    {
        Uploads::delete($committeeMember->photo);
        $committeeMember->delete();

        return back()->with('success', 'সদস্য মুছে ফেলা হয়েছে।');
    }
}
