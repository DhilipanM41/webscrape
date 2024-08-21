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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shoppingScrapper_1 = require("./src/shoppingScrapper");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Define the port of this server
const PORT = 8081;
// Handling a post method route here
app.post("/startScrape", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const search = req.body.search_string;
    // Verifing the user credentials were not empty
    if (!username || !password) {
        res.status(401).send("No username or password found");
        return;
    }
    //Call the scraping method if the credentials were provided properly
    const resp = yield (0, shoppingScrapper_1.shoppingScrapper)(username, password, search);
    res.status(200).send(resp);
}));
app.listen(PORT, () => {
    console.log("listening to Port: " + PORT);
});
