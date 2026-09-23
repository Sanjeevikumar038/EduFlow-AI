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
                let interimTranscript = '';
                let finalTranscriptChunk = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscriptChunk += event.results[i][0].transcript + ' ';
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                this.transcript += finalTranscriptChunk;
                
                if (this.onResultCallback) {
                    this.onResultCallback(this.transcript + interimTranscript, event.results[event.results.length - 1].isFinal);
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
                if (this.shouldRecord) {
                    try {
                        this.recognition.start();
                        this.isRecording = true;
                    } catch (e) {
                        console.error("Could not restart recording", e);
                    }
                }
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

        if (this.shouldRecord) return;
        
        this.shouldRecord = true;
        this.transcript = '';
        try {
            this.recognition.start();
            this.isRecording = true;
        } catch (e) {
            console.error("Could not start recording", e);
        }
    }

    stopRecording() {
        this.shouldRecord = false;
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
