const fs = require('fs');
const {Client} = require('whatsapp-web.js');
const axios = require('axios');
const SESSION_FILE_PATH = './session.json';
const WEBHOOK =  process.env.WEBHOOK;

let sessionCfg, QR;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
    puppeteer: {
        headless: false,
         args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],   
    },
    restartOnAuthFail:true,
    session: sessionCfg,
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
		if (WEBHOOK!=='' || WEBHOOK!==undefined || WEBHOOK.length>10){
			console.log("Webhook",WEBHOOK);
			axios.post(WEBHOOK, msg)
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

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
	deleteSession();
});

function deleteSession(){
	if (fs.existsSync(SESSION_FILE_PATH)) {
		fs.unlink(SESSION_FILE_PATH, function(err){
			if (!err) {
				console.log('Session deleted!');
				client.initialize();	
			}
		});
	}		
}

module.exports = {client,fs,SESSION_FILE_PATH,WEBHOOK}; 