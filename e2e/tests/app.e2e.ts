
import {setupBrowserHooks, getBrowserState} from './utils';

describe('Auth Test', function () {
  setupBrowserHooks('auth');

  beforeEach(async function () {
    // wait 1 second before each test
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it('loads the login page', async function() {
    const {page} = getBrowserState();

    await page.locator('#email').fill('user1@test.com');
    await page.locator('#password').fill('X7gH5jK9mN1pQrStU3ZaB3Df');
    await page.locator('button::-p-text(Login)').click();
    console.log('after click');

    await page.waitForNavigation();
    console.log('after navigation');

    // we should be on the home page
    expect(page.url()).toBe('http://localhost:4200/');

  });

});
