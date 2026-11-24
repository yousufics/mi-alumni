<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CommitteeController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\MemberTypeController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\RequestController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

/* ---------- পাবলিক সাইট ---------- */
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/committees', [PageController::class, 'committees'])->name('committees');
Route::get('/committees/advisors', [PageController::class, 'advisors'])->name('committees.advisors');
Route::get('/committees/members', [PageController::class, 'generalMembers'])->name('committees.members');
Route::get('/committees/former', [PageController::class, 'former'])->name('committees.former');
Route::get('/posts', [PostController::class, 'index'])->name('posts');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::get('/events', [PageController::class, 'events'])->name('events');
Route::get('/donate', [PageController::class, 'donate'])->name('donate');
Route::post('/donate', [DonationController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('donate.store');

Route::get('/membership', [MembershipController::class, 'create'])->name('membership');
Route::post('/membership', [MembershipController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('membership.store');

Route::get('/contact', [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');

/* ---------- অ্যাডমিন ---------- */
Route::get('/admin/login', [AuthController::class, 'create'])->middleware('guest')->name('login');
Route::post('/admin/login', [AuthController::class, 'store'])->middleware(['guest', 'throttle:6,1'])->name('login.store');
Route::post('/admin/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('requests', [RequestController::class, 'index'])->name('requests');
    Route::get('requests/export', [RequestController::class, 'export'])->name('requests.export');
    Route::patch('requests/{membershipRequest}', [RequestController::class, 'update'])->name('requests.update');
    Route::patch('requests/{membershipRequest}/display', [RequestController::class, 'display'])->name('requests.display');
    Route::delete('requests/{membershipRequest}', [RequestController::class, 'destroy'])->name('requests.destroy');

    Route::get('content', [ContentController::class, 'index'])->name('content');
    Route::put('content/{group}', [ContentController::class, 'update'])->name('content.update');

    Route::get('member-types', [MemberTypeController::class, 'index'])->name('member-types');
    Route::post('member-types', [MemberTypeController::class, 'store'])->name('member-types.store');
    Route::put('member-types/{memberType}', [MemberTypeController::class, 'update'])->name('member-types.update');
    Route::delete('member-types/{memberType}', [MemberTypeController::class, 'destroy'])->name('member-types.destroy');

    Route::get('payments', [PaymentController::class, 'index'])->name('payments');
    Route::put('payments', [PaymentController::class, 'update'])->name('payments.update');

    Route::get('donations', [AdminDonationController::class, 'index'])->name('donations');
    Route::get('donations/export', [AdminDonationController::class, 'export'])->name('donations.export');
    Route::patch('donations/{donation}', [AdminDonationController::class, 'update'])->name('donations.update');
    Route::delete('donations/{donation}', [AdminDonationController::class, 'destroy'])->name('donations.destroy');

    Route::get('messages', [MessageController::class, 'index'])->name('messages');
    Route::patch('messages/{contactMessage}', [MessageController::class, 'update'])->name('messages.update');
    Route::delete('messages/{contactMessage}', [MessageController::class, 'destroy'])->name('messages.destroy');

    Route::get('committee', [CommitteeController::class, 'index'])->name('committee');
    Route::post('committee', [CommitteeController::class, 'store'])->name('committee.store');
    Route::put('committee/{committeeMember}', [CommitteeController::class, 'update'])->name('committee.update');
    Route::delete('committee/{committeeMember}', [CommitteeController::class, 'destroy'])->name('committee.destroy');

    Route::get('posts', [AdminPostController::class, 'index'])->name('posts');
    Route::post('posts', [AdminPostController::class, 'store'])->name('posts.store');
    Route::put('posts/{post}', [AdminPostController::class, 'update'])->name('posts.update');
    Route::delete('posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');

    Route::get('events', [EventController::class, 'index'])->name('events');
    Route::post('events', [EventController::class, 'store'])->name('events.store');
    Route::put('events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
});
