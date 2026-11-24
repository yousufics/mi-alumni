<?php

namespace Tests\Feature;

use App\Models\CommitteeMember;
use App\Models\Event;
use App\Models\MembershipRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_non_admin_user_gets_403(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => false]))->get('/admin')->assertForbidden();
    }

    public function test_admin_pages_load(): void
    {
        $this->actingAs($this->admin());
        foreach (['/admin', '/admin/requests', '/admin/messages', '/admin/committee', '/admin/events', '/admin/posts', '/admin/content', '/admin/member-types'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_admin_can_approve_request(): void
    {
        $r = MembershipRequest::create([
            'name' => 'টেস্ট', 'email' => 'a@b.com', 'phone' => '017', 'batch' => '2010',
        ]);

        $this->actingAs($this->admin())
            ->patch("/admin/requests/{$r->id}", ['status' => 'approved'])
            ->assertRedirect();

        $this->assertSame('approved', $r->fresh()->status);
        $this->assertNotNull($r->fresh()->reviewed_at);
    }

    public function test_admin_can_manage_committee_and_events(): void
    {
        $this->actingAs($this->admin());

        $this->post('/admin/committee', [
            'position' => 'president', 'session' => '২০২৬', 'name' => 'নাম', 'is_current' => true,
        ])->assertRedirect();
        $this->assertSame(1, CommitteeMember::count());

        $this->post('/admin/events', [
            'title' => 'সভা', 'date_label' => '১ জানুয়ারি', 'is_published' => true,
        ])->assertRedirect();
        $this->assertSame(1, Event::count());

        $this->get('/committees')->assertOk();
        $this->get('/events')->assertOk();
    }

    public function test_public_cannot_post_admin_routes(): void
    {
        $this->post('/admin/events', ['title' => 'x', 'date_label' => 'y'])->assertRedirect('/admin/login');
        $this->assertSame(0, Event::count());
    }

    public function test_admin_can_login(): void
    {
        $u = User::factory()->create(['is_admin' => true, 'password' => bcrypt('secret-pass-1')]);

        $this->post('/admin/login', ['email' => $u->email, 'password' => 'secret-pass-1'])
            ->assertRedirect('/admin');
        $this->assertAuthenticatedAs($u);
    }
}
