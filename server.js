const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let feed = [];

/* BLACKJACK STATE */
let blackjack = {
  players: {},
  dealer: []
};

function card() {
  return Math.floor(Math.random() * 10) + 1;
}

function sum(a) {
  return a.reduce((x, y) => x + y, 0);
}

io.on("connection", (socket) => {
  players[socket.id] = {
    name: "Player_" + socket.id.slice(0, 4),
    points: 1000
  };

  socket.emit("init", { id: socket.id, players, feed });

  io.emit("players", players);

  /* FEED */
  socket.on("feed", (msg) => {
    feed.unshift(msg);
    feed = feed.slice(0, 20);
    io.emit("feed", feed);
  });

  /* JOIN BLACKJACK */
  socket.on("bj_join", () => {
    blackjack.players[socket.id] = {
      hand: [card(), card()],
      bet: 0,
      stand: false
    };
    io.emit("bj_state", blackjack);
  });

  socket.on("bj_bet", (bet) => {
    if (!blackjack.players[socket.id]) return;
    blackjack.players[socket.id].bet = bet;
    io.emit("bj_state", blackjack);
  });

  socket.on("bj_hit", () => {
    let p = blackjack.players[socket.id];
    if (!p) return;
    p.hand.push(card());
    io.emit("bj_state", blackjack);
  });

  socket.on("bj_stand", () => {
    let p = blackjack.players[socket.id];
    if (p) p.stand = true;

    let done = Object.values(blackjack.players).every(x => x.stand);

    if (done) {
      blackjack.dealer = [card(), card()];

      while (sum(blackjack.dealer) < 17) {
        blackjack.dealer.push(card());
      }

      let d = sum(blackjack.dealer);

      for (let id in blackjack.players) {
        let pl = blackjack.players[id];
        let score = sum(pl.hand);

        if (score > 21 || (d <= 21 && d >= score)) {
          players[id].points -= pl.bet;
        } else {
          players[id].points += pl.bet;
          feed.unshift(players[id].name + " won blackjack!");
        }
      }

      io.emit("feed", feed);
      io.emit("players", players);

      blackjack.players = {};
      blackjack.dealer = [];
    }

    io.emit("bj_state", blackjack);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    delete blackjack.players[socket.id];
    io.emit("players", players);
  });
});

server.listen(3000, () => {
  console.log("scribble.bet running on http://localhost:3000");
});
