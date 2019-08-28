var twilio = require('twilio')
var twilioClient = new twilio('AC42c81cfeff3ee6039f1dbd613420c267', '04ea44eb31ef8c7456453b7ced5a3fb6');

const secretPasswordToken = "fourScoreAnd7Yearsago"

Parse.Cloud.define('createToken', function(req, res) {
  var token = new AccessToken(accountSid, apiKeySid, apiKeySecret);
  var endpointId = 'Benji' + req.params.phoneNumber + req.params.deviceID;
  var ipmGrant = new IpMessagingGrant({
    serviceSid: serviceSid,
    endpointId: endpointId
    });
  token.addGrant(ipmGrant);
  token.identity = req.params.phoneNumber;
  console.log(token.toJwt());
  res.success(token.toJwt())
});
// Create the Cloud Function

Parse.Cloud.define("sendCode", async (req, res) => {
  var phoneNumber = req.params.phoneNumber;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', phoneNumber);

  var min = 1000; var max = 9999;
  var num = Math.floor(Math.random() * (max - min + 1)) + min;

  var user = await userQuery.first({ useMasterKey: true });
  
  if(user) {
    console.log("Found a user, user is: " + user.getUsername());
    user.setPassword(secretPasswordToken + num);
    user.save(null, { useMasterKey: true }).then(function() {
        twilioClient.messages.create({
          body: 'Your phone number was just used on the Benji App. Your auth code is: ' + num,
          from: '+12012560616', 
          to: phoneNumber  
        })
        console.log("Sent the existing user SMS")
    })
  } else {
    console.log("Did not find a user, create and return it");
    var newUser = new Parse.User();
    newUser.setUsername(phoneNumber);
    newUser.setPassword(secretPasswordToken + phoneNumber);
    newUser.set("language", "en");
    newUser.setACL({});
    await newUser.signUp(); 

    twilioClient.messages.create({
      body: 'Your phone number was just used on the Benji App. Your auth code is: ' + num,
      from: '+12012560616', 
      to: phoneNumber  
    })
    console.log("Sent the new user SMS")
    user = newUser;
  }
  console.log("about to return success with num: " + num);
  return true;
});

Parse.Cloud.define("validateCode", async req => {
  var phoneNumber = req.params.phoneNumber;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  var authCode = req.params.authCode;
  var password = secretPasswordToken + authCode

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', phoneNumber);

  const user = await Parse.User.logIn(phoneNumber, password);
  
  if(user) {
    console.log("User found!");
    return user
  } else {
    console.log("User NOT found :(");
    res.error("User not found");  
  }
});

// Parse.Cloud.define("auth", function(request,response) {
//   const AccessToken = require('twilio').jwt.AccessToken;
//   const ChatGrant = AccessToken.ChatGrant;
  
//   // Used when generating any kind of tokens
//   const twilioAccountSid = 'AC42c81cfeff3ee6039f1dbd613420c267';
//   const twilioApiKey = 'SK131487ada3e82a4ff4aac7a7cc8bae66';
//   const twilioApiSecret = 'kEyPXBdfRazuzqmSqZAr4i2gcsK3nHlZ';
  
//   // Used specifically for creating Chat tokens
//   const serviceSid = 'IS2bb5009c33fe480eb948f985d10ca201';
//   const identity = 'wtrambo@gmail.com';
  
//   // Create a "grant" which enables a client to use Chat as a given user,
//   // on a given device
//   const chatGrant = new ChatGrant({
//     serviceSid: serviceSid,
//   });
  
//   // Create an access token which we will sign and return to the client,
//   // containing the grant we just created
//   const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
  
//   token.addGrant(chatGrant);
  
//   token.identity = identity;
  
//   // Serialize the token to a JWT string
//   console.log(token.toJwt());
//   response.success(token.toJwt());
// });
