import http from "http";
import mongoose from "mongoose";
import Product, { Schema } from "./Models/model.js"
import { json } from "stream/consumers";

const URI = process.env.URI;
const PORT = process.env.PORT || 5000;

function GetBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let Body = "";
        
        req.on("data", chunk => {
            Body += chunk;
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(Body));
            } catch(error) {
                reject(error);
            };
        });

        req.on("error", reject);
    });
};

const Server = http.createServer(async (req, res) => {
    if (req.url === "/" || req.url.match("/home") && req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
            message: "Home Page"
        }));
    } else if (req.url.match("/users") && req.method === "GET") {
        if (req.url.match(/\/users\/([0-9]+)/)) {
            try {
                const Data = await Product.find({"UserId": req.url.split("/")[2]});
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: error,
                }));
            }
        } else {
            try {
                const Data = await Product.find({});
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: error,
                }));
            }
        }
        return;
    } else if (req.url.match(/\/users\/([0-9]+)/)) {
        if (req.method === "POST") {
            try {
                const Body = await GetBody(req);
                const Data = await Product.create(Body);
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: error,
                }));
            };
            return;
        } else if (req.method === "DELETE") {
            // delete stuff to comply with roblox's player data policy
        }
    }
});

mongoose.set("strictQuery", false);

mongoose.connect(URI).then(() => {
    Server.listen(PORT, () => {
        console.log(`Listening on PORT ${PORT}!`);
    });
}).catch((err: string) => {
    console.log(err);
    Server.listen(PORT, () => {
        console.log(`(local testing) Listening on PORT ${PORT}!`);
    });
});