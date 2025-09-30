<?php

namespace Tests\Feature;

use App\Services\IikoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IikoServiceTest extends TestCase
{
    use RefreshDatabase;

    private IikoService $iikoService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->iikoService = new IikoService();
    }

    /**
     * Test that IikoService can be instantiated
     */
    public function test_iiko_service_can_be_instantiated(): void
    {
        $this->assertInstanceOf(IikoService::class, $this->iikoService);
    }

    /**
     * Test access token retrieval with mocked response
     */
    public function test_get_access_token_with_mock(): void
    {
        // Mock the HTTP response
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200)
        ]);

        $token = $this->iikoService->getAccessToken();

        $this->assertEquals('test_token_123', $token);
    }

    /**
     * Test organizations retrieval with mocked response
     */
    public function test_get_organizations_with_mock(): void
    {
        // Mock the HTTP responses
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200),
            'api-ru.iiko.services/api/1/organizations' => Http::response([
                'organizations' => [
                    [
                        'id' => 'org_1',
                        'name' => 'Test Organization',
                        'type' => 'restaurant'
                    ]
                ]
            ], 200)
        ]);

        $organizations = $this->iikoService->getOrganizations();

        $this->assertIsArray($organizations);
        $this->assertCount(1, $organizations);
        $this->assertEquals('org_1', $organizations[0]['id']);
        $this->assertEquals('Test Organization', $organizations[0]['name']);
    }

    /**
     * Test menu retrieval with mocked response
     */
    public function test_get_menu_with_mock(): void
    {
        $organizationId = 'test_org_id';

        // Mock the HTTP responses
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200),
            'api-ru.iiko.services/api/1/nomenclature' => Http::response([
                'groups' => [
                    [
                        'id' => 'group_1',
                        'name' => 'Test Category'
                    ]
                ],
                'products' => [
                    [
                        'id' => 'product_1',
                        'name' => 'Test Product',
                        'price' => 100.00
                    ]
                ]
            ], 200)
        ]);

        $menu = $this->iikoService->getMenu($organizationId);

        $this->assertIsArray($menu);
        $this->assertArrayHasKey('groups', $menu);
        $this->assertArrayHasKey('products', $menu);
        $this->assertCount(1, $menu['groups']);
        $this->assertCount(1, $menu['products']);
    }

    /**
     * Test external menu retrieval with mocked response
     */
    public function test_get_external_menu_with_mock(): void
    {
        $organizationId = 'test_org_id';
        $priceCategoryId = 'test_price_category';

        // Mock the HTTP responses
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200),
            'api-ru.iiko.services/api/2/menu' => Http::response([
                'groups' => [
                    [
                        'id' => 'group_1',
                        'name' => 'Test Category',
                        'items' => []
                    ]
                ]
            ], 200)
        ]);

        $menu = $this->iikoService->getExternalMenu($organizationId, $priceCategoryId);

        $this->assertIsArray($menu);
        $this->assertArrayHasKey('groups', $menu);
    }

    /**
     * Test sync menu functionality
     */
    public function test_sync_menu_with_mock(): void
    {
        $organizationId = 'test_org_id';

        // Mock the HTTP responses
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200),
            'api-ru.iiko.services/api/2/menu' => Http::response([
                'groups' => [
                    [
                        'id' => 'group_1',
                        'name' => 'Test Category'
                    ]
                ]
            ], 200)
        ]);

        $result = $this->iikoService->syncMenu($organizationId);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('message', $result);
    }
}
