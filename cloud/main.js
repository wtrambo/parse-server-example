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
    await newUser.save(); 

    twilioClient.messages.create({
      body: 'Your phone number was just used on the Benji App. Your auth code is: ' + num,
      from: '+12012560616', 
      to: phoneNumber  
    })
    console.log("Sent the new user SMS")
    user = newUser;
  }
  console.log("about to return the user");
  console.log("req currently is: " + req);
  console.log("res currently is: " + res);
  res.success(user)
  return user;
});


// Parse.Cloud.define("sendCode", async req => {
//   console.log("in SendCode")
//   var phoneNumber = req.params.phoneNumber;
//   phoneNumber = phoneNumber.replace(/\D/g, '');
//   var lang = req.params.language;

//   if(lang !== undefined && languages.indexOf(lang) != -1) {
//     language = lang;
//   }
//   if (!phoneNumber || (phoneNumber.length != 10 && phoneNumber.length != 11)) return res.error('Invalid Parameters');
//   var query = new Parse.Query(Parse.User);
//   console.log("about to look up phone number: " + phoneNumber);
//   query.equalTo('username', phoneNumber + "");
//   const foundUser = await query.first();

//   var min = 1000; var max = 9999;
//   var num = Math.floor(Math.random() * (max - min + 1)) + min;
//   if (foundUser){
//     console.log("found a result")
//     result.setPassword(secretPasswordToken + num);
//     result.set("language", "en");
//     result.save().then(function() {
//       console.log("About to text number: " + phoneNumber)
//       twilioClient.messages.create({
//         body: 'Hello from Benji-api! Your login code is: ' + num,
//         from: '+12012560616', // From a valid Twilio number
//         to: phoneNumber  // Text this number
//       })
//       // .then((message) => console.log(message.sid));
//       //   sendCodeSms(phoneNumber, num, language);
//     })
//   } else {
//     console.log("did not find a result")
//     var user = new Parse.User();
//     user.setUsername(phoneNumber);
//     user.setPassword(secretPasswordToken + num);
//     user.set("language", "en");
//     user.setACL({});
//     user.save().then(function(a) {
//       // sendCodeSms(phoneNumber, num, language);
//       console.log("About to text number: " + phoneNumber)
//       twilioClient.messages.create({
//         body: 'Hello from Benji-api! Your login code is: ' + num,
//         from: '+12012560616', // From a valid Twilio number
//         to: phoneNumber  // Text this number
//       })
//     });
//     foundUser = User
//   }  

//   return foundUser
// })

Parse.Cloud.define("login", function(req, res) {

 var phoneNumber = req.params.phoneNumber;
 phoneNumber = phoneNumber.replace(/\D/g, '');

 if (phoneNumber && req.params.codeEntry) {
     Parse.User.logIn(phoneNumber, secretPasswordToken + req.params.codeEntry).then(function (user) {
         res.success(user._sessionToken);
     }, function (err) {
         res.error(err);
     });
 } else {
     res.error('Invalid parameters.');
 }
});

Parse.Cloud.define("smsStatusValidation", function(request,response) {
  console.log("GOT A TWILIO CALLBACK!")
  console.log("Callback is: " + request.params)
});

Parse.Cloud.define("inviteWithTwilio", function(request, response) {

  twilioClient.messages.create({
    body: 'Hello from Benji-api!',
    from: '+12012560616', // From a valid Twilio number
    to: '+12062806700',  // Text this number
    statusCallback: 'https://benji-api.herokuapp.com/functions/smsStatusValidation',
  })
  .then((message) => console.log(message.sid));

  // // Use the Twilio Cloud Module to send an SMS
  // twilio.sendSMS({
  //   From: "myTwilioPhoneNumber",
  //   To: request.params.number,
  //   Body: "Start using Parse and Twilio!"
  // }, {
  //   success: function(httpResponse) { response.success("SMS sent!"); },
  //   error: function(httpResponse) { response.error("Uh oh, something went wrong"); }
  // });
});

function sendCodeSms(phoneNumber, code, language) {
  console.log("In SendCodeSms")
 var prefix = "+1";
 if(typeof language !== undefined && language == "ja") {
     prefix = "+81";
 }

 var thePromise = new Parse.Promise();
 twilio.sendSms({
     to: prefix + phoneNumber.replace(/\D/g, ''),
     from: twilioPhoneNumber.replace(/\D/g, ''),
     body: 'Your login code for Benji is ' + code
 }, function(err, responseData) {
     console.log("In Twilio completion")
     if (err) {
        console.log("We have an error")
         console.log(err);
         thePromise.reject(err.message);
     } else {
        console.log("No error detected, we should do the promise")
        thePromise.resolve();
     }
 });
 return thePromise;
}




Parse.Cloud.define("auth", function(request,response) {
  const AccessToken = require('twilio').jwt.AccessToken;
  const ChatGrant = AccessToken.ChatGrant;
  
  // Used when generating any kind of tokens
  const twilioAccountSid = 'AC42c81cfeff3ee6039f1dbd613420c267';
  const twilioApiKey = 'SK131487ada3e82a4ff4aac7a7cc8bae66';
  const twilioApiSecret = 'kEyPXBdfRazuzqmSqZAr4i2gcsK3nHlZ';
  
  // Used specifically for creating Chat tokens
  const serviceSid = 'IS2bb5009c33fe480eb948f985d10ca201';
  const identity = 'wtrambo@gmail.com';
  
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
