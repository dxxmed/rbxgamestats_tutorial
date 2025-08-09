import http from "http";

const PORT = 5000;

const Server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/home") {
        res.setHeader("Content-Type", "application/json");
        res.end({
            message: "Home Page"
        });
    } else if (req.url === "/users") {
        res.setHeader("Content-Type", "application/json");
        res.end({
            message: "Users Page"
        });
    }
});

Server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}!`);
});