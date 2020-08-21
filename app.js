const {client, fs, SESSION_FILE_PATH, WEBHOOK} = require('./client.js');
const qrcode = require('qrcode-terminal');
let QR, BATTERY, PLUGGED;

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

client.on('change_battery', (batteryInfo) => {
    // Battery percentage for attached device has changed
    BATTERY = batteryInfo.battery;
	PLUGGED = batteryInfo.plugged;
    console.log(`Battery: ${BATTERY}% - Charging? ${PLUGGED}`);
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
            "hook_url": (WEBHOOK!=='' || WEBHOOK!==undefined) ? WEBHOOK : "",
            "platform": info.platform,
            "battery": BATTERY,
			"plugged": PLUGGED
		};
        res.send(log);
		console.log(log);
    }).catch(err => {
        log = {
            "success": true,
            "status":"disconnected"
        };
        res.send(log);
        console.log(err);
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