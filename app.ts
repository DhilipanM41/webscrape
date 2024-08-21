import express, { Request, Response } from 'express';
import { shoppingScrapper } from './src/shoppingScrapper';
const app = express();

app.use(express.json());

// Define the port of this server
const PORT = 8081;

// Handling a post method route here
app.post("/startScrape", async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    const search = req.body.search_string;
    // Verifing the user credentials were not empty
    if (!username || !password) {
        res.status(401).send("No username or password found");
        return;
    }

    //Call the scraping method if the credentials were provided properly
    const resp = await shoppingScrapper(username, password, search);
    res.status(200).send(resp);
})

app.listen(PORT, () => {
    console.log("listening to Port: " + PORT);

})