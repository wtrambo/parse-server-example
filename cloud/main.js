var twilio = require("twilio");
twilio.initialize("87se46bovanw4v5aiwy4o57","ia8o57awyov57yn875vyboe");


Parse.Cloud.define("inviteWithTwilio", function(request, response) {
// Use the Twilio Cloud Module to send an SMS
twilio.sendSMS({
    From: "12068509234",
    To: 2068509234,
    Body: "Is this thing on?"
  }, {
success: function(httpResponse) { response.success("SMS sent!"); },
error: function(httpResponse) { response.error("Uh oh, something went wrong"); }
  });
});



// Parse.Cloud.define('hello', function(req, res) {
//   return 'Hi';
// });
