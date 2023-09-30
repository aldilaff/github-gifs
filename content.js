async function showPopup(nearElement) {
  const response = await fetch(chrome.runtime.getURL("popup.html"));
  const text = await response.text();

  const popup = document.createElement("div");
  popup.className = "gif-popup";
  popup.innerHTML = text;

  document.body.appendChild(popup);

  const outsideClickListener = function (event) {
    if (!popup.contains(event.target) && event.target !== nearElement) {
      // does not include the button itself
      popup.remove();
      document.removeEventListener("click", outsideClickListener); // Important: remove the listener to prevent multiple instances
    }
  };

  document.removeEventListener("click", outsideClickListener); // Important: remove the listener to prevent multiple instances

  // Event listener to check for clicks outside the popup
  document.addEventListener("click", outsideClickListener, true);

  // Get button and popup dimensions
  const rect = nearElement.getBoundingClientRect();

  // Calculate the popup's top and left position
  // Positioning popup below the button and centering it horizontally relative to the button
  const topPosition = rect.bottom + window.scrollY;
  const leftPosition = rect.left;

  popup.style.position = "absolute";
  popup.style.top = `${topPosition}px`;
  popup.style.left = `${leftPosition}px`;
  popup.style.zIndex = "10000"; // Ensuring popup appears above other elements

  const searchButton = popup.querySelector("#searchButton");
  const searchInput = popup.querySelector("#searchInput");
  const resultsDiv = popup.querySelector("#results");

  searchButton.addEventListener("click", async () => {
    const query = searchInput.value;

    const response = await fetch(
      `https://github-gifs.aldilaff6545.workers.dev?q=${query}`
    );

    const data = await response.json();

    resultsDiv.innerHTML = ""; // clear previous results

    data.data.forEach((gif) => {
      const img = document.createElement("img");
      img.src = gif.images.fixed_height.url;
      img.addEventListener("click", () => {
        // Copy GIF URL to clipboard, you can enhance this to directly insert into GitHub comment
        const tabContainer = nearElement.closest("tab-container");
        const commentBox = tabContainer.querySelector("textarea");
        commentBox.value += `![gif](` + gif.images.fixed_height.url + `)`;
        popup.remove();
      });
      resultsDiv.appendChild(img);
    });
  });
}

function addGifButton() {
  const commentBoxes = document.querySelectorAll("markdown-toolbar");
  const iconURL = chrome.runtime.getURL("gif-icon.png");
  commentBoxes.forEach((box) => {
    if (!box.parentElement.querySelector(".gif-button")) {
      const gifButton = document.createElement("div");
      gifButton.className = "gif-button";
      const iconImage = document.createElement("img");
      iconImage.src = iconURL;
      iconImage.className = "gif-icon";
      gifButton.appendChild(iconImage);
      gifButton.addEventListener("click", function (e) {
        e.preventDefault();
        showPopup(this); // Show popup near the clicked button
      });

      box.insertBefore(gifButton, box.firstChild);
    }
  });
}

function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
.gif-popup {
    position: absolute;
    background-color: #fff;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e4e8; 
    z-index: 10000;  
    overflow: auto;
    max-height: 400px;
    max-width: 400px; /* or whatever maximum you desire */
    min-width: 150px; /* or any suitable minimum width */
}

.gif-popup img {
    max-width: 100%;
    height: auto;
}

.gif-popup pre, .gif-popup code {
    white-space: break-spaces; /* Wraps text and prevents overflow */
    word-wrap: break-word; /* Older browsers */
}

        /* Optional: Add more specific styles, such as for buttons, images, or text within the popup */
        .gif-popup button {
            background-color: #2ea44f; /* GitHub's green color */
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }

        .gif-popup button:hover {
            background-color: #22863a; /* Darker green for hover effect */
        }
        .gif-icon{
            width: 24px;
    height: 24px;
        }
        .gif-button{
            cursor: pointer;
        }
    `;
  document.head.appendChild(style);
}

// Listen for changes in the DOM (e.g., navigating to another issue or PR)
const observer = new MutationObserver(addGifButton);
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
addGifButton();
addStyles();
