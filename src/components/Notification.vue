<template>

    <div></div>

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
                previousLiteCoin:{},
                litecoin: null
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
                this.getLitecoin()
            }.bind(this), 10000); 
        },
        methods: {
            getLitecoin: function(){
                
                var ltcEndPoint = 'https://api.cryptonator.com/api/ticker/ltc-gbp';
                axios.get(ltcEndPoint)
                    .then(response => {
                        this.previousLiteCoin = this.litecoin;
                        this.litecoin = response.data;
                        if(this.previousLiteCoin != null){
                            if(this.litecoin.ticker.price > this.previousLiteCoin.ticker.price){
                                this.fireNotification  ("BUY BUY BUY", "LTC: " + 
                                this.getPercentageChange(this.previousLiteCoin, this.litecoin) + " | " + this.getChange(this.previousLiteCoin, this.litecoin) + " | £" + this.toTwoDecimalPlace(this.litecoin.ticker.price)
                                 + "\n" + this.getCjGains() + " | " + this.getCjsValue()
                                 , Rocket);
                            }else if (this.litecoin.ticker.price < this.previousLiteCoin.ticker.price){
                                this.fireNotification  ("SELL SELL SELL", "LTC: " + 
                                this.getPercentageChange(this.previousLiteCoin, this.litecoin) + " | " + this.getChange(this.previousLiteCoin, this.litecoin) + " | £" + this.toTwoDecimalPlace(this.litecoin.ticker.price)
                                + "\n" + this.getCjGains() + " | " + this.getCjsValue()
                                , Caution);
                            }
                        }
                    })
            },


            getPercentageChange: function(oldNumber, newNumber){
                var decreaseValue = this.invertNumber(oldNumber.ticker.price - newNumber.ticker.price);
                var symbol = (oldNumber.ticker.price > newNumber.ticker.price) ? "-" : "+";

                return symbol + ((decreaseValue / oldNumber.ticker.price) * 100).toFixed(2) + "%";
            },

            getChange: function(oldNumber, newNumber){
                var decreaseValue = this.invertNumber(oldNumber.ticker.price - newNumber.ticker.price);
                var symbol = (oldNumber.ticker.price > newNumber.ticker.price) ? "-" : "+";

                return symbol + "£"+ this.toTwoDecimalPlace(decreaseValue);
            },

            getCjsValue: function(){
                return "Holdings £" + (this.litecoin.ticker.price * this.cjLtc).toFixed(2);
            },

            getCjGains: function(){
                var difference = (this.previousLiteCoin.ticker.price - this.litecoin.ticker.price) * this.cjLtc;
                difference = this.invertNumber(this.toTwoDecimalPlace(difference))

                if(this.litecoin.ticker.price > this.previousLiteCoin.ticker.price){
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