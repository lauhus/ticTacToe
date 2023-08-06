import WebSocket from "ws";
import readline from "readline";
import { Game } from "./class/Game";

export enum SYMBOL {
    "x" = "X",
    "o" = "O"
}

export enum RESPONSE {
    "y"= "Y",
    "n" = "n"
}

const enum EVENT {
    connection = "connection",
    message = "message",
    start = "start"
}

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export function createRequestCli(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}


const websocket = new WebSocket.Server({ port: 8081 });

websocket.on(EVENT.connection, async (ws) => {
    ws.on(EVENT.message, async (message) => {
        if (message.toString() === EVENT.start) {
            const game = new Game(ws);
        }
    });
})


