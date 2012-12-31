var mail = function (mailOptions)
{
	var from = "jeffkaufman@kaufmaninternational.com";
	var nodemailer = require("nodemailer");
		
	// create reusable transport method (opens pool of SMTP connections)
	var smtpTransport = nodemailer.createTransport("SMTP",{
	    service: "Gmail",
	    auth: {
	        user: "jeffkaufman@kaufmaninternational.com",
	        pass: "norbert67"
	    }
	});

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	    }	
    smtpTransport.close(); // shut down the connection pool, no more messages
	});
}

module.exports = mail;
