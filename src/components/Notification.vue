<template>

    <div>
        <form class="form-inline">
            <div class="form-group">
                <label># of LTC:</label>
                <input type="text" v-model="numberCoinsOwned" class="form-control">
            </div>
        </form>
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
                numberCoinsOwned: 5.82,
                previousPrice:{},
                CurrentPrice: null
            }
        },
        created(){
            this.registerNotifications();
            this.fireNotification (
                "Connected",
                "Tracking your LTC",
                Plug
            );
            setInterval(function () {
                this.getCurrentPrice()
            }.bind(this), 10000); 
        },
        methods: {
            getCurrentPrice: function(){
                
                var ltcEndPoint = 'https://api.coinbase.com/v2/prices/LTC-GBP/spot';
                axios.get(ltcEndPoint)
                    .then(response => {
                        this.previousPrice = this.CurrentPrice;
                        this.CurrentPrice = response.data.data.amount;
                            if(this.previousPrice != null){
                                if(this.CurrentPrice > this.previousPrice){
                                    this.fireNotification  ("BUY BUY BUY", "LTC: " + 
                                    this.getPercentageChange(this.previousPrice, this.CurrentPrice) + " | " + this.getChange(this.previousPrice, this.CurrentPrice) + " | £" + this.toTwoDecimalPlace(this.CurrentPrice)
                                    + "\n" + this.getCurrentGains() + " | "+ this.getTotalHoldingValue()
                                    , Rocket);
                                }else if (this.CurrentPrice < this.previousPrice){
                                    this.fireNotification  ("SELL SELL SELL", "LTC: " + 
                                    this.getPercentageChange(this.previousPrice, this.CurrentPrice) + " | " + this.getChange(this.previousPrice, this.CurrentPrice) + " | £" + this.toTwoDecimalPlace(this.CurrentPrice)
                                    + "\n" + this.getCurrentGains() + " | "+ this.getTotalHoldingValue()
                                    , Caution);
                                }
                            }
                    })
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
                return this.toTwoDecimalPlace(this.CurrentPrice * this.numberCoinsOwned)
            },

            getCurrentGains: function(){
                var difference = (this.previousPrice - this.CurrentPrice) * this.numberCoinsOwned;
                difference = this.invertNumber(this.toTwoDecimalPlace(difference))

                if(this.CurrentPrice > this.previousPrice){
                    return "You just gained: £" + difference;
                }else{
                    return "You just lost: £" + difference;
                }
            }

        }
    }

</script>


<style scoped>
div{
    color: #FFF;
}
label{
    color: #FFF;
}
</style>