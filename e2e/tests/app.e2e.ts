
import {setupBrowserHooks, getBrowserState} from './utils';

describe('Auth Test', function () {
  setupBrowserHooks('auth');

  beforeEach(async function () {
    // wait 1 second before each test
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it('loads the login page', async function() {
    const {page} = getBrowserState();
    // Waiting for an element to exist on the page, so we know the page is loaded.
    await page.locator('button').wait();
    console.log('page ready');

    const loginButton = await page.locator('button').wait();
    expect(loginButton).not.toBeNull();
  });

});
