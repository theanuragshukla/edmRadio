const video = document.getElementById("player");
const url = "/static/test.m3u8";
function joinParty(e){
	e.setAttribute('onclick',"leaveParty(this)")
	e.classList.add('pulse-button')
	e.blur()
	e.innerHTML="Leave Party"
	if(Hls.isSupported())
	{
		var hls = new Hls();
		hls.loadSource(url);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED,function()
			{
				video.play();
				video.currentTime = video.duration - 1
			});
	}
	else if (video.canPlayType('application/vnd.apple.mpegurl'))
	{
		video.src =url;
		video.addEventListener('canplay',function()
			{
				video.play();
				video.currentTime = video.duration - 1
			});
	}

}
function leaveParty(e){
	video.pause()
	e.classList.remove('pulse-button')
	e.blur()
	e.innerHTML="Join Party"
	e.setAttribute('onclick',"joinParty(this)")
}
