import http from "http";

const PORT = 5000;

const Server = http.createServer((req, res) => {
    if (req.url === "/" || req.url.match("/home")) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
            message: "Home Page"
        }));
    } else if (req.url.match("/users")) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
            message: "Users Page"
        }));
    }
});

Server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}!`);
});