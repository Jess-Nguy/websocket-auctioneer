/*
StAuth10222: I Jess Nguyen, 000747411 certify that this material is my original work. 
No other person's work has been used without due acknowledgement. I have not made my work 
available to anyone else.
*/

// Required packages
var app = require("express")();

const server = app.listen(3000, function () {
  console.log("listening on *:3000");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Variable for storing the highest bidder
var data;
// If we have a connection....
io.on("connection", function (socket) {
  // when the auctioneer submits a question...
  socket.on("submitItem", function (auctioneerData) {
    // Set the correct answer
    data = auctioneerData;

    console.log("Item submitted: " + JSON.stringify(auctioneerData));
    // Broadcast the auction to all the bidder (but not the auctioneer/sender)
    socket.broadcast.emit("deliverAuctionItemTime", auctioneerData);
  });

  // when a bidder submits a bid...
  socket.on("submitBid", function (bidderData) {
    console.log("Bid submitted: " + JSON.stringify(bidderData));

    socket.broadcast.emit("submitBid", { bidderName: bidderData.bidderName, bidOffer: bidderData.bidOffer, counter: bidderData.counter });
    // Send back if bidder is their was the highest.
    if (bidderData.bidOffer > data.auctionPrice) {
      io.to(socket.id).emit("areHighest");
    }
  });
});
