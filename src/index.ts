import http from "http";
import Middleware from "./middleware";

const PORT = 5000;

const Server = http.createServer((req, res) => {
    Middleware(req, res, () => {
        if (req.url === "/" || req.url === "/home") {
            res.setHeader("Content-Type", "application/json");
            res.end({
                message: "Home Page"
            });
            return;
        } else if (req.url === "/users") {
            res.setHeader("Content-Type", "application/json");
            res.end({
                message: "We'll add a Users Page here soon!"
            });
            return;
        }
    });
});

Server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}!`);
});