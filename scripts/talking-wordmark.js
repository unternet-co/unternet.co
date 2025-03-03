document.addEventListener('DOMContentLoaded', () => {
    // Initialize voices outside the click handler
    let allVoices = [];
    let voicesLoaded = false;
    
    // Function to load voices
    const loadVoices = () => {
      allVoices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
    };
    
    // Load voices when available
    if (window.speechSynthesis) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    
    // Speech synthesis functionality for the wordmark
    const wordmark = document.querySelector('.wordmark');
    if (wordmark) {
      wordmark.style.cursor = 'pointer';
      wordmark.addEventListener('click', () => {
        // Check if speech synthesis is supported
        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          // Define the three parts of the word
          const parts = ['un', 'ter', 'net'];
          
          // Define pitch values for a 3-part melody
          // Using a simple ascending melody (low, medium, high)
          const melodyPitches = [0.3, 0.9, 1.6];
          
          // Select a random voice for this click (used for all utterances)
          let selectedVoice = null;
          if (allVoices.length > 0) {
            const randomIndex = Math.floor(Math.random() * allVoices.length);
            selectedVoice = allVoices[randomIndex];
          }
          
          // Function to speak a part and highlight the corresponding SVG element
          const speakPart = (index) => {
            if (index >= parts.length) return; // End recursion
            
            const part = parts[index];
            
            // Create utterance for this part
            const utterance = new SpeechSynthesisUtterance(part);
            
            // Use the selected voice for all utterances
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
            
            // Set melody pitch for this part
            utterance.pitch = melodyPitches[index];
            utterance.rate = 1.0;
            utterance.volume = 1.0;
            
            // Get the SVG document
            const svgDoc = wordmark.querySelector('svg');
            
            if (svgDoc) {
              // Find the background element for this part
              const syllableElement = svgDoc.querySelector(`.unternet-wordmark-svg-syllable.syllable-${part}`);
              
              if (syllableElement) {
                // Apply the hover effect
                syllableElement.classList.add('speaking');
                
                // Remove the hover effect after the utterance is done
                utterance.onend = () => {
                  syllableElement.classList.remove('speaking');
                  
                  // Speak the next part after a small delay
                  setTimeout(() => speakPart(index + 1), 100);
                };
              } else {
                console.log(`SVG element for '${part}' not found`);
                utterance.onend = () => {
                  setTimeout(() => speakPart(index + 1), 100);
                };
              }
            } else {
              console.log('SVG document not found');
              utterance.onend = () => {
                setTimeout(() => speakPart(index + 1), 100);
              };
            }
            
            // Speak the text
            window.speechSynthesis.speak(utterance);
          };
          
          // Start speaking
          speakPart(0);
        } else {
          console.log('Speech synthesis not supported in this browser');
        }
      });
    }
  });