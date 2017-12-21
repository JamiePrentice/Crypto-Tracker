<template>

    <div>     
        <br>
        <div class="ui form">
            <div class="inline fields">
                <label>I bought</label>
                <div class="field">
                    <input type="number" placeholder="1.00" v-model="cryptoOwned" :disabled="inputDisabled">
                </div>

                <div class="field">
                    <select class="ui fluid search dropdown" v-model="currencySelected" :disabled="inputDisabled">    
                        <option value="BCH">BCH</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="LTC">LTC</option>
                    </select>
                </div>

                <label>for a total of</label>

                <div class="field">
                    <select class="ui fluid search dropdown" disabled>
                        <option value="0">£</option>
                        <option value="1">$</option>
                    </select>
                </div>

                <div class="field">
                    <input type="number" placeholder="1000.00" v-model="cryptoBookprice" :disabled="inputDisabled">
                </div>
                
                <button class="ui button" type="submit" @click="inputDisabled = !inputDisabled" v-on:click="this.startTracking" :disabled="inputDisabled">Lock and track</button>

            </div>
        </div>

        <h3>Changes</h3>
        <ul>
            <li v-for="log in Logging">
                {{ log }}
            </li>
        </ul>

        <h3>Data</h3>
        <ul>
            <li v-for="data in CryptoData">
                {{ data }}
            </li>
        </ul>

        <br>
        <br>
        <br>
        <div class="help">
            <h3> Help </h3>
            <p> If notification are not firing check your permissions  </p>
            <p> Chrome Notification Settings - chrome://settings/content/notifications</p>
            <p> Firefox Notification Settings - about:preferences#privacy > Permissions > Settings </p>
        </div>
        
    </div>

</template>

<script>
    import axios from 'axios'
    import common from './common'
    // Assets
    import Megaphone from '../assets/megaphone.png'
    import Caution from '../assets/caution.png'
    import Rocket from '../assets/rocket.png'
    import Plug from '../assets/plug.png'
    

    export default {
        name: 'Notification',
        mixins: [common],
        data() {
            return {
                currencySelected: 0,
                inputDisabled: false,
                cryptoOwned: 0.01,
                cryptoBookprice: 0.01,
                previousPrice:{},
                CurrentPrice: null,
                Logging: [],
                CryptoData: []
            }
        },
        created(){
            this.enableNotifications();
        },
        methods: {

            startTracking(){
                this.fireNotification (
                    "Connected",
                    "Tracking your " + this.currencySelected,
                    Plug
                );
                setInterval(function () {
                    this.fetchCryptoData(this.currencySelected, 'GBP')
                    this.getCurrentPrice(this.currencySelected)
                }.bind(this), 15000); 
            },

            getCurrentPrice: function(crypto){
                var coinbaseEndpoint = 'https://api.coinbase.com/v2/prices/' + crypto +'-GBP/spot';
                axios.get(coinbaseEndpoint)
                    .then(response => {
                        this.previousPrice = this.CurrentPrice;
                        this.CurrentPrice = response.data.data.amount;
                            if(this.previousPrice != null && this.previousPrice != this.CurrentPrice){
                                this.Logging.push(this.info());
                                if(this.CurrentPrice > this.previousPrice){
                                    this.gain();
                                }else if (this.CurrentPrice < this.previousPrice){
                                    this.loss();
                                }
                            }
                    })
            },

            fetchCryptoData: function(crypto, currency){
                axios.all([this.fetchTime(), this.fetchSpotPrice(crypto, currency), this.fetchBuyPrice(crypto, currency), this.fetchSellPrice(crypto, currency)])
                    .then(axios.spread(function (time, spot, buy, sell) {
                        this.CryptoData.push({
                            "time": time.data.data.epoch,
                            "spot": spot.data.data.amount,
                            "buy": buy.data.data.amount,
                            "sell": sell.data.data.amount,
                            "spread": this.toTwoDecimalPlace(buy.data.data.amount - sell.data.data.amount)
                        })
                    }.bind(this)));
            },

            fetchSpotPrice: function(crypto, currency){
                return axios.get('https://api.coinbase.com/v2/prices/' + crypto + '-' +currency +'/spot');
            },

            fetchBuyPrice: function(crypto, currency){
                return axios.get('https://api.coinbase.com/v2/prices/' + crypto + '-' +currency +'/buy');
            },

            fetchSellPrice: function(crypto, currency){
                return axios.get('https://api.coinbase.com/v2/prices/' + crypto + '-' +currency +'/sell');
            },

            fetchTime: function(){
                return axios.get('https://api.coinbase.com/v2/time')
            },
            
            getPercentageChange: function(oldNumber, newNumber){
                var decreaseValue = this.invertNumber(oldNumber - newNumber);
                var symbol = (oldNumber > newNumber) ? "-" : "+";

                return symbol + ((decreaseValue / oldNumber) * 100).toFixed(2) + "%";
            },

            getChange: function(oldNumber, newNumber){
                var decreaseValue = this.invertNumber(oldNumber - newNumber);
                var symbol = (oldNumber > newNumber) ? "-" : "+";

                return symbol + "£"+ this.toTwoDecimalPlace(decreaseValue);
            },

            getTotalHoldingValue: function(){
                return this.getCurrentValue();
            },

            getCurrentValue:function(){
                return this.CurrentPrice * this.cryptoOwned;
            },

            getProfit: function(){
                return this.toTwoDecimalPlace((this.CurrentPrice * this.cryptoOwned) - this.cryptoBookprice);
            },

            getCurrentGains: function(){
                var difference = (this.previousPrice - this.CurrentPrice) * this.cryptoOwned;
                difference = this.invertNumber(this.toTwoDecimalPlace(difference));

                if(this.CurrentPrice > this.previousPrice){
                    return "You just made: £" + difference;
                }else{
                    return "You just lost: £" + difference;
                }
            },

            info: function(){
                return this.getPercentageChange(this.previousPrice, this.CurrentPrice) + " | " + this.getChange(this.previousPrice, this.CurrentPrice) + " | £" + this.toTwoDecimalPlace(this.CurrentPrice)
                + "\nPortfolio: " + this.getPercentageChange(this.cryptoBookprice, this.getTotalHoldingValue()) + " | " + this.getChange(this.cryptoBookprice, this.getTotalHoldingValue()) + " | £" + this.toTwoDecimalPlace(this.getCurrentValue())
                + "\n" + this.getCurrentGains()
            },

            gain: function(){
                this.fireNotification("HODL HODL HODL", "Spot " + this.currencySelected + ": " + this.info(), Rocket);
            },

            loss: function(){
                this.fireNotification("SELL SELL SELL", "Spot " + this.currencySelected + ": " + this.info(), Caution);
            }

        }
    }

</script>


<style scoped>
div {
    color: #FFF;
}

.help {
    color: grey
}

label {
    font-size: 1.25em !important;
    color: #FFF !important;
}

input {
    text-align: right;
}
</style>