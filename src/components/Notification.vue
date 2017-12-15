<template>

    <div>
        {{ CurrentPrice.data }}
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
                cjLtc: 5.82,
                cjEth: 0.96,
                previousPrice:{},
                CurrentPrice: null
            }
        },
        created(){
            this.registerNotifications();
            this.fireNotification (
                "Connected",
                "Let's track Colins crypto \n",
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
                                    + "\n" + this.getCjGains() + " | " + this.getCjsValue()
                                    , Rocket);
                                }else if (this.CurrentPrice < this.previousPrice){
                                    this.fireNotification  ("SELL SELL SELL", "LTC: " + 
                                    this.getPercentageChange(this.previousPrice, this.CurrentPrice) + " | " + this.getChange(this.previousPrice, this.CurrentPrice) + " | £" + this.toTwoDecimalPlace(this.CurrentPrice)
                                    + "\n" + this.getCjGains() + " | " + this.getCjsValue()
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

            getCjsValue: function(){
                return "Holdings £" + (this.CurrentPrice * this.cjLtc).toFixed(2);
            },

            getCjGains: function(){
                var difference = (this.previousPrice - this.CurrentPrice) * this.cjLtc;
                difference = this.invertNumber(this.toTwoDecimalPlace(difference))

                if(this.CurrentPrice > this.previousPrice){
                    return "Gain: £" + difference;
                }else{
                    return "Loss: £" + difference;
                }
            }

        }
    }

</script>


<style scoped>

</style>