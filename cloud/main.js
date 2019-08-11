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


// Parse.Cloud.define("findUser", function(request, response) {
// // function makeNewNode(geoPoint, callback) {
  
//   var phoneNumber = request.params.phoneNumber;
//   phoneNumber = phoneNumber.replace(/\D/g, '');

//   var query = new Parse.Query(Parse.User);
//   query.equalTo("username", phoneNumber);
//   query.first({
//     success: function(results) {
//       console.log(results);
//       console.log(results + " -- found this!");
//       if (results == undefined) {
//         node.set("location", geoPoint);
//         node.set("stop", null);
//         node.save(function() {
//           console.log(node.id);
//           callback(null, node);
//         });
//       } else {
//         callback(null, results);
//       }
//     },
//     error: function(error) {
//       console.log("Failed to create a node. Error: " + error.message + ".");
//       callback(error);
//     }
//   });
// })

// Parse.Cloud.define("findUser", function(request, response) {
//   var phoneNumber = request.params.phoneNumber;
//     phoneNumber = phoneNumber.replace(/\D/g, '');
//   var userQuery = new Parse.Query(Parse.User);
//   userQuery.get( phoneNumber ).then( function(result) { 
//       foundUser = result; 
//       if(foundUser.length != 0){
//         console.log("Found a user, user is: " + foundUser)
//         response.success("Found the user!")
//       } else {
//         console.log("did not find a foundUser")
//         response.error("did not find the user")
//       }
      
//       return foundUser
//   })
// });
  
//   .then( function( results ) {
//       if( results.length == 0 ) { 
//           var userCoin = request.user.get("coin");
//           var priceCoin = purchaseDeck.get("priceCoin");
//           if( userCoin >= priceCoin ) {
//               console.log("/purchase made/" + userCoin + " - " + priceCoin + " = " + userCoin - priceCoin);
//               request.user.set("coin", userCoin - priceCoin);
//               return request.user.save();
//           }
//           else {
//               return Parse.Promise.error("not enough coins");
//           }
//       }
//       else {
//           return Parse.Promise.error("already has deck");
//       }
//   }).then( function(result) {
//       var newUserDeckObject = new Parse.Object("User_Deck");
//       newUserDeckObject.set("userId", request.user);
//       newUserDeckObject.set("deckId", purchaseDeck);
//       console.log("/purchase deck added");
//       return newUserDeckObject.save();
//   }).then( function(result) {
//       var returns = {};
//       returns["userCoins"] = request.user.get("coin");
//       returns["purchasedDeck"] = purchaseDeck.get("nickname");
//       response.success(returns);
//       console.log(request.user.username + "/purchase deck succeeded--/");
//   }, function(error) {
//       response.error(error);
//   });
// });

Parse.Cloud.define("findUser2", function(request, response) {
  
  var phoneNumber = request.params.phoneNumber;
    phoneNumber = phoneNumber.replace(/\D/g, '');

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("username", phoneNumber);

  console.log("In findUserFunction")

  userQuery.first
  ({
      useMasterKey: true,
      success: function(thisuser)
        {
          console.log("Success!")
          response.success("ok");
        },
      error: function(error)
        {
          console.log("Failure :(")
          response.error("failed with error: " + error.message);
        }
  });
});

Parse.Cloud.define('findUser3', function(request, response) {

  var phoneNumber = request.params.phoneNumber;
    phoneNumber = phoneNumber.replace(/\D/g, '');

  // var user = new Parse.User();
  var query = new Parse.Query(Parse.User);
  query.equalTo("username", phoneNumber);
  query.first({
    success: function(object) {
      console.log("Success!")
      // Set the job's success status
      response.success("Success Message");
    },
    error: function(error) {
      console.log("Still didn't find it")
      // Set the job's error status
      response.error(phoneNumber );
    }
  });

});

Parse.Cloud.define("sendCode", function(req, res) {
    var phoneNumber = req.params.phoneNumber;
    phoneNumber = phoneNumber.replace(/\D/g, '');
    var lang = req.params.language;
  if(lang !== undefined && languages.indexOf(lang) != -1) {
      language = lang;
  }
  if (!phoneNumber || (phoneNumber.length != 10 && phoneNumber.length != 11)) return res.error('Invalid Parameters');
  
  
  var query = new Parse.Query(Parse.User);
  // query.equalTo("username", phoneNumber);
  query.equalTo("objectId", "fZpDmQQEVt")
  query.useMasterKey = true;
  console.log("username we're looking for: " + phoneNumber);
  console.log("Is parsing strings working? " + ("2062806700" == phoneNumber));
  query.find().then(function(resultArray) {
    if(resultArray.length == 0){
      console.log("no results found with find()");
    } else {
      console.log("we found results with find()!");
      console.log(resultArray)
    }
  })

  query.first().then(function(result) {
      console.log("In first with result: " + result)
      var min = 1000; var max = 9999;
      var num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (result) {
          console.log("Found the user")
          result.setPassword(secretPasswordToken + num);
          result.set("language", "en");
          result.save().then(function() {
              return sendCodeSms(phoneNumber, num, language);
          }).then(function() {
              res.success();
          }, function(err) {
              res.error(err);
          });
      } else {
        console.log("creating new user")
          var user = new Parse.User();
          user.setUsername(phoneNumber);
          user.setPassword(secretPasswordToken + num);
          user.set("language", "en");
          user.setACL({});
          user.save().then(function(a) {
          }).then( function() {
              return sendCodeSms(phoneNumber, num, language);
          }).then(function() {
              res.success();
          }, function(err) {
              res.error(err);
          });
      }
  }, function (err) {
      console.log(err);
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
