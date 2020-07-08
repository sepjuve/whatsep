const fs = require('fs');
const {Client, ClientInfo} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const SESSION_FILE_PATH = './session.json';
const webhook =  process.env.WEBHOOK;

let sessionCfg, QR;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
    puppeteer: {
        headless: true,
         args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],   
    },
    session: sessionCfg,
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
	QR = qr;
    qrcode.generate(qr,{small:true}, function (qrcode) {
        console.log(qrcode);
    });
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
	QR = 'AUTHENTICATED'; 
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

info = "";
client.on('ready', () => {
    console.log('Client is ready!');
    
});

client.on('message', msg => {
    console.log('MESSAGE RECEIVED', msg);
	if(msg.type=='chat'){
		if (msg.body == '!ping') {
			msg.reply('pong');
		}
		if (webhook!=='' || webhook!==undefined || webhook.length>10){
			console.log("Webhook",webhook);
			axios.post(webhook, msg)
			.then((res) => {
			  console.log(`statusCode: ${res.statusCode}`);
			  console.log(res.data);
			})
			.catch((error) => {
			  console.error(error);
			})
		}  
	}
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
        console.log('MESSAGE READ', msg);
    }
});

client.on('change_state', (reason) => { 
    console.log(reason);
});

var battery, plugged;
client.on('change_battery', (batteryInfo) => {
    // Battery percentage for attached device has changed
    battery = batteryInfo.battery;
	plugged = batteryInfo.plugged;
    console.log(`Battery: ${battery}% - Charging? ${plugged}`);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

client.initialize();


// API
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));

app.post('/send', (req, res) => {
    var number = req.body.number;
    var msg = req.body.msg;

    console.log(req.body);
    if ((number!=='' || number!==undefined) && (msg!=='' || msg!==undefined)){
        client.sendMessage(number + '@c.us', msg).then(function (result) {
            console.log(result);
            log = {"success": true, result};
            res.send(log);
            
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        log = {"success": false, "err": "number or msg cannot empty"}
        res.send(log);
    } 

});

app.get('/info', (req, res) => {
    client.getState().then(function(result){
		let info = client.info;
        log = {
            "success": true,
            "status": result,
			"alias": info.pushname,
            "mynumber": info.me.user,
            "hook_url": (webhook!=='' || webhook!==undefined) ? webhook : "",
            "platform": info.platform,
            "battery": battery,
			"plugged": plugged
		};
        res.send(log);
		console.log(log);
    }).catch(err => {
        log = {
            "success": true,
            "status":"disconnected"
        };
        res.send(log);
        console.log(log);
    });
});

app.get('/qr', (req, res) => {
	res.sendFile( __dirname + '/views/qr.html');
	
});

app.get('/qrplain', (req, res) => {
	if (QR!='AUTHENTICATED'){
		res.send(QR);
	} else {
		res.send('AUTHENTICATED');
	}
});

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));
