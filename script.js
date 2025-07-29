const themetoggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const generatetBtn = document.querySelector(".generate-btn");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");


const API_VALUE = "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";

const examplePrompts = [
  "A cozy little cabin surrounded by snow-covered pine trees during twilight with warm lights glowing from the windows",
  "A futuristic cityscape at night with flying cars, neon lights, and tall glass skyscrapers",
  "A cute cat wearing a wizard hat, casting glowing spells in a magical forest",
  "A scenic beach at sunset with palm trees, gentle waves, and a hammock between two trees",
  "A vintage steam train moving through a mountain valley with clouds of smoke and autumn trees around",
  "A colorful hot air balloon floating above green hills with a blue sky full of fluffy clouds",
  "A small astronaut floating in space while holding a balloon shaped like Earth",
  "A cyberpunk street filled with neon signs, rainy sidewalks, and people in futuristic outfits",
  "A mystical dragon curled up on top of a castle tower under a full moon",
  "A peaceful village surrounded by lavender fields and butterflies flying in the air",
];

(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme:dark)"
  ).matches;
  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themetoggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();
// Switch B/W Light and Dark Theme
const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themetoggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};
// Calculate Width/Height based on choosen ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width,height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width*height);

    let calculateWidth = Math.round(width * scaleFactor);
    let calculateHeight = Math.round(height * scaleFactor);
    // Ensure dimensions are multipple of 16 (AI models requirements)
    calculateWidth = Math.floor(calculateWidth / 16) * 16;
    calculateHeight = Math.floor(calculateHeight / 16) * 16;
    return {width:calculateWidth,height:calculateHeight};
};
// Replace loading spinner with the actul image
const updateImageCard = (imgIndex,imgURL) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;
    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img
                src="${imgURL}"
                class="result-img"
              />
              <div class="img-overlay">
                <a href="${imgURL}" class="img-download-btn" download="${Date.now()}.png">
                  <i class="fa-solid fa-download"></i>
                </a>
              </div>`;
};

// Send request to hugging face API to Create images
const generateImages = async (selectedModel,imageCount,aspectRatio,promptText) => {
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    const {width,height} = getImageDimensions(aspectRatio);
    generatetBtn.setAttribute("disabled","true");
    // Create an arry of Image genration promises
const imagePromises = Array.from({length:imageCount}, async(_, i) =>{
    // Send request to theAI Model API
    try {
     const response = await fetch(MODEL_URL, {
         headers: {
                //  Authorization: `Bearer ${({}).API_VALUE}`,
                 // Authorization: `Bearer ${({}).HF_TOKEN}`,
                 Authorization: `Bearer ${API_VALUE}`,
                 "Content-Type": "application/json",
                 "x-use-cache": "false",
             },
             method: "POST",
             body: JSON.stringify({
                 inputs: promptText,
                 parameters: {width, height},
             }),
     });
     if(!response.ok) throw new Error((await response.json())?.error);
    //  Covert response to an img URL and update to image card
     const result = await response.blob();
    //  console.log(result);
    updateImageCard(i,URL.createObjectURL(result));
    } catch (error) {
     console.log(error);
    const imgCard = document.getElementById(`img-card-${i}`);
    imgCard.classList.replace("loading","error");
    imgCard.querySelector(".status-text").textContent = "Generation failed! Check console for more details. ";
    }
});
await Promise.allSettled(imagePromises);
    generatetBtn.removeAttribute("disabled");
};


// Create placeholder Cards with loading spinnners
const createImageCards = (selectedModel,imageCount,aspectRatio,promptText) => {
gridGallery.innerHTML ="";

    for(let i=0;i < imageCount; i++){
        gridGallery.innerHTML += `       <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p class="status-text">Generating....</p>
                </div>
             
            </div>`;
    }
    generateImages(selectedModel,imageCount,aspectRatio,promptText);
}

const handleFormSubmit = (e) => {
e.preventDefault();
const selectedModel = modelSelect.value;
const imageCount = parseInt(countSelect.value) || 1;
const aspectRatio = ratioSelect.value || "1/1";
const promptText = promptInput.value.trim();

// console.log(selectedModel);
// console.log(imageCount);
// console.log(aspectRatio);
// console.log(promptText);
createImageCards(selectedModel,imageCount,aspectRatio,promptText);

}

// Fill Prompts with random value
promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);



themetoggle.addEventListener("click", toggleTheme);
