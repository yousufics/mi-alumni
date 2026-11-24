<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Messages', [
            'messages' => ContactMessage::latest()->paginate(15)->through(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'subject' => $m->subject,
                'message' => $m->message,
                'read' => $m->read_at !== null,
                'at' => $m->created_at->format('d/m/Y h:i A'),
            ]),
        ]);
    }

    /** পড়া / না-পড়া টগল */
    public function update(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->update(['read_at' => $contactMessage->read_at ? null : now()]);

        return back();
    }

    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        return back()->with('success', 'বার্তাটি মুছে ফেলা হয়েছে।');
    }
}
