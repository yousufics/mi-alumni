<?php

namespace Tests\Feature;

use App\Models\CommitteeMember;
use App\Models\MembershipRequest;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function member(string $position, string $name, array $extra = []): CommitteeMember
    {
        return CommitteeMember::create([
            'position' => $position,
            'session' => '২০২৬',
            'role' => $position,
            'name' => $name,
            'is_current' => true,
            ...$extra,
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    public function test_current_committee_sections_are_in_requested_order(): void
    {
        $this->member('member', 'ম');
        $this->member('joint_secretary', 'জ');
        $this->member('vice_president', 'ভ');
        $this->member('general_secretary', 'গ');
        $this->member('president', 'স');
        $this->member('chief_advisor', 'প');
        $this->member('donor', 'দাতা'); // কমিটি পেজে আসবে না

        $this->get('/committees')->assertInertia(fn (Assert $p) => $p
            ->component('Committees')
            ->where('tab', 'current')
            ->has('sections', 5)
            ->where('sections.0.title', 'প্রধান উপদেষ্টা')
            ->where('sections.1.title', 'সভাপতি ও সাধারণ সম্পাদক')
            ->where('sections.1.members.0.name', 'স')
            ->where('sections.2.title', 'সহ-সভাপতিবৃন্দ')
            ->where('sections.3.title', 'সহ-সাধারণ সম্পাদকবৃন্দ')
            ->where('sections.4.title', 'সাধারণ সদস্যবৃন্দ')
            ->etc());
    }

    public function test_advisors_tab_has_chief_advisors_and_donors(): void
    {
        $this->member('donor', 'দাতা', ['session' => null]);
        $this->member('advisor', 'উপদেষ্টা', ['session' => null]);
        $this->member('chief_advisor', 'প্রধান');
        $this->member('president', 'সভাপতি');

        $this->get('/committees/advisors')->assertInertia(fn (Assert $p) => $p
            ->component('Committees')
            ->where('tab', 'advisors')
            ->has('sections', 3)
            ->where('sections.0.title', 'প্রধান উপদেষ্টা')
            ->where('sections.1.title', 'উপদেষ্টাবৃন্দ')
            ->where('sections.2.title', 'দাতা সদস্যবৃন্দ')
            ->etc());
    }

    public function test_former_committee_is_split_by_term(): void
    {
        $this->member('president', 'পুরনো ১', ['is_current' => false, 'session' => '২০২০–২২']);
        $this->member('president', 'পুরনো ২', ['is_current' => false, 'session' => '২০২২–২৪']);

        $this->get('/committees/former?session='.urlencode('২০২০–২২'))->assertInertia(fn (Assert $p) => $p
            ->where('tab', 'former')
            ->where('session', '২০২০–২২')
            ->has('terms', 2)
            ->where('sections.0.members.0.name', 'পুরনো ১')
            ->etc());
    }

    public function test_general_members_list_filters_by_batch_and_hides_contacts(): void
    {
        MembershipRequest::create(['name' => 'আলী', 'email' => 'a@x.com', 'phone' => '01700000001', 'batch' => '2010', 'status' => 'approved']);
        MembershipRequest::create(['name' => 'করিম', 'email' => 'b@x.com', 'phone' => '01700000002', 'batch' => '2012', 'status' => 'approved']);
        MembershipRequest::create(['name' => 'অপেক্ষমাণ', 'email' => 'c@x.com', 'phone' => '01700000003', 'batch' => '2010', 'status' => 'pending']);
        MembershipRequest::create(['name' => 'লুকানো', 'email' => 'd@x.com', 'phone' => '01700000004', 'batch' => '2010', 'status' => 'approved', 'is_public' => false]);

        $res = $this->get('/committees/members?batch=2010');
        $res->assertInertia(fn (Assert $p) => $p
            ->where('tab', 'members')
            ->has('batches', 2)
            ->has('list.data', 1)
            ->where('list.data.0.name', 'আলী')
            ->etc());
        $res->assertDontSee('01700000001');
        $res->assertDontSee('a@x.com');
    }

    public function test_admin_can_hide_member_and_set_position(): void
    {
        $r = MembershipRequest::create(['name' => 'আলী', 'email' => 'a@x.com', 'phone' => '017', 'batch' => '2010', 'status' => 'approved']);

        $this->actingAs($this->admin())
            ->patch("/admin/requests/{$r->id}/display", ['position' => 'প্রকৌশলী', 'is_public' => false])
            ->assertRedirect();

        $this->assertSame('প্রকৌশলী', $r->fresh()->position);
        $this->assertFalse($r->fresh()->is_public);
    }

    public function test_committee_form_requires_session_only_for_committee_positions(): void
    {
        $this->actingAs($this->admin());

        $this->post('/admin/committee', ['position' => 'president', 'name' => 'ক'])
            ->assertSessionHasErrors('session');

        $this->post('/admin/committee', ['position' => 'donor', 'name' => 'দাতা', 'is_current' => false])
            ->assertRedirect();

        $donor = CommitteeMember::first();
        $this->assertTrue($donor->is_current); // উপদেষ্টা/দাতা সবসময় বর্তমান
        $this->assertSame('দাতা সদস্য', $donor->role); // পদবি ফাঁকা থাকলে পজিশনের নাম
    }

    public function test_post_crud_and_detail_page(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/posts', ['title' => 'প্রথম নিবন্ধ', 'body' => "প্রথম অনুচ্ছেদ\n\nদ্বিতীয় অনুচ্ছেদ", 'is_published' => true])
            ->assertRedirect();

        $post = Post::first();
        $this->assertNotNull($post->published_at);

        $this->get("/posts/{$post->id}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('PostShow')
            ->where('post.title', 'প্রথম নিবন্ধ')
            ->etc());

        $this->get('/posts')->assertOk();

        $post->update(['is_published' => false]);
        $this->get("/posts/{$post->id}")->assertNotFound();
    }
}
