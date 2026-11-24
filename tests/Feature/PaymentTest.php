<?php

namespace Tests\Feature;

use App\Models\Donation;
use App\Models\MemberType;
use App\Models\MembershipRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PaymentTest extends TestCase
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

    private function applicant(array $extra = []): array
    {
        return [
            'name' => 'টেস্ট', 'email' => 'a@b.com', 'phone' => '017', 'batch' => '2010',
            'member_type_id' => MemberType::first()->id, ...$extra,
        ];
    }

    public function test_pages_receive_payment_data_and_options(): void
    {
        $this->actingAs($this->admin())->put('/admin/payments', [
            'bank_name' => 'ইসলামী ব্যাংক', 'account_name' => 'M. I Alumni', 'account_number' => '12345',
            'methods' => [['name' => 'বিকাশ', 'detail' => '017']],
        ])->assertRedirect();

        foreach (['/donate', '/membership'] as $url) {
            $this->get($url)->assertInertia(fn (Assert $p) => $p
                ->where('payment.bank_name', 'ইসলামী ব্যাংক')
                ->where('payment.account_number', '12345')
                ->where('payment.options', ['বিকাশ', 'ব্যাংক ট্রান্সফার', 'অন্যান্য'])
                ->etc());
        }
    }

    public function test_membership_pay_later_needs_no_trx(): void
    {
        $this->post('/membership', $this->applicant(['pay_option' => 'later', 'trx_id' => 'IGNORED']))->assertRedirect();

        $r = MembershipRequest::first();
        $this->assertNull($r->trx_id);
        $this->assertNull($r->payment_method);
        $this->assertSame('unpaid', $r->payment_status);
    }

    public function test_membership_pay_now_requires_and_stores_trx(): void
    {
        $this->post('/membership', $this->applicant(['pay_option' => 'now']))
            ->assertSessionHasErrors(['trx_id', 'payment_method']);

        $this->post('/membership', $this->applicant(['pay_option' => 'now', 'payment_method' => 'অন্যান্য', 'trx_id' => ' 9ab3 xyz ']))
            ->assertSessionHasNoErrors();

        $r = MembershipRequest::first();
        $this->assertSame('9AB3XYZ', $r->trx_id);
        $this->assertSame('অন্যান্য', $r->payment_method);
        $this->assertSame('unpaid', $r->payment_status); // যাচাই করবেন অ্যাডমিন
    }

    public function test_trx_id_cannot_be_reused_across_membership_and_donations(): void
    {
        $this->post('/membership', $this->applicant(['pay_option' => 'now', 'payment_method' => 'অন্যান্য', 'trx_id' => 'ABC123']))->assertRedirect();

        $this->post('/membership', $this->applicant(['email' => 'c@d.com', 'pay_option' => 'now', 'payment_method' => 'অন্যান্য', 'trx_id' => 'abc123']))
            ->assertSessionHasErrors('trx_id');

        $this->post('/donate', [
            'name' => 'দাতা', 'phone' => '017', 'amount' => 500, 'payment_method' => 'অন্যান্য', 'trx_id' => 'ABC123',
        ])->assertSessionHasErrors('trx_id');
    }

    public function test_donation_is_saved_pending_and_validated(): void
    {
        $this->post('/donate', [
            'name' => 'রহিম', 'phone' => '017', 'amount' => 1000, 'payment_method' => 'অন্যান্য', 'trx_id' => 'tx9',
        ])->assertRedirect()->assertSessionHas('success');

        $d = Donation::first();
        $this->assertSame('TX9', $d->trx_id);
        $this->assertSame(1000, $d->amount);
        $this->assertSame('pending', $d->status);

        $this->post('/donate', ['name' => 'ক', 'phone' => '1', 'amount' => 0, 'payment_method' => 'হ্যাক', 'trx_id' => 'a b!'])
            ->assertSessionHasErrors(['amount', 'payment_method', 'trx_id']);
    }

    public function test_admin_manages_donations(): void
    {
        $d = Donation::create(['name' => 'ক', 'phone' => '1', 'amount' => 700, 'payment_method' => 'বিকাশ', 'trx_id' => 'T1']);
        $this->actingAs($this->admin());

        $this->get('/admin/donations')->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Donations')->where('counts.pending', 1)->where('total', 0)->etc());

        $this->patch("/admin/donations/{$d->id}", ['status' => 'confirmed'])->assertRedirect();
        $this->assertNotNull($d->fresh()->confirmed_at);

        $this->get('/admin/donations?status=confirmed')->assertInertia(fn (Assert $p) => $p
            ->where('total', 700)->has('donations.data', 1)->etc());

        $this->get('/admin')->assertInertia(fn (Assert $p) => $p->where('stats.donations_total', 700)->etc());

        $this->patch("/admin/donations/{$d->id}", ['status' => 'bogus'])->assertSessionHasErrors('status');
        $this->get('/admin/donations/export')->assertOk();

        $this->delete("/admin/donations/{$d->id}")->assertRedirect();
        $this->assertNull(Donation::find($d->id));
    }

    public function test_admin_sees_trx_on_requests(): void
    {
        MembershipRequest::create($this->applicant(['trx_id' => 'ZZ1', 'payment_method' => 'অন্যান্য']));

        $this->actingAs($this->admin())->get('/admin/requests')->assertInertia(fn (Assert $p) => $p
            ->where('requests.data.0.trx_id', 'ZZ1')->etc());
    }

    public function test_payment_and_donation_admin_pages_require_admin(): void
    {
        $this->get('/admin/payments')->assertRedirect('/admin/login');
        $this->get('/admin/donations')->assertRedirect('/admin/login');
        $this->put('/admin/payments', [])->assertRedirect('/admin/login');
    }
}
