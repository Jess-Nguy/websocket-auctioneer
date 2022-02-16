<template>
    <div>
        AUCTIONEER
        <form @submit.prevent="submitItem" id="auction" v-show="!timerSet">
            <label for="itemName" >Item name: <input type="text" id="itemName" v-model="auctionItemName"></label><br/>
            <label for="price">Price: <input type="number" min="0.00" step="0.1" id="price" v-model="auctionPrice"></label><br/>
            <label for="timeLimit">Time Limit (between 10 and 80): <input type="range" min="10" max="80" id="timeLimit" v-model="auctionTimeLimit"></label><br/>
            <button >Start</button>
        </form>
        <div v-show="timerSet">
            <h1>Highest Bid:</h1><h2>{{auctionPrice}}</h2>
            <h1>Bidder name:</h1><h2>{{highestBidderName}}</h2>
            <h1>Total number of bid received:</h1><h2>{{counter}}</h2>
        </div>
        <button @click="newAuction" v-show="timer == 0 && timerSet">New Auction</button>
        <h1 v-if="timerSet">{{ timer }}</h1>

        <h1>Bidder Stats</h1>
        <table>
            <tr>
                <th>Bidder Name</th>
                <th>Highest bid</th>
                <th># of bids</th>
            </tr>
            <tr v-for="(high, i) in bidderHighBid" :key="i">
                <td>{{ high.bidderName }}</td>
                <td>{{ high.bidOffer }}</td>
                <td>{{ high.counter }}</td>
            </tr>
        </table>
        <br/>
        <h1>History of Bids</h1>
        <table>
            <tr>
                <th>Bidder Name</th>
                <th>Bid price</th>
            </tr>
            <tr v-for="(history, i) in bidsHistory" :key="i">
                <td>{{ history.bidderName }}</td>
                <td>{{ history.bidOffer }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
import io from "socket.io-client";
export default {
    data(){
        return{
            auctionItemName: '',
            auctionPrice: 0,
            auctionTimeLimit: 10,
            timer: 0.1,
            timerSet: false,
            socket: io("localhost:3000"),
            highestBidderName: 'Auctioneer',
            counter: 0,
            bidsHistory: [],
            bidderHighBid: []
        }
    },
    methods:{
        submitItem(){
            this.bidsHistory = [];
            this.bidderHighBid = [];
            this.timer = this.auctionTimeLimit;

            let time = setInterval(() => {
                if (this.timer <= 0) {
                    
                    clearInterval(time);
                    return;
                }
                this.timer -= 1;
                this.socket.emit("submitItem",
                {
                    highestBidderName: this.highestBidderName,
                    auctionItemName: this.auctionItemName,
                    auctionPrice: this.auctionPrice,
                    baseTimer: this.auctionTimeLimit - 1,
                    timer: this.timer,
                    counter: this.counter
                }
                );
                this.socket.on("submitBid", (data) => {
                    // add to bidsHistory everytime a bid is made only when it's unique.
                    if(this.bidsHistory.indexOf(data) === -1){
                        this.bidsHistory.push(data);
                        this.bidsHistory = this.bidsHistory.reverse();
                    }
                    // add to bidderHighBid 
                    if(this.bidderHighBid.length == 0 && data.bidOffer > this.auctionPrice){
                        this.bidderHighBid.push(data);
                    }else{
                        const bidderHighIndex = this.bidderHighBid.findIndex((element) => {
                            return element.bidderName === data.bidderName;
                        });
                        if (bidderHighIndex == -1){
                            this.bidderHighBid.push(data);
                        }else{
                            if(this.bidderHighBid[bidderHighIndex].bidOffer < data.bidOffer){
                                this.bidderHighBid[bidderHighIndex] = data;
                            }else{
                                this.bidderHighBid[bidderHighIndex].counter = data.counter;
                            }
                        }
                    }
                    if(data.bidOffer > this.auctionPrice){
                        // set new highest bidder.
                        this.highestBidderName = data.bidderName;
                        this.auctionPrice = data.bidOffer;
                        this.counter = data.counter;
                    }
                });
            }, 1000);

            this.timerSet = true;
            
        },
        newAuction(){
            this.timerSet = false;
        }
    }
}
</script>
<style scoped>
table, th, td {
  border: 1px solid black;
    border-collapse: collapse;
}
tr:hover {background-color: yellow;}

th, td {
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #04AA6D;
  color: white;
}

tr:nth-child(even) {background-color: #f2f2f2;}
</style>