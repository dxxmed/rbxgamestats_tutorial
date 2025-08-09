import http from "http";

export default function Middleware(req: http.IncomingMessage, res: http.ServerResponse, next: () => void) {
    console.log(`Endpoint: ${req.url}`)
    next();
};