import http from "http";
import mongoose from "mongoose";
import { config } from "dotenv";
import Product, { Schema } from "./Models/model.js"

config();

const URI = process.env.URI || process.env.ENVURI;
const PORT = process.env.PORT || 5000;

function GetBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let Body = "";
        
        req.on("data", chunk => {
            Body += chunk.toString();
        });

        req.on("end", () => {
            try {
                resolve(Body);
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
            const UserId = parseInt(req.url.split("/")[2]);
            try {
                const Data = await Product.find({"UserId": UserId});
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable to find data for Player with UserId "${UserId}"!`,
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
                    message: "Unable to get all Player data!",
                }));
            }
        }
        return;
    } else if (req.url.match(/\/users\/([0-9]+)/)) {
        const UserId = parseInt(req.url.split("/")[2]);
        if (req.method === "POST") {
            try {
                const Body = await GetBody(req);
                console.log("The BODY:");
                console.log(Body);
                const Data = await Product.create(Body);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                console.log("ERROR:");
                console.log(error);
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable post data for Player with UserId ${UserId}!`,
                }));
            };
            return;
        } else if (req.method === "DELETE") {
            try {
                const Body = await GetBody(req);
                
            } catch(error) {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable to delete data for Player with UserId ${UserId}!`,
                }));
            };
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