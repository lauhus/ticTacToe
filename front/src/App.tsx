import React, { useEffect, useRef, useState } from "react";

export enum SYMBOL {
  "x" = "X",
  "o" = "O"
}


const TicTacToeComponent = () => {
  const [player1, setPlayer1] = useState<{ name :string , symbol: SYMBOL} | null>(null);
  const [player2, setPlayer2] = useState<{ name :string , symbol: SYMBOL} | null>(null);
  const [winner, setWinner] = useState<{ name :string , symbol: SYMBOL} | null>(null);
  const [grid, setGrid] = useState<{ index: number; symbol: string }[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
    const [winningCells, setWinningCells] = useState<number[]>([]);

  const [ isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const websocket = new WebSocket("ws://localhost:8081"); // Remplacez l'URL par l'URL de votre serveur WebSocket
        wsRef.current = websocket;
        setWs(wsRef.current);

        websocket.onopen = () => {
            console.log("WebSocket connection established.");
            setIsConnected(true)
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.player1 && data.player2) {
                setPlayer1(data.player1);
                setPlayer2(data.player2);
                setGameStarted(true);
            } else if (data.player && data.winnerCase) {
                setWinner(data.player);
                setWinningCells(data.winnerCase);
            } else if (data.index && data.symbol) {
                setGrid((prevGrid) => [...prevGrid, { index: data.index, symbol: data.symbol }]);
            }
        };

        websocket.onclose = () => {
            setIsConnected(false)
            console.log("WebSocket connection closed.");
        };

        return () => {
            setIsConnected(false);
            websocket.close();
        };
    }, []);

  const handleStartGame = () => {
    if (ws) {
      ws.send("start");
    }
  };

    return (
        <div style={{ display: "flex" , justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
            <h1 style={{ textAlign: "center", fontSize: "36px", marginBottom: "20px" }}>Tic Tac Toe</h1>

            <button
                disabled={!isConnected}
                style={{ margin: "40px", padding: "20px", fontSize: "18px" , width: "120px", cursor: "pointer", borderRadius: "20px" , backgroundColor: isConnected ? "green": "grey", color: isConnected ? "white" : "darkgrey"}}
                onClick={handleStartGame}
            >
                Start Game
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {[1, 2, 3].map((index) => {
                        const cellData = grid.find((cell) => cell.index === index);
                        const cellContent = cellData ? cellData.symbol : index;
                        const isWinningCell = winningCells.includes(index);
                        return (
                            <div
                                key={index}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    border: "1px solid black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "36px",
                                    backgroundColor: isWinningCell ? "yellow" : "white",
                                }}
                            >
                                {cellContent}
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {[4, 5, 6].map((index) => {
                        const cellData = grid.find((cell) => cell.index === index);
                        const cellContent = cellData ? cellData.symbol : index;
                        const isWinningCell = winningCells.includes(index);
                        return (
                            <div
                                key={index}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    border: "1px solid black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "36px",
                                    backgroundColor: isWinningCell ? "yellow" : "white",
                                }}
                            >
                                {cellContent}
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {[7, 8, 9].map((index) => {
                        const cellData = grid.find((cell) => cell.index === index);
                        const cellContent = cellData ? cellData.symbol : index;
                        const isWinningCell = winningCells.includes(index);
                        return (
                            <div
                                key={index}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    border: "1px solid black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "36px",
                                    backgroundColor: isWinningCell ? "yellow" : "white",
                                }}
                            >
                                {cellContent}
                            </div>
                        );
                    })}
                </div>

                <>
                    <div className="players-info" style={{ display:"flex", flexDirection:"row"}}>
                            <div style={{ margin: "40px"}}>
                                {player1 && (
                                    <>
                                        <h2>{player1.name}</h2>
                                        <div>{player1.symbol}</div>
                                    </>
                                )}
                            </div>
                            <div style={{ margin: "40px"}}>
                                {player2 && (
                                    <>
                                        <h2>{player2.name}</h2>
                                        <div>{player2.symbol}</div>
                                    </>
                                )}
                            </div>
                    </div>
                    { winner && <h3 style={{ textAlign: "center", fontSize: "24px", color: "green" }}>Winner: {winner.name}</h3>}
                    {!winner && grid.length === 9 && <h3 style={{ textAlign: "center", fontSize: "24px", color: "green" }}> EQUALITY</h3>}
                </>
        </div>
        </div>
    );
};

export default TicTacToeComponent;
