<template>
    <div>
        {{bidderName.toUpperCase()}}
         <form @submit.prevent="submitName" id="bidder" v-show="!isRegistered">
            <label for="name" >Name: <input type="text" id="name" v-model="bidderName"></label><br/><br/>
            <button :disabled="isNameEmpty">Submit name</button>
        </form>
        <h2 v-show="isWaiting">Waiting for the next auction to begin...</h2>
        <div v-show="timer == 0">
            <h1>Highest Bidder name: </h1><h2>{{highestBidderName}}</h2>
            <h1>Highest Bid: </h1><h2>{{auctionPrice}}</h2>
        </div>
        <div v-show="timerSet">
            <h1 v-if="areHighest" style="color:green">You are the current highest bidder!</h1>
            <h1 v-if="isBidLow" style="color:red">Bid too low</h1>
            <h1>Highest Bidder name: </h1><h2>{{highestBidderName}}</h2>
            <h1>Highest Bid: </h1><h2>{{auctionPrice}}</h2>
            <h1>Auction Item: </h1><h2>{{auctionItem}}</h2>
            <form @submit.prevent="submitBid" v-show="timer > 0" >
                <label for="bid"> Bid offer: <input type="number" v-model="bidOffer" > </label>
                <br/>
                <button>BID</button>
            </form>
        </div>
        <h1 v-if="timerSet">{{ timer }}</h1>
        <br/>
    </div>
</template>

<script>
import io from "socket.io-client";
export default {
    data(){
        return{
            isNameEmpty: true,
            bidderName: '',
            isWaiting: false,
            isRegistered: false,
            socket: io("localhost:3000"),
            timerSet: false,
            timer: 0.1,
            bidOffer: 0,
            auctionPrice: 0,
            auctionItem: '',
            highestBidderName: 'Auctioneer',
            areHighest: false,
            counter: 0,
            isBidLow: false,
        }
    },
    watch:{
        bidderName: function(value){
            if(value == ''){
                this.isNameEmpty = true;
            }else{
                this.isNameEmpty = false;
            }
        }
    },
    
    methods:{
        submitName(){
            this.isWaiting = true;
            this.isRegistered = true;

            this.socket.on("deliverAuctionItemTime", (data) => {
                if(data.baseTimer == data.timer){
                    this.timerSet = true;
                    this.isWaiting = false; 
                }
                if(this.timerSet){
                    console.log("delivered!! ", data);
                    this.timer = data.timer;
                    this.auctionPrice = data.auctionPrice;
                    this.auctionItem = data.auctionItemName;
                    this.highestBidderName = data.highestBidderName;
                    this.counter = data.counter;
                    this.socket.on("areHighest", () => {
                        this.areHighest = true;
                    });
                    if (this.bidOffer < data.auctionPrice) {
                        this.areHighest = false;
                    }
                }
                if(data.timer == 0){
                    this.timerSet = false;
                    this.isWaiting = true;
                    this.isBidLow = false;
                    this.areHighest = false;     
                }
            });
        },
        submitBid(){
           if(this.timer > 0){
                this.counter++;
                this.socket.emit("submitBid",
                    {
                        bidderName: this.bidderName,
                        bidOffer: this.bidOffer,
                        counter: this.counter
                    }
                );
           }
        if(this.bidOffer > this.auctionPrice ){
            this.isBidLow = false;                
        }else{
            this.isBidLow = true;
        }
            
        }

    }
}
</script>
<style scoped>

</style>