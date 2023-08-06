import { Player } from "./Player";
import { createRequestCli, RESPONSE, rl, SYMBOL } from "../index";
import WebSocket from "ws";

const WINNING_COMBINATION:{number1: number , number2: number , number3: number}[] = [
    {
        number1: 1,
        number2: 2,
        number3: 3
    },
    {
        number1: 4,
        number2: 5,
        number3: 6
    },
    {
        number1: 7,
        number2: 8,
        number3: 9
    },
    {
        number1: 1,
        number2: 4,
        number3: 7
    },
    {
        number1: 2,
        number2: 5,
        number3: 8
    },
    {
        number1: 3,
        number2: 6,
        number3: 9
    },
    {
        number1: 1,
        number2: 5,
        number3: 9
    },
    {
        number1: 3,
        number2: 5,
        number3: 7
    },

]

export class Game {

    ws: WebSocket;
    player1: Player;
    player2: Player;
    winner: { player: Player , winnerCase: number[]}
    grid: {index: number, symbol: SYMBOL}[] = [];

     constructor(ws: WebSocket) {
         this.ws = ws;
         this._init();

    }

    private async _init() {
        this.player1 = await this._createUser(1);
        this.player2 = await this._createBotOrUser(this.player1.symbol);
        const player1Info = { name: this.player1.name, symbol: this.player1.symbol };
        const player2Info = { name: this.player2.name, symbol: this.player2.symbol };
        this.ws.send(JSON.stringify({ player1: player1Info, player2: player2Info }));
        this.play();
    }

   private async _createUser(userNb: number, symbolAlreadyUse?: SYMBOL) {
        let playerSymbol: SYMBOL;
        let playerName = await createRequestCli(`Player ${userNb} what is your name?`)
        if (!symbolAlreadyUse) {
            const symbol = await createRequestCli("Choose your symbol: x or o ?")
            playerSymbol = SYMBOL[symbol.toLowerCase()];
            while (!playerSymbol) {
                const symbol = await createRequestCli("Choose your symbol: x or o ?")
                playerSymbol = SYMBOL[symbol.toLowerCase()];
            }
        } else {
            let otherSymbol = Object.keys(SYMBOL).find((symbol) => symbol !== symbolAlreadyUse.toLowerCase());
            if (!otherSymbol) return;
            playerSymbol = SYMBOL[otherSymbol];
            console.log("Your symbol is the : " + playerSymbol);
        }
       return new Player(playerName, playerSymbol);
    }

    private async _createBotOrUser(symbolAlreadyUse: SYMBOL){
        let response: RESPONSE;
        let res = await createRequestCli('Create a second player ? Y or N ');
        response = RESPONSE[res.toLowerCase()]
        while (!response) {
            const res = await createRequestCli("Create a second player ? Y or N")
            response = RESPONSE[res.toLowerCase()];
        }
        if (response === RESPONSE.y) {
            return await this._createUser(2, symbolAlreadyUse);
        } else {
            let otherSymbol = Object.keys(SYMBOL).find((symbol) => symbol !== symbolAlreadyUse.toLowerCase());
            if (!otherSymbol) return;
            const symbol = SYMBOL[otherSymbol];
            return new Player("bot", symbol);
        }
    }

    async play() {
        let i = 0;
        while (!this.winner) {
            i++;
            let indexPlayed: string | number;
            if (i % 2 !== 0 || this.player2.name !== "bot") {
                indexPlayed = await createRequestCli("In which box do you want to play?");
                while (!parseInt(indexPlayed)
                || parseInt(indexPlayed) < 1 || parseInt(indexPlayed) > 9 ||
                (this.grid.length !== 0 && this.grid.find((item) => item.index == indexPlayed))) {
                    console.log("Please select a valid box number")
                    indexPlayed = await createRequestCli("In which box do you want to play?");
                }
            } else {
                indexPlayed = this.randomCaseForBot();
            }
            const index = typeof indexPlayed === "string" ? parseInt(indexPlayed) : indexPlayed
            this.grid.push({ index: index, symbol: i % 2 !== 0 ? this.player1.symbol: this.player2.symbol });
            this.ws.send(JSON.stringify({ index: index, symbol: i % 2 !== 0 ? this.player1.symbol: this.player2.symbol }))
            this.checkIfWinner();
        }
    }

    checkIfWinner() {
         this.grid.sort((a, b) => a.index > b.index ? -1: 1);
         const caseForPlayer1 = this.grid.filter(({ index , symbol}) => symbol === this.player1.symbol );
         this.checkIfPlayerWin(caseForPlayer1);
        const caseForPlayer2 = this.grid.filter(({ index , symbol}) => symbol === this.player2.symbol );
        this.checkIfPlayerWin(caseForPlayer2);
    }

    checkIfPlayerWin(array:{index: number , symbol: SYMBOL}[]) {
         if (array.length < 3) return false;
         let ifWin = false;

        WINNING_COMBINATION.forEach((combinaison) => {
            if (!ifWin) {
             const i1 = array.find((line) => line.index === combinaison.number1);
             const i2 = array.find((line) => line.index === combinaison.number2);
             const i3 = array.find((line) => line.index === combinaison.number3);
             if (!!i1 && !!i2 && i3) {
                 const playerWinner = this.player1.symbol === i1.symbol ? this.player1 : this.player2;
                 const numbers = [];
                 numbers.push(i1.index , i2.index , i3.index)
                 this.winner = {player: playerWinner , winnerCase: numbers}
                 this.ws.send(JSON.stringify({player: playerWinner , winnerCase: numbers}))
                 rl.close();
                 ifWin = true;
             }
            }
         })
    }

    randomCaseForBot() {
         let number = Math.floor(Math.random() * (9 - 1 +1) + 1);
         while(this.grid.find(({index}) => index === number)) {
             number = Math.floor(Math.random() * (9 - 1 +1) + 1);
         }
         return number
    }

}
