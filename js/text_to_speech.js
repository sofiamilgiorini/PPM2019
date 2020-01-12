var synth = window.speechSynthesis;
var utter = new SpeechSynthesisUtterance();

function speak(text) {
	utter.text = text;

	//aspetta se non ha caricato la voce
	if (synth.getVoices().length === 0) {
		synth.addEventListener('voiceschanged', function () {
			synth.speak(utter);
		});
	} else {
		synth.speak(utter);
	}
}

(function textToSpeech() {
var voices = synth.getVoices();

var defaultVoice = '';

// fissa lingua italiana o la prima voce disponibile
for(var i=0; i<voices.length; i++) {
	if(voices[i].lang === 'it-IT') {
		defaultVoice = voices[i];
		break;
	}
}
if(defaultVoice === '')
	defaultVoice = voices[0];

utter.rate = 1;
utter.pitch = 1;
utter.voice = defaultVoice;
})();