// var twilio = require('twilio')('87se46bovanw4v5aiwy4o57', 'ia8o57awyov57yn875vyboe');
var twilio = require('twilio')('AC42c81cfeff3ee6039f1dbd613420c2', 'SK131487ada3e82a4ff4aac7a7cc8bae66');

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

Parse.Cloud.define("findUser", async request => {
  const userQuery = new Parse.Query(Parse.User);
  const foundUser = await userQuery.get('fZpDmQQEVt', { useMasterKey: true });
  console.log("Found a user, user is: " + foundUser);
  return foundUser;
});

Parse.Cloud.define("findUser2", async req => {
  var phoneNumber = req.params.phoneNumber;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  console.log("Incoming phone number is: " + phoneNumber)

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', phoneNumber);

  var user = await userQuery.first();
  if(user) {
    console.log("Found a user, user is: " + user);
    //Validation stuff goes here
  } else {
    console.log("Did not find a user, create and return it");
    var newUser = new Parse.User();
    newUser.setUsername(phoneNumber);
    newUser.setPassword(secretPasswordToken + phoneNumber);
    newUser.set("language", "en");
    newUser.setACL({});
    newUser.save();
    //If this is not commented out, fails with:
    //Error: Cannot create a pointer to an unsaved ParseObject
    //user = newUser;
  }
  console.log("about to return the user");
  return user;
});

Parse.Cloud.define("findUser3", async req => {
  var phoneNumber = req.params.phoneNumber;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  console.log("Incoming phone number is: " + phoneNumber)

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', phoneNumber);

  var min = 1000; var max = 9999;
  var num = Math.floor(Math.random() * (max - min + 1)) + min;

  var user = await userQuery.first({ useMasterKey: true });
  console.log("Did we find a user, user is: " + user[0]);
  if(user) {
    console.log("Found a user, user is: " + user[0]);
    user.setPassword(secretPasswordToken + num);
    user.set("language", "en");
    user.save().then(function() {
        sendCodeSms(phoneNumber, num, language);
    })
  } else {
    console.log("Did not find a user, create and return it");
    var newUser = new Parse.User();
    newUser.setUsername(phoneNumber);
    newUser.setPassword(secretPasswordToken + phoneNumber);
    newUser.set("language", "en");
    newUser.setACL({});
    await newUser.save(); //This is the line you need to change
    //If this is not commented out, fails with:
    //Error: Cannot create a pointer to an unsaved ParseObject
    user = newUser;
  }
  console.log("about to return the user");
  return user;
});


Parse.Cloud.define("sendCode", async req => {
  console.log("in SendCode")
  var phoneNumber = req.params.phoneNumber;
  phoneNumber = phoneNumber.replace(/\D/g, '');
  var lang = req.params.language;

  if(lang !== undefined && languages.indexOf(lang) != -1) {
    language = lang;
  }
  if (!phoneNumber || (phoneNumber.length != 10 && phoneNumber.length != 11)) return res.error('Invalid Parameters');
  var query = new Parse.Query(Parse.User);
  console.log("about to look up phone number: " + phoneNumber);
  query.equalTo('username', phoneNumber + "");
  const foundUser = await query.first();

  var min = 1000; var max = 9999;
  var num = Math.floor(Math.random() * (max - min + 1)) + min;
  if (foundUser){
    console.log("found a result")
    result.setPassword(secretPasswordToken + num);
    result.set("language", "en");
    result.save().then(function() {
        sendCodeSms(phoneNumber, num, language);
    })
  } else {
    console.log("did not find a result")
    var user = new Parse.User();
    user.setUsername(phoneNumber);
    user.setPassword(secretPasswordToken + num);
    user.set("language", "en");
    user.setACL({});
    user.save().then(function(a) {
      sendCodeSms(phoneNumber, num, language);
    });
    foundUser = User
  }  

  return foundUser
})

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

function sendCodeSms(phoneNumber, code, language) {
  console.log("In SendCodeSms")
 var prefix = "+1";
 if(typeof language !== undefined && language == "ja") {
     prefix = "+81";
 }

 var promise = new Parse.Promise();
 twilio.sendSms({
     to: prefix + phoneNumber.replace(/\D/g, ''),
     from: twilioPhoneNumber.replace(/\D/g, ''),
     body: 'Your login code for Benji is ' + code
 }, function(err, responseData) {
     if (err) {
         console.log(err);
         promise.reject(err.message);
     } else {
         promise.resolve();
     }
 });
 return promise;
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
