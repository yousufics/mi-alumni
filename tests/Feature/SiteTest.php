<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\MemberType;
use App\Models\MembershipRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_public_pages_load(): void
    {
        foreach (['/', '/about', '/committees', '/committees/advisors', '/committees/members', '/committees/former', '/posts', '/events', '/donate', '/membership', '/contact'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_membership_request_is_saved(): void
    {
        $this->post('/membership', [
            'name' => 'টেস্ট ইউজার',
            'email' => 'test@example.com',
            'phone' => '01700000000',
            'batch' => '2010',
            'member_type_id' => MemberType::first()->id,
        ])->assertRedirect();

        $this->assertDatabaseCount('membership_requests', 1);
        $this->assertSame('2010', MembershipRequest::first()->batch);
    }

    public function test_membership_requires_fields(): void
    {
        $this->post('/membership', [])->assertSessionHasErrors(['name', 'email', 'phone', 'batch', 'member_type_id']);
    }

    public function test_contact_message_is_saved(): void
    {
        $this->post('/contact', [
            'name' => 'টেস্ট',
            'email' => 'a@b.com',
            'message' => 'হ্যালো',
        ])->assertRedirect();

        $this->assertSame(1, ContactMessage::count());
    }
}
