const express = require('express')
const app = express();
const thread = require('child_process');
const port = process.env.PORT || 3000
//const url = 'radioedm.herokuapp.com:8554'
const url = 'localhost:8554'
const sleep = ms => new Promise(r => setTimeout(r, ms));
const http = require('http').Server(app);

app.use('/static',express.static(__dirname + "/static"))
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

app.get('/',(req,res)=>{
	res.status=200
	res.sendFile(__dirname+'/index.html')
})

http.listen(port,async ()=>{
	const rtsp =  thread.exec(`RTSP_RTSPADDRESS="${url}" ./rtsp-simple-server`)
	rtsp.stderr.on('data', (data) => {
		console.log('rtsp STDERR:', data.toString());
	});
	await sleep(5000)
	const ffmpeg = thread.exec(`ffmpeg -re -stream_loop -1 -f concat -i audio.txt -c copy -f rtsp rtsp://${url}/stream`)
	ffmpeg.stderr.on('data', (data) => {
		console.log('FFmpeg STDERR:', data.toString());
	})
	await sleep(5000)
	const m3u8 = thread.exec("ffmpeg -v info -i rtsp://localhost:8554/stream -c:v copy -c:a copy -bufsize 1835k -pix_fmt yuv420p -flags -global_header -hls_time 20 -hls_list_size 6 -hls_flags delete_segments -start_number 1 ./static/test.m3u8")
	m3u8.stderr.on('data', (data) => {
		console.log('FFmpeg STDERR:', data.toString());
	});
	console.log(`running on ${port}`)
});
