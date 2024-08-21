import { chromium } from 'playwright';
import { shoppingUrl, shoppingHistory, shoppingSearchHistory, loginVerifyUrl } from "../constants/constants";


export async function shoppingScrapper(username: string, password: string, search: string) {
    // Initialize Browser
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        let items = [];
        // Handling login here
        await page.goto(shoppingUrl);

        // typing the email or phone 
        await page.fill('#ap_email', username);
        await page.click('#continue');

        // Checking for incorrect username or phone
        const userNameCheck = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".a-section .a-spacing-base .auth-pagelet-container")).length ? true : false;
        });

        // return error string for invalid username
        if (userNameCheck) {
            await browser.close();
            return "Invalid Credentials";
        }

        // After validating username, filling the password
        await page.fill('[autocomplete="current-password"]', password);
        await page.click('#signInSubmit');

        // Checking for incorrect password
        const passwordCheck = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".a-section .a-spacing-base .auth-pagelet-container")).length ? true : false;
        });

        // return error string for invalid password
        if (passwordCheck) {
            await browser.close();
            return "Invalid Credentials";
        }

        // Wait until the login succeeds, Due to MFA, it should redirect directly if MFA is enabled.
        await page.waitForURL(loginVerifyUrl);

        // Checking MFA occurs
        const checkMfa = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("#body > div > div > div.a-section.a-spacing-medium > span") && document.querySelectorAll("#auth-mfa-form > div > div > h1")
            ).length ? true : false;
        });
        // Checking MFA enabled or logged in directly
        console.log('Complete MFA manually if requied.', checkMfa);

        // If the user request search, adding the seach parameter to the order history string
        if (search) {
            const searchUrl = shoppingSearchHistory + search;
            await page.goto(searchUrl)
            // Extracting the values from html elements
            items = await page.evaluate(() => {
                const childElements = Array.from(document.querySelectorAll('.a-fixed-left-grid-inner'))?.map((div) => {
                    let orderName = div.childNodes[3].childNodes[2]
                    return {
                        order_name: (orderName as HTMLHtmlElement).innerText,
                        order_item_url: (div.childNodes[3].childNodes[1].childNodes[0] as HTMLLinkElement).href
                    }
                });

                return childElements
            });
        } else {
            await page.goto(shoppingHistory);
            // Extracting the values from html elements
            items = await page.evaluate(() => {
                const childElements = Array.from(document.querySelectorAll(".order-card .js-order-card"))?.map((div) => {
                    let orderName = div.childNodes[5].childNodes[0].childNodes[3] ? div.childNodes[5].childNodes[0].childNodes[3] : div.childNodes[5].childNodes[0].childNodes[1]
                    let orderPrice = div.childNodes[3].childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[3].childNodes[3] ?
                        (div.childNodes[3].childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[3].childNodes[3] as HTMLHtmlElement).innerText?.trim() :
                        (div.childNodes[5].childNodes[0].childNodes[3] as HTMLHtmlElement).innerText.split('\n')[2];
                    return {
                        order_name: (orderName as HTMLHtmlElement).innerText.split('\n')[0],
                        order_price: orderPrice,
                        order_item_url: (div.childNodes[3].childNodes[0].childNodes[1].childNodes[0].childNodes[3].childNodes[3].childNodes[1].childNodes[1] as HTMLLinkElement).href
                    }
                });

                return childElements
            });
        }
        // Close the browser after fetching the values
        await browser.close();
        return items;

    } catch (error) {
        console.error('An error occurred:', error);
    }
}