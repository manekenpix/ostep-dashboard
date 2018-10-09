import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import config from './config.json';
import axios from 'axios';
import * as fs from 'fs';

let app = express();
const data_file = './eods.json';
const eodNames = __dirname + '/sleepyRAs.txt';
let RAs = ['obelavina', 'poftadeh2', 'mmarangoni', 'naiuhz', 'lewiskim517', 'fchughtai', 'amohamed59'];

app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.urlencoded({
  extended: true
}));

/** Reached by Slack API */
app.post('/eod', (req, res) => {
    const slack_request = req.body;

	console.log(slack_request);
	const slack_response = {
		"response_type": "in_channel",
		"text": `:checkered_flag: EOD was submitted by *${slack_request.user_name}*`,
		"attachments": [
			{
				"text": `${slack_request.text}`
			}
		]
    };

	axios.post(slack_request.response_url, slack_response).then(() => {
		console.log("Sending a request to slack api")
		let report_data = JSON.parse(fs.readFileSync(data_file, 'utf8'));
		report_data[slack_request.user_name] = {
			'time': new Date(),
			'text': slack_request.text,
			'channel': slack_request.channel_name 
		};

		fs.writeFileSync(data_file, JSON.stringify(report_data), 'utf8');

    }).catch(error => {
        console.log(error);
	});
    
    // Remove RA's name from EOD reminder list
    submitEOD(slack_request.user_name);
    writeRAs();

	res.status(200).send();

});

// Update the list of RAs who haven't submit their EODs
let writeRAs = () => {
    fs.writeFile(eodNames, "");
    for (let i = 0; i < RAs.length; i++){
        fs.appendFile(eodNames, RAs[i] + "\n");
    };
};

// Remove name from EOD reminder list
let submitEOD = (RA) => {
    RAs = RAs.filter(name => name!=RA);
}

/** Get EODs */
app.get('/eod', (req, res) => {
	const report_data = JSON.parse(fs.readFileSync(data_file, 'utf8'));
	res.status(200).json(report_data);
});


app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
    writeRAs();
});

export default app;

var exec = require('child_process').exec;

exec('python src/remindEOD.py',
    (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });