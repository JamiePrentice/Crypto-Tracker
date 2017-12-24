<template>

    <div>

        <div id="container" style="height: 400px; min-width: 310px"></div>

        <h3> Logs </h3>
        <ul>
            <li v-for="message in messages">
                {{ message }}
            </li>
        </ul>

	</div>

</template>

<script>
import common from '../components/common'

export default {
    data() {
        return {
            messages: [],
        }
    },
    mixins: [common],
    created (){
        this.snapshotVolume();
    },
  methods: {
      snapshotVolume: function(){
          if ("WebSocket" in window) {
            var ws = new WebSocket("wss://ws-feed.gdax.com");
            var req = {
                "type": "subscribe",
                "channels": [{ 
                    "name": "ticker", 
                    "product_ids": ["ETH-USD"] 
                }]
            };

            ws.onopen = function() {
                ws.send(JSON.stringify(req));
            };

            ws.onmessage = function(data) {
                var response = JSON.parse(data.data);
                var data = {
                    time: new Date(response.time).getTime(),
                    type: response.product_id,
                    price: this.toTwoDecimalPlace(response.price),
                    best_bid: this.toTwoDecimalPlace(response.best_bid),
                    best_ask: this.toTwoDecimalPlace(response.best_ask),
                    open_24h: this.toTwoDecimalPlace(response.open_24h),
                    volume_24h: this.toTwoDecimalPlace(response.volume_24h).replace(/\,/g,''),
                    low_24h: this.toTwoDecimalPlace(response.low_24h),
                    high_24h: this.toTwoDecimalPlace(response.high_24h),
                    side: response.side,
                }

                if(!isNaN(data.time) && data.time !== null){
                    this.messages.push(data);
                    this.draw();
                }
            }.bind(this);

            ws.onclose = function() {
            };
        }
      },
      draw: function(){
        var ohlc = [];
        var volume = [];
        var lastVolume = 0;
        var dataLength = this.messages.length;
        // set the allowed units for data grouping
        var groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]];

        this.messages.forEach(message => {
            var snapshotVolume = message.volume_24h - lastVolume;
            if(snapshotVolume == message.volume_24h){
                snapshotVolume = 0;
            }

            lastVolume = message.volume_24h;

            ohlc.push([
                message.time,
                parseFloat(message.open_24h), // open
                parseFloat(message.high_24h), // high
                parseFloat(message.low_24h), // low
                parseFloat(message.low_24h) // close
            ]);

            volume.push([
                message.time, // the date
                parseFloat(snapshotVolume)
                // parseInt(message.volume_24h - lastVolume) // the volume
            ]);
            
        });


    // create the chart
    Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 1
        },

        title: {
            text: 'AAPL Historical'
        },

        yAxis: [{
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],

        tooltip: {
            split: true
        },
        plotOptions: {
            series: {
                animation: false
            }
        },

        series: [
            {
                type: 'candlestick',
                name: 'AAPL',
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }]
    });
      }
  }
}

</script>

<style scoped>

h3,p,ul {
    color: #FFF;
}

</style>