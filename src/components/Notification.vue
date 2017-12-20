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
                    <select class="ui fluid search dropdown" disabled>
                        <option value="0">LTC</option>
                        <option value="1">ETH</option>
                        <option value="2">BTC</option>
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
                
                <button class="ui button" type="submit" @click="inputDisabled = !inputDisabled">Lock and track</button>

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

        <h3> Help </h3>
        <p> Chrome Notification Settings - chrome://settings/content/notifications</p>
        <p> Firefox Notification Settings - about:preferences#privacy > Permissions > Settings </p>
        
        
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
                inputDisabled: false,
                cryptoOwned: 5.82,
                cryptoBookprice: 0.01,
                previousPrice:{},
                CurrentPrice: null,
                Logging: [],
                CryptoData: []
            }
        },
        created(){
            this.enableNotifications();
            this.fireNotification (
                "Connected",
                "Tracking your LTC",
                Plug
            );
            setInterval(function () {
                this.fetchCryptoData('LTC', 'GBP')
                this.getCurrentPrice()
            }.bind(this), 15000); 
        },
        methods: {
            getCurrentPrice: function(){
                
                var ltcEndPoint = 'https://api.coinbase.com/v2/prices/LTC-GBP/spot';
                axios.get(ltcEndPoint)
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
                return axios.get('https://api.coinbase.com/v2/prices/' + crypto + '-' +currency +'/spot')
            },

            fetchBuyPrice: function(crypto, currency){
                return axios.get('https://api.coinbase.com/v2/prices/' + crypto + '-' +currency +'/buy')
            },

            fetchSellPrice: function(crypto, currency){
                return axios.get('https://api.coinbase.com/v2/prices/' + crypto + '-' +currency +'/sell')
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
                return "Holdings £" + this.getCurrentValue();
            },

            getCurrentValue:function(){
                return this.toTwoDecimalPlace(this.CurrentPrice * this.cryptoOwned)
            },

            getProfit: function(){
                return this.toTwoDecimalPlace((this.CurrentPrice * this.cryptoOwned) - this.cryptoBookprice)
            },

            getCurrentGains: function(){
                var difference = (this.previousPrice - this.CurrentPrice) * this.cryptoOwned;
                difference = this.invertNumber(this.toTwoDecimalPlace(difference))

                if(this.CurrentPrice > this.previousPrice){
                    return "You just gained: £" + difference;
                }else{
                    return "You just lost: £" + difference;
                }
            },

            info: function(){
                return this.getPercentageChange(this.previousPrice, this.CurrentPrice) + " | " + this.getChange(this.previousPrice, this.CurrentPrice) + " | £" + this.toTwoDecimalPlace(this.CurrentPrice)
                + "\n" + this.getCurrentGains() + " | " + this.getTotalHoldingValue() 
            },

            gain: function(){
                this.fireNotification("HODL HODL HODL", "LTC: " + this.info(), Rocket);
            },

            loss: function(){
                this.fireNotification("SELL SELL SELL", "LTC: " + this.info(), Caution);
            }

        }
    }

</script>


<style scoped>
div{
    color: #FFF;
}

label{
    font-size: 1.25em !important;
    color: #FFF !important;
}

input {
    text-align: right;
}
</style>