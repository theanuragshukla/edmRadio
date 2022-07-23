const express = require('express')
const app = express();
const thread = require('child_process');
const port = process.env.PORT || 3000
const tcpPort = 8554
//const url = `radioedm.herokuapp.com:${tcpPort}`
const url = `localhost:${tcpPort}`
const http = require('http').Server(app);
const cors = require('cors')
var rtsp,ffmpegStream,m3u8
/* Middlewares  */

app.use('/static',express.static(__dirname + "/static"))
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

/* CORS */

app.use(cors())
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/* Request Handling */

app.get('/',(req,res)=>{
	res.status=200
	res.header("Access-Control-Allow-Origin", "*");  
	res.sendFile(__dirname+'/index.html')
})

/* Methods */

const sleep = ms => new Promise(r => setTimeout(r, ms));

const startStream=async ()=>{
	rtsp =  thread.exec(`RTSP_RTSPADDRESS="${url}" ./rtsp-simple-server`)
	rtsp.stderr.on('data', (data) => {
		console.log('rtsp STDERR:', data.toString());
	});
	await sleep(5000)
	await doStream()
	await sleep(5000)
	await streamM3u8()
	rtsp.on("close", () => {
		console.log("child gone");
		setTimeout(() => {
			ffmpegStream.kill()
			m3u8.kill()
			startStream()
		}, 25)
	});

}

const doStream = async () => {
	ffmpegStream = thread.exec(`ffmpeg -re -stream_loop -1 -f concat -i audio.txt -c copy -f rtsp rtsp://${url}/stream`)
	ffmpegStream.stderr.on('data', (data) => {
		console.log('FFmpegStream STDERR:', data.toString());
	})
	ffmpegStream.on("close", () => {
		console.log("child gone");
		setTimeout(() => {
			doStream()
		}, 25)
	});

}

const streamM3u8 =async () => {
	m3u8 = thread.exec(`ffmpeg -v info -i rtsp://${url}/stream -c:v copy -c:a copy -bufsize 1835k -pix_fmt yuv420p -flags -global_header -hls_time 10 -hls_list_size 3 -hls_flags delete_segments -start_number 1 ./static/test.m3u8`)
	m3u8.stderr.on('data', (data) => {
		console.log('m3u8 STDERR:', data.toString());
	});
	m3u8.on("close", () => {
		console.log("child gone");
		setTimeout(() => {
			streamM3u8()
		}, 25)
	});

}


http.listen(port,async ()=>{
	console.log(`running on ${port}`)
	startStream()
});
