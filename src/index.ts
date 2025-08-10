import http from "http";
import fs from "fs";
import url from "url";
import mongoose from "mongoose";
import mimetypes from "mime-types";
import { config } from "dotenv";
import Product, { Schema } from "./Models/model.js"

config();

const URI = process.env.URI || process.env.ENVURI;
const PORT = process.env.PORT || 5000;

function GetBody(req: http.IncomingMessage): Promise<object> {
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

async function ServeFile(req: http.IncomingMessage, res: http.ServerResponse) {
    const URL = url.parse(req.url, true);
    let FileName = URL.path.replace(/^\/+|\/+$/g, "");

    if (FileName === "") FileName = "index.html";

    const FilePath = import.meta.dirname.replace("/dist", "") + "/public/" + FileName;
    const ClonedFilePath = FilePath.replace(FileName, "dynamicindex.html");
    console.log(ClonedFilePath);
    if (FileName === "index.html") {
        const Data = await Product.find({});
        
        fs.copyFileSync(FilePath, ClonedFilePath);

        Data.forEach(rawUser => {
            let User = rawUser.toJSON();
            let DynamicContent = [
                "<div class=\"DynamicUsers\">",
                `<h1>UserId: ${User.UserId.toString()}</h1>`,
                "<h2>Items</h2>",
                "<ul>",
            ];
            Object.keys(User.Items).forEach(key => {
                DynamicContent.push(`<li>${key} - Name: ${User.Items[key]?.ItemName} & Value: ${User.Items[key]?.ItemValue}</li>`);
            });

            DynamicContent.push("</ul>");
            DynamicContent.push("<h2>Moderation History</h2>");

            Object.keys(User.ModerationHistory).forEach(key => {
                DynamicContent.push(`Iden#: ${User.ModerationHistory[key]?.IdentifyingNumber}, Context: ${User.ModerationHistory[key]?.Context}`);
            });
            DynamicContent.push("</div>");
        
            try {
                const FileData = fs.readFileSync(ClonedFilePath, "utf-8");
        
                if (!FileData) {
                    res.writeHead(404, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({
                        message: "File not found!",
                    }));
                    return;
                };

                const Result = FileData.replace(/\<\/body>/g, DynamicContent.join("") + "</body>");
                fs.writeFileSync(ClonedFilePath, Result, "utf-8");
            } catch(err) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: "There was a problem writing to index.html!",
                }));
                return;
            };
        });
    };
    fs.readFile(FileName === "index.html" ? ClonedFilePath : FilePath, (err, FileData) => {
        if (err) {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                message: "File not found!",
            }));
            return;
        }
        res.setHeader("X-Content-Type-Options", "nosniff");
        const FileMime = mimetypes.lookup(FileName) as string;
        res.writeHead(200, {"Content-Type": FileMime});
        res.end(FileData);
        if (fs.existsSync(ClonedFilePath)) {
            fs.unlinkSync(ClonedFilePath)
        };
    });
};

const Server = http.createServer(async (req, res) => {
    console.log(`${req.method} : ${req.url}`);
    if (req.url.match("/") || req.url.match("/home") && req.method === "GET") {
        ServeFile(req, res);
        return;
    } else if (req.url.match("/users") && req.method === "GET") {
        if (req.url.match(/\/users\/([0-9]+)/)) {
            const UserId = parseInt(req.url.split("/")[2]);
            try {
                const Data = await Product.find({UserId: UserId});
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable to find data for Player with UserId "${UserId}"!`,
                }));
            };
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
            };
        };
        return;
    } else if (req.url.match(/\/users\/([0-9]+)/)) {
        const UserId = parseInt(req.url.split("/")[2]);
        if (req.method === "POST") {
            try {
                const Body = await GetBody(req);
                const Data = await Product.create(Body);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable post data for Player with UserId ${UserId}!`,
                }));
            };
            return;
        } else if (req.method === "DELETE") {
            try {
                const Data = await Product.findOneAndDelete({UserId: UserId});
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable to delete data for Player with UserId ${UserId}!`,
                }));
            };
            return;
        } else if(req.method === "PATCH") {
            try {
                const Body = await GetBody(req);
                const Data = await Product.findOneAndUpdate({UserId: UserId}, Body);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(Data));
            } catch(error) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    message: `Unable to patch data for Player with UserId ${UserId}!`,
                }));
            };
            return;
        };
    };
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({
        message: "Route not found!",
    }));
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