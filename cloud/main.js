var twilio = require('twilio')('87se46bovanw4v5aiwy4o57', 'ia8o57awyov57yn875vyboe');


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

Parse.Cloud.define("sendCode", function(req, res) {
    var phoneNumber = req.params.phoneNumber;
    phoneNumber = phoneNumber.replace(/\D/g, '');
    var lang = req.params.language;
  if(lang !== undefined && languages.indexOf(lang) != -1) {
        language = lang;
    }
    if (!phoneNumber || (phoneNumber.length != 10 && phoneNumber.length != 11)) return res.error('Invalid Parameters');
    var query = new Parse.Query(Parse.User);
    query.equalTo('username', phoneNumber + "");
    query.first().then(function(result) {
        var min = 1000; var max = 9999;
        var num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (result) {
            result.setPassword(secretPasswordToken + num);
            result.set("language", language);
            result.save().then(function() {
                return sendCodeSms(phoneNumber, num, language);
            }).then(function() {
                res.success();
            }, function(err) {
                res.error(err);
            });
        } else {
            var user = new Parse.User();
            user.setUsername(phoneNumber);
            user.setPassword(secretPasswordToken + num);
            user.set("language", language);
            user.setACL({});
            user.save().then(function(a) {
            }).then(function() {
                res.success();
            }, function(err) {
                res.error(err);
            });
        }
    }, function (err) {
        res.error(err);
    });
});

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
