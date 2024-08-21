"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoppingScrapper = shoppingScrapper;
const playwright_1 = require("playwright");
const constants_1 = require("../constants/constants");
function shoppingScrapper(username, password, search) {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize Browser
        const browser = yield playwright_1.chromium.launch({ headless: false });
        const page = yield browser.newPage();
        try {
            let items = [];
            // Handling login here
            yield page.goto(constants_1.shoppingUrl);
            // typing the email or phone 
            yield page.fill('#ap_email', username);
            yield page.click('#continue');
            // Checking for incorrect username or phone
            const userNameCheck = yield page.evaluate(() => {
                return Array.from(document.querySelectorAll(".a-section .a-spacing-base .auth-pagelet-container")).length ? true : false;
            });
            // return error string for invalid username
            if (userNameCheck) {
                yield browser.close();
                return "Invalid Credentials";
            }
            // After validating username, filling the password
            yield page.fill('[autocomplete="current-password"]', password);
            yield page.click('#signInSubmit');
            // Checking for incorrect password
            const passwordCheck = yield page.evaluate(() => {
                return Array.from(document.querySelectorAll(".a-section .a-spacing-base .auth-pagelet-container")).length ? true : false;
            });
            // return error string for invalid password
            if (passwordCheck) {
                yield browser.close();
                return "Invalid Credentials";
            }
            // Wait until the login succeeds, Due to MFA, it should redirect directly if MFA is enabled.
            yield page.waitForURL(constants_1.loginVerifyUrl);
            // Checking MFA occurs
            const checkMfa = yield page.evaluate(() => {
                return Array.from(document.querySelectorAll("#body > div > div > div.a-section.a-spacing-medium > span") && document.querySelectorAll("#auth-mfa-form > div > div > h1")).length ? true : false;
            });
            // Checking MFA enabled or logged in directly
            console.log('Complete MFA manually if requied.', checkMfa);
            // If the user request search, adding the seach parameter to the order history string
            if (search) {
                const searchUrl = constants_1.shoppingSearchHistory + search;
                yield page.goto(searchUrl);
                // Extracting the values from html elements
                items = yield page.evaluate(() => {
                    var _a;
                    const childElements = (_a = Array.from(document.querySelectorAll('.a-fixed-left-grid-inner'))) === null || _a === void 0 ? void 0 : _a.map((div) => {
                        let orderName = div.childNodes[3].childNodes[2];
                        return {
                            order_name: orderName.innerText,
                            order_item_url: div.childNodes[3].childNodes[1].childNodes[0].href
                        };
                    });
                    return childElements;
                });
            }
            else {
                yield page.goto(constants_1.shoppingHistory);
                // Extracting the values from html elements
                items = yield page.evaluate(() => {
                    var _a;
                    const childElements = (_a = Array.from(document.querySelectorAll(".order-card .js-order-card"))) === null || _a === void 0 ? void 0 : _a.map((div) => {
                        var _a;
                        let orderName = div.childNodes[5].childNodes[0].childNodes[3] ? div.childNodes[5].childNodes[0].childNodes[3] : div.childNodes[5].childNodes[0].childNodes[1];
                        let orderPrice = div.childNodes[3].childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[3].childNodes[3] ?
                            (_a = div.childNodes[3].childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[3].childNodes[3].innerText) === null || _a === void 0 ? void 0 : _a.trim() :
                            div.childNodes[5].childNodes[0].childNodes[3].innerText.split('\n')[2];
                        return {
                            order_name: orderName.innerText.split('\n')[0],
                            order_price: orderPrice,
                            order_item_url: div.childNodes[3].childNodes[0].childNodes[1].childNodes[0].childNodes[3].childNodes[3].childNodes[1].childNodes[1].href
                        };
                    });
                    return childElements;
                });
            }
            // Close the browser after fetching the values
            yield browser.close();
            return items;
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
