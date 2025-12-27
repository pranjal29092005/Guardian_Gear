const { test, expect } = require('@playwright/test');

test.describe('GearGuard E2E Tests', () => {
    // Test Configuration
    const BASE_URL = 'http://localhost:5173';
    const API_URL = 'http://localhost:5000';

    const DEMO_USERS = {
        user: { email: 'user@demo.com', password: 'password', role: 'USER' },
        tech: { email: 'tech@demo.com', password: 'password', role: 'TECHNICIAN' },
        manager: { email: 'manager@demo.com', password: 'password', role: 'MANAGER' }
    };

    test.beforeEach(async ({ page }) => {
        // Start at login page
        await page.goto(`${BASE_URL}/login`);
    });

    test.describe('Authentication Flow', () => {
        test('should login successfully as regular user', async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.user.email);
            await page.fill('input[type="password"]', DEMO_USERS.user.password);
            await page.click('button[type="submit"]');

            // Should redirect to dashboard
            await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

            // Should show user name
            await expect(page.locator('text=Regular User')).toBeVisible();

            // Should show stats
            await expect(page.locator('text=Total Equipment')).toBeVisible();
            await expect(page.locator('text=3')).toBeVisible(); // 3 equipment
        });

        test('should fail login with invalid credentials', async ({ page }) => {
            await page.fill('input[type="email"]', 'wrong@email.com');
            await page.fill('input[type="password"]', 'wrongpassword');
            await page.click('button[type="submit"]');

            // Should stay on login page
            await expect(page).toHaveURL(`${BASE_URL}/login`);

            // Should show error message
            await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible();
        });

        test('should logout successfully', async ({ page }) => {
            // Login first
            await page.fill('input[type="email"]', DEMO_USERS.user.email);
            await page.fill('input[type="password"]', DEMO_USERS.user.password);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

            // Logout
            await page.click('button:has-text("Logout")');

            // Should redirect to login
            await expect(page).toHaveURL(`${BASE_URL}/login`);
        });
    });

    test.describe('Equipment Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login as user
            await page.fill('input[type="email"]', DEMO_USERS.user.email);
            await page.fill('input[type="password"]', DEMO_USERS.user.password);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
        });

        test('should display equipment list', async ({ page }) => {
            await page.click('a[href="/equipment"]');
            await expect(page).toHaveURL(`${BASE_URL}/equipment`);

            // Should show equipment table
            await expect(page.locator('text=Printer-01')).toBeVisible();
            await expect(page.locator('text=CNC-01')).toBeVisible();
            await expect(page.locator('text=Laptop-05')).toBeVisible();
        });

        test('should filter equipment by department', async ({ page }) => {
            await page.click('a[href="/equipment"]');
            await expect(page).toHaveURL(`${BASE_URL}/equipment`);

            // Filter by IT department
            await page.fill('input[placeholder*="department"]', 'IT');

            // Should show only IT equipment
            await expect(page.locator('text=Printer-01')).toBeVisible();
            await expect(page.locator('text=Laptop-05')).toBeVisible();

            // Should not show production equipment
            await expect(page.locator('text=CNC-01')).not.toBeVisible();
        });

        test('should show equipment detail with smart button', async ({ page }) => {
            await page.click('a[href="/equipment"]');
            await page.click('text=Printer-01');

            // Should show equipment details
            await expect(page.locator('text=HP-2024-001')).toBeVisible(); // Serial number
            await expect(page.locator('text=Office Equipment')).toBeVisible(); // Category

            // Should show smart maintenance button with count
            await expect(page.locator('button:has-text("Maintenance")')).toBeVisible();
        });
    });

    test.describe('Request Creation with Auto-Fill', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.user.email);
            await page.fill('input[type="password"]', DEMO_USERS.user.password);
            await page.click('button[type="submit"]');
            await page.click('a[href="/kanban"]');
        });

        test('should create request with auto-fill', async ({ page }) => {
            await page.click('button:has-text("Create Request")');

            // Fill subject
            await page.fill('input[name="subject"], input[placeholder*="subject"]', 'Test maintenance request');

            // Select equipment
            await page.selectOption('select', { label: /Printer-01/ });

            // Should show auto-filled info
            await expect(page.locator('text=Auto-filled Information')).toBeVisible();
            await expect(page.locator('text=IT Support Team')).toBeVisible();
            await expect(page.locator('text=Office Equipment')).toBeVisible();

            // Submit
            await page.click('button[type="submit"]:has-text("Create")');

            // Should close modal and refresh
            await expect(page.locator('text=Test maintenance request')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Kanban Board', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.tech.email);
            await page.fill('input[type="password"]', DEMO_USERS.tech.password);
            await page.click('button[type="submit"]');
            await page.click('a[href="/kanban"]');
        });

        test('should display kanban board with columns', async ({ page }) => {
            await expect(page.locator('text=NEW')).toBeVisible();
            await expect(page.locator('text=IN_PROGRESS').or(page.locator('text=IN PROGRESS'))).toBeVisible();
            await expect(page.locator('text=REPAIRED')).toBeVisible();
            await expect(page.locator('text=SCRAP')).toBeVisible();
        });

        test('should show assign-to-me button for technician', async ({ page }) => {
            // Find a NEW request
            const newColumn = page.locator('text=NEW').locator('..');
            const assignButton = newColumn.locator('button:has-text("Assign to Me")').first();

            if (await assignButton.count() > 0) {
                await expect(assignButton).toBeVisible();
            }
        });

        test('should allow technician to move request', async ({ page }) => {
            // Find a NEW request and click Start Work
            const startButton = page.locator('button:has-text("Start Work")').first();

            if (await startButton.count() > 0) {
                await startButton.click();

                // Should move to IN_PROGRESS
                await page.waitForTimeout(1000);
                // Verify it's in the IN_PROGRESS column now
                await expect(page.locator('text=IN PROGRESS, text=IN_PROGRESS')).toBeVisible();
            }
        });
    });

    test.describe('Calendar View', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.manager.email);
            await page.fill('input[type="password"]', DEMO_USERS.manager.password);
            await page.click('button[type="submit"]');
            await page.click('a[href="/calendar"]');
        });

        test('should display calendar with events', async ({ page }) => {
            // Calendar should load
            await expect(page.locator('.fc-view, [class*="calendar"]')).toBeVisible({ timeout: 5000 });

            // Should show at least one preventive request
            await expect(page.locator('text=/Monthly CNC|Preventive/i')).toBeVisible();
        });
    });

    test.describe('Reports', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.manager.email);
            await page.fill('input[type="password"]', DEMO_USERS.manager.password);
            await page.click('button[type="submit"]');
            await page.click('a[href="/reports"]');
        });

        test('should display reports page with chart', async ({ page }) => {
            await expect(page.locator('text=Reports')).toBeVisible();
            await expect(page.locator('text=Requests by Team, text=Maintenance Requests by Team')).toBeVisible();

            // Should show team cards
            await expect(page.locator('text=Mechanics Team, text=IT Support Team')).toBeVisible();
        });
    });

    test.describe('Role-Based Access', () => {
        test('USER role should only see own requests', async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.user.email);
            await page.fill('input[type="password"]', DEMO_USERS.user.password);
            await page.click('button[type="submit"]');
            await page.click('a[href="/kanban"]');

            // Should see limited requests
            const requestCards = page.locator('[class*="bg-white rounded-lg p-4"]');
            const count = await requestCards.count();

            // USER created 1 request in seed data
            expect(count).toBeLessThanOrEqual(2);
        });

        test('MANAGER role should see all requests', async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.manager.email);
            await page.fill('input[type="password"]', DEMO_USERS.manager.password);
            await page.click('button[type="submit"]');
            await page.click('a[href="/kanban"]');

            // Should see all requests (at least 2 from seed data)
            const requestCards = page.locator('[class*="border-l-4"]');
            const count = await requestCards.count();

            expect(count).toBeGreaterThanOrEqual(2);
        });
    });

    test.describe('Navigation', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', DEMO_USERS.user.email);
            await page.fill('input[type="password"]', DEMO_USERS.user.password);
            await page.click('button[type="submit"]');
        });

        test('should navigate through all pages', async ({ page }) => {
            // Dashboard
            await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

            // Equipment
            await page.click('a[href="/equipment"]');
            await expect(page).toHaveURL(`${BASE_URL}/equipment`);

            // Kanban
            await page.click('a[href="/kanban"]');
            await expect(page).toHaveURL(`${BASE_URL}/kanban`);

            // Calendar
            await page.click('a[href="/calendar"]');
            await expect(page).toHaveURL(`${BASE_URL}/calendar`);

            // Reports
            await page.click('a[href="/reports"]');
            await expect(page).toHaveURL(`${BASE_URL}/reports`);

            // Back to Dashboard
            await page.click('a[href="/dashboard"]');
            await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
        });
    });
});
