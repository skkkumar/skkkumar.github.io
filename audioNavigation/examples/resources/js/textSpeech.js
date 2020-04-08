function speakText(message, callbackFunc){
	
	var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[1];
      msg.rate = 1;
      msg.pitch = 1;
      msg.text = message;

      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
		callbackFunc();
      };

      speechSynthesis.speak(msg);
}



function speakText2(message){
	
	var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[1];
      msg.rate = 1;
      msg.pitch = 1;
      msg.text = message;
	  console.log(message);

      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
      };

      speechSynthesis.speak(msg);
}