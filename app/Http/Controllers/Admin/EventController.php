<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'date_label' => ['required', 'string', 'max:120'],
            'place' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:3000'],
            'is_published' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ];
    }

    private function messages(): array
    {
        return ['required' => ':attribute আবশ্যক।', 'max' => ':attribute অনেক বড় হয়ে গেছে।', 'integer' => ':attribute সংখ্যা হতে হবে।'];
    }

    private function attributes(): array
    {
        return ['title' => 'শিরোনাম', 'date_label' => 'তারিখ', 'place' => 'স্থান', 'description' => 'বিবরণ', 'sort_order' => 'ক্রম'];
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Events', [
            'events' => Event::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules(), $this->messages(), $this->attributes());
        $data['sort_order'] = $data['sort_order'] ?? 0;
        Event::create($data);

        return back()->with('success', 'ইভেন্ট যোগ করা হয়েছে।');
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $data = $request->validate($this->rules(), $this->messages(), $this->attributes());
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $event->update($data);

        return back()->with('success', 'ইভেন্ট হালনাগাদ হয়েছে।');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return back()->with('success', 'ইভেন্ট মুছে ফেলা হয়েছে।');
    }
}
