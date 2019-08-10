var twilio = require("twilio");
twilio.initialize("87se46bovanw4v5aiwy4o57","ia8o57awyov57yn875vyboe");


Parse.Cloud.define("inviteWithTwilio", function(request, response) {
// Use the Twilio Cloud Module to send an SMS
twilio.sendSMS({
    From: "2062806700",
    To: 2062806700,
    Body: "Testing Twilio"
  }, {
success: function(httpResponse) { response.success("SMS sent!"); },
error: function(httpResponse) { response.error("Uh oh, something went wrong"); }
  });
});


Parse.Cloud.define("auth", function(request,response) {
  const AccessToken = require('twilio').jwt.AccessToken;
  const ChatGrant = AccessToken.ChatGrant;
  
  // Used when generating any kind of tokens
  const twilioAccountSid = 'ACxxxxxxxxxx';
  const twilioApiKey = 'SKxxxxxxxxxx';
  const twilioApiSecret = 'xxxxxxxxxxxx';
  
  // Used specifically for creating Chat tokens
  const serviceSid = 'ISxxxxxxxxxxxxx';
  const identity = 'user@example.com';
  
  // Create a "grant" which enables a client to use Chat as a given user,
  // on a given device
  const chatGrant = new ChatGrant({
    serviceSid: serviceSid,
  });
  
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
  
  token.addGrant(chatGrant);
  
  token.identity = identity;
  
  // Serialize the token to a JWT string
  console.log(token.toJwt());
  response.success(token.toJwt());
});

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});
