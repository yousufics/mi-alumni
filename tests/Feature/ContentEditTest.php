<?php

namespace Tests\Feature;

use App\Models\MemberType;
use App\Models\MembershipRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContentEditTest extends TestCase
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

    private function approved(array $extra = []): MembershipRequest
    {
        return MembershipRequest::create([
            'name' => 'আলী', 'email' => 'a@x.com', 'phone' => '017', 'batch' => '2010',
            'status' => 'approved', ...$extra,
        ]);
    }

    public function test_default_member_types_exist(): void
    {
        $this->assertSame(2, MemberType::count());
        $this->assertSame(500, MemberType::where('name', 'সাধারণ মেম্বার')->value('fee'));
        $this->assertSame(10000, MemberType::where('name', 'স্থায়ী মেম্বার')->value('fee'));
    }

    public function test_admin_can_edit_pillars_and_home_shows_them(): void
    {
        $this->actingAs($this->admin())->put('/admin/content/pillars', [
            'items' => [['title' => 'নতুন স্তম্ভ', 'text' => 'বর্ণনা']],
        ])->assertRedirect();

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->component('Home')
            ->has('pillars', 1)
            ->where('pillars.0.title', 'নতুন স্তম্ভ')
            ->etc());
    }

    public function test_admin_can_edit_about_activities_donation(): void
    {
        $this->actingAs($this->admin());

        $this->put('/admin/content/about', ['intro' => 'নতুন পরিচয়', 'mission' => 'ম', 'vision' => 'ভ'])->assertRedirect();
        $this->put('/admin/content/activities', ['items' => ['প্রথম', 'দ্বিতীয়']])->assertRedirect();
        $this->put('/admin/content/donation', [
            'intro' => 'অনুদান বার্তা',
            'thanks' => 'ধন্যবাদ বার্তা',
        ])->assertRedirect();

        $this->get('/about')->assertInertia(fn (Assert $p) => $p
            ->where('about.intro', 'নতুন পরিচয়')
            ->has('about.activities', 2)
            ->etc());

        $this->get('/donate')->assertInertia(fn (Assert $p) => $p
            ->where('donation.intro', 'অনুদান বার্তা')
            ->where('donation.thanks', 'ধন্যবাদ বার্তা')
            ->etc());
    }

    public function test_contact_settings_reach_public_pages(): void
    {
        $this->actingAs($this->admin())->put('/admin/content/contact', [
            'phone' => '০১৭০০', 'email' => 'new@example.org', 'address' => 'ঢাকা',
        ])->assertRedirect();

        $this->get('/contact')->assertInertia(fn (Assert $p) => $p
            ->where('site.phone', '০১৭০০')
            ->where('site.address', 'ঢাকা')
            ->etc());
    }

    public function test_unknown_content_group_is_404_and_validation_works(): void
    {
        $this->actingAs($this->admin());

        $this->put('/admin/content/hacker', ['x' => 1])->assertNotFound();
        $this->put('/admin/content/pillars', ['items' => []])->assertSessionHasErrors('items');
    }

    public function test_content_requires_admin(): void
    {
        $this->put('/admin/content/about', ['intro' => 'x', 'mission' => 'y', 'vision' => 'z'])
            ->assertRedirect('/admin/login');
    }

    public function test_membership_form_saves_type_and_fee_snapshot(): void
    {
        $permanent = MemberType::where('name', 'স্থায়ী মেম্বার')->first();

        $this->post('/membership', [
            'name' => 'টেস্ট', 'email' => 'a@b.com', 'phone' => '017', 'batch' => '2010',
            'member_type_id' => $permanent->id,
        ])->assertRedirect();

        $r = MembershipRequest::first();
        $this->assertSame(10000, $r->fee_amount);
        $this->assertSame('unpaid', $r->payment_status);

        // টাইপের ফি বদলালে সংরক্ষিত ফি বদলায় না
        $permanent->update(['fee' => 12000]);
        $this->assertSame(10000, $r->fresh()->fee_amount);
    }

    public function test_membership_requires_active_type(): void
    {
        MemberType::query()->update(['is_active' => false]);
        // কোনো সক্রিয় টাইপ না থাকলে টাইপ ছাড়াই আবেদন চলে
        $this->post('/membership', ['name' => 'ক', 'email' => 'a@b.com', 'phone' => '1', 'batch' => '1'])->assertRedirect();
        $this->assertSame(1, MembershipRequest::count());

        MemberType::first()->update(['is_active' => true]);
        $this->post('/membership', ['name' => 'খ', 'email' => 'a@b.com', 'phone' => '1', 'batch' => '1'])
            ->assertSessionHasErrors('member_type_id');
    }

    public function test_admin_can_add_edit_and_protect_member_types(): void
    {
        $this->actingAs($this->admin());

        $this->post('/admin/member-types', ['name' => 'আজীবন মেম্বার', 'fee' => 25000, 'is_active' => true])->assertRedirect();
        $t = MemberType::where('name', 'আজীবন মেম্বার')->first();
        $this->assertSame(25000, $t->fee);

        $this->put("/admin/member-types/{$t->id}", ['name' => 'আজীবন মেম্বার', 'fee' => 30000, 'is_active' => true])->assertRedirect();
        $this->assertSame(30000, $t->fresh()->fee);

        $this->approved(['member_type_id' => $t->id, 'fee_amount' => 30000]);
        $this->delete("/admin/member-types/{$t->id}")->assertSessionHasErrors('delete');
        $this->assertNotNull($t->fresh());

        $free = MemberType::create(['name' => 'অস্থায়ী', 'fee' => 0]);
        $this->delete("/admin/member-types/{$free->id}")->assertRedirect();
        $this->assertNull(MemberType::find($free->id));
    }

    public function test_admin_sets_fee_status_paid_and_unpaid(): void
    {
        $r = $this->approved(['fee_amount' => 500]);
        $this->actingAs($this->admin());

        $this->patch("/admin/requests/{$r->id}/display", [
            'payment_status' => 'paid', 'payment_note' => 'TRX123', 'fee_amount' => 500, 'is_public' => true,
        ])->assertRedirect();

        $r->refresh();
        $this->assertSame('paid', $r->payment_status);
        $this->assertNotNull($r->paid_at);
        $this->assertSame('TRX123', $r->payment_note);

        $this->patch("/admin/requests/{$r->id}/display", ['payment_status' => 'unpaid', 'is_public' => true])->assertRedirect();
        $this->assertSame('unpaid', $r->fresh()->payment_status);
        $this->assertNull($r->fresh()->paid_at);
    }

    public function test_changing_type_resets_fee_to_type_fee(): void
    {
        $general = MemberType::where('name', 'সাধারণ মেম্বার')->first();
        $permanent = MemberType::where('name', 'স্থায়ী মেম্বার')->first();
        $r = $this->approved(['member_type_id' => $general->id, 'fee_amount' => 500]);

        $this->actingAs($this->admin())->patch("/admin/requests/{$r->id}/display", [
            'member_type_id' => $permanent->id, 'is_public' => true,
        ])->assertRedirect();

        $this->assertSame($permanent->id, $r->fresh()->member_type_id);
        $this->assertSame(10000, $r->fresh()->fee_amount);
    }

    public function test_invalid_payment_status_is_rejected(): void
    {
        $r = $this->approved();
        $this->actingAs($this->admin())
            ->patch("/admin/requests/{$r->id}/display", ['payment_status' => 'hacked'])
            ->assertSessionHasErrors('payment_status');
    }

    public function test_dashboard_counts_unpaid_and_collected_fees(): void
    {
        $this->approved(['fee_amount' => 500, 'payment_status' => 'paid']);
        $this->approved(['fee_amount' => 10000, 'payment_status' => 'unpaid']);

        $this->actingAs($this->admin())->get('/admin')->assertInertia(fn (Assert $p) => $p
            ->where('stats.unpaid', 1)
            ->where('stats.collected', 500)
            ->etc());
    }

    public function test_public_member_list_shows_type_but_not_contacts(): void
    {
        $t = MemberType::first();
        $this->approved(['member_type_id' => $t->id, 'phone' => '01799999999', 'email' => 'secret@x.com']);

        $res = $this->get('/committees/members');
        $res->assertInertia(fn (Assert $p) => $p
            ->where('list.data.0.type', $t->name)
            ->etc());
        $res->assertDontSee('01799999999');
        $res->assertDontSee('secret@x.com');
    }
}
