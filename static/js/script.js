const video = document.getElementById("player");
const url = "http://localhost:3000/static/test.m3u8";
function joinParty(e){
	e.style.display="none"
	if(Hls.isSupported())
	{
		var hls = new Hls();
		hls.loadSource(url);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED,function()
			{
				video.play();
			});
	}
	else if (video.canPlayType('application/vnd.apple.mpegurl'))
	{
		video.src =url;
		video.addEventListener('canplay',function()
			{
				video.play();
			});
	}

}
