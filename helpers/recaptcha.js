const fetch = require('node-fetch')


exports.checkForRobots = async (address, captcha) => {
  const url = process.env.RECAPTCHA_VERIFICATION_URL  
  const key = process.env.RECAPTCHA_SECRET_KEY
  const verificationUrl = `${url}?secret=${key}&response=${captcha}&remoteip=${address}`
  console.log(verificationUrl)  

  let response = await fetch(verificationUrl,{
    method: 'GET',
    headers:{
      'Content-Type': 'application/json'
    }
  })
  let res = await response.json()  
  console.log(res)
  return res;
}

// app.post('/submit',function(req,res){
//   // g-recaptcha-response is the key that browser will generate upon form submit.
//   // if its blank or null means user has not selected the captcha, so return the error.
//   if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
//     return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
//   }
//   // Put your secret key here.
//   var secretKey = "--paste your secret key here--";
//   // req.connection.remoteAddress will provide IP address of connected user.
//   var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
//   // Hitting GET request to the URL, Google will respond with success or error scenario.
//   request(verificationUrl,function(error,response,body) {
//     body = JSON.parse(body);
//     // Success will be true or false depending upon captcha validation.
//     if(body.success !== undefined && !body.success) {
//       return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
//     }
//     res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
//   });
// });