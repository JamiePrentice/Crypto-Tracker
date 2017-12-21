import Ping from '../assets/ping.wav'

var CommonFunctions = {

    methods: {

        toTwoDecimalPlace: function(string) {
            var fixed = parseFloat(string);
            return fixed.toLocaleString('en', {currency: "GBP", minimumFractionDigits: "2", maximumFractionDigits: "2"});
        },

        toThousandSeperated: function(string) {
            if (string === null) return 0;
                return parseFloat(string).toLocaleString('en', {currency: "USD"});
        },

        invertNumber: function(number){
            if (number < 0){
                number *= -1;
            }
            return number;
        },

        fireNotification: function(title, text, image){
            new Audio(Ping).play();
            var notification = new Notification(
                title, { 
                    body: text,
                    icon: image
                }
            );

            notification.onclick = function() {
                window.focus();
            };
        },

        enableNotifications: function(){
            if(window.Notification && Notification.permission !== "denied") {
                Notification.requestPermission(function(status) {
                });
            }
        },

        clearNotifications: function(){
            // Clear all old notifications here
        }
        
    }
};

export default CommonFunctions;