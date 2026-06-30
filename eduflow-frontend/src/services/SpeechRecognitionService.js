class SpeechRecognitionService {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcript = '';
        this.onResultCallback = null;
        this.onErrorCallback = null;

        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true; // Set to true to get live updates
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                
                if (this.onResultCallback) {
                    this.onResultCallback(currentTranscript, event.results[event.results.length - 1].isFinal);
                }
            };

            this.recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (this.onErrorCallback) {
                    this.onErrorCallback(event.error);
                }
            };

            this.recognition.onend = () => {
                this.isRecording = false;
            };
        } else {
            console.error("Speech Recognition API is not supported in this browser.");
        }
    }

    setCallbacks(onResult, onError) {
        this.onResultCallback = onResult;
        this.onErrorCallback = onError;
    }

    startRecording() {
        if (!this.recognition) {
            if (this.onErrorCallback) this.onErrorCallback("not_supported");
            return;
        }

        if (this.isRecording) return;
        
        this.transcript = '';
        try {
            this.recognition.start();
            this.isRecording = true;
        } catch (e) {
            console.error("Could not start recording", e);
        }
    }

    stopRecording() {
        if (!this.recognition || !this.isRecording) return;
        
        this.recognition.stop();
        this.isRecording = false;
    }

    getTranscript() {
        return this.transcript;
    }
}

const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;
