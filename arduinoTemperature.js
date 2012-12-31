"use strict";

var arduinoSerialPort = '/dev/ttyACM0';	//Serial port over USB connection between the Raspberry Pi and the Arduino
var serialport = require('serialport');
var lastTemperature = 0;
var updateEmailInterval = 3600000; //schedule to send out regular updates
var dateLastInfo = new Date(0);


var fs = require('fs');
function writeFile(text)
{
	fs.writeFile('temperature.json', text, function(err)
	{
		if (err) console.warn(err);
	});
}

var serialPort = new serialport.SerialPort(arduinoSerialPort,
{//Listening on the serial port for data coming from Arduino over USB
	parser: serialport.parsers.readline('\n')
});

serialPort.on('data', function (data)
{//When a new line of text is received from Arduino over USB
	try
	{
		var j = JSON.parse(data);
		lastTemperature = j.tempF;
		dateLastInfo = new Date();
		writeFile('{"tempF":"' + lastTemperature + '"}');
	}
	catch (ex)
	{
		console.warn(ex);
	}
});

var emailInterval=setInterval(function()
{//email status
	if (lastTemperature != ""){
	var mail = require('./mail');
	mail( 
			{
			from: "jeffkaufman@kaufmaninternational.com", // sender address
	    	to: "agedgouda@gmail.com", // list of receivers
	    	subject: "Beer Status", // Subject line
	 		text: "Current Temperature is: "+lastTemperature+"F",
	 		html: "Current Temperature <br /> "+lastTemperature+"F"
	 		}
	 	);
	}
},updateEmailInterval);

function colourScale(t)
{//Generate an HTML colour in function of the temperature
	if (t <= -25.5) return '0,0,255';
	if (t <= 0) return Math.round(255 + (t * 10)) + ',' + Math.round(255 + (t * 10)) + ',255';
	if (t <= 12.75) return Math.round(255 - (t * 20)) + ',255,' + Math.round(255 - (t * 20));
	if (t <= 25.5) return Math.round((t - 12.75) * 20) + ',255,0';
	if (t <= 38.25) return '255,' + Math.round(255 - (t - 25.5) * 20) + ',0';
	return '255,0,0';
}

function temperatureResponse()
{
	return {
		'lastTemperature': lastTemperature,
		'html': '<!DOCTYPE html>\n\
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB" lang="en-GB">\n\
<head>\n\
<meta charset="UTF-8" />\n\
<meta http-equiv="refresh" content="300" />\n\
<title>Temperature - Arduino - Raspberry Pi</title>\n\
<meta name="keywords" content="Temperature, Arduino, Raspberry Pi" />\n\
<meta name="viewport" content="initial-scale=1.0,width=device-width" />\n\
<link rel="alternate" type="application/json" href="temperature.json"/>\n\
<meta name="robots" content="noindex" />\n\
<style type="text/css">\n\
html, body {background:black; color:white; font-family:sans-serif; text-align:center}\n\
.out {font-size:48pt}\n\
.in {font-size:36pt}\n\
.r, .sb {bottom:0; color:#AAA; position:absolute}\n\
.r {left:0.5em; margin-right:5em; text-align:left}\n\
.sb {right:0.5em}\n\
a {color:#AAA; text-decoration:none}\n\
a:hover {border-bottom:1px dashed}\n\
</style>\n\
</head>\n\
<body>\n\
<h1>Temperature</h1>\n\
<p><strong class="out" style="color:rgb(' + colourScale(lastTemperature) + ')">' + (Math.round(lastTemperature * 10) / 10.0) + '°F</strong></p>\n\
<p>' + dateLastInfo.toISOString() + '</p>\n\
<p class="r"><a href="http://alexandre.alapetite.fr/doc-alex/raspberrypi-nodejs-arduino/" title="Based on">Arduino + Raspberry Pi</a></p>\n\
</body>\n\
</html>\n\
',
	dateLastInfo: dateLastInfo
	};
}

module.exports.temperatureResponse = temperatureResponse;
