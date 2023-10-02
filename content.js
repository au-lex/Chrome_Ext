console.log("Extension initialized");

let mediaRecorder = null;

function stopRecording(stream) {
    stream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
            track.stop();
        }
    });
}

function createTimeElement() {
    let timeContainer = document.createElement("div");
    let timeText = document.createElement("p");
    let timeIndicator = document.createElement("span");

    // Applying styles directly
    Object.assign(timeContainer.style, {
        display: "flex",
        alignItems: "center",
        gap: "1rem"
    });

    Object.assign(timeText.style, {
        fontWeight: "500",
        fontSize: "1.25rem",
        fontFamily: "Inter",
        color: "#fff"
    });

    Object.assign(timeIndicator.style, {
        height: "8px",
        width: "8px",
        backgroundColor: "red",
        borderRadius: "50%"
    });

    timeText.textContent = "00:03:35";

    timeContainer.appendChild(timeText);
    timeContainer.appendChild(timeIndicator);

    return timeContainer;
}

function createControlElement(iconURL, label) {
    let controlItem = document.createElement("div");
    let button = document.createElement("button");
    let icon = document.createElement("img");
    let textLabel = document.createElement("small");

    // Applying styles directly
    Object.assign(controlItem.style, {
        display: "flex",
        alignItems: "center",
        gap: ".3rem",
        flexDirection: "column"
    });

    Object.assign(button.style, {
        borderRadius: "50%",
        display: "grid",
        placeContent: "center",
        backgroundColor: "#fff",
        border: "none",
        height: "30px",
        width: "30px"
    });

    Object.assign(icon.style, {
        height: "15px",
        objectFit: "contain"
    });

    Object.assign(textLabel.style, {
        fontFamily: "Work Sans",
        fontWeight: "500",
        fontSize: "0.75rem",
        color: "#fff"
    });

    icon.src = iconURL;
    textLabel.textContent = label;

    button.appendChild(icon);
    controlItem.appendChild(button);
    controlItem.appendChild(textLabel);

    return controlItem;
}

function handleStopClick() {
    if (!mediaRecorder) {
        console.log("No recorder instance");
        return;
    }
    mediaRecorder.stop();
}

function handleDataAvailable(event) {
    const recordedBlob = event.data;
    let blobURL = URL.createObjectURL(recordedBlob);
    console.log("Blob URL:", blobURL);

    let videoElement = document.createElement("video");
    videoElement.src = blobURL;
    videoElement.controls = true;

    let downloadLink = document.createElement("a");
    downloadLink.href = blobURL;
    downloadLink.download = "recorded_video.webm";
    downloadLink.textContent = "Download Video";

    document.body.appendChild(videoElement);
    document.body.appendChild(downloadLink);
}

function onScreenAccessGranted(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.onstop = () => stopRecording(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;

    let controlsContainer = document.createElement("div");
    
    // Applying styles directly
    Object.assign(controlsContainer.style, {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        minWidth: "400px",
        backgroundColor: "#141414",
        borderRadius: "100vh",
        padding: "0.5rem",
        justifyContent: "space-evenly",
        position: "fixed",
        bottom: "5%",
        left: "5%"
    });

    controlsContainer.appendChild(createTimeElement());
    controlsContainer.appendChild(createControlElement("https://res.cloudinary.com/dzsomaq4z/image/upload/v1696166602/Icons/ae3ufl4s59dy7tvh0tsb.png", "Pause"));
    controlsContainer.appendChild(createControlElement("https://res.cloudinary.com/dzsomaq4z/image/upload/v1696166664/Icons/gj2gn1upqjimsgv2j8cz.png", "Stop"));
    controlsContainer.appendChild(createControlElement("https://res.cloudinary.com/dzsomaq4z/image/upload/v1696166781/Icons/cawunk9gdd9yfnnvlnei.png", "Camera"));

    let stopButton = controlsContainer.querySelector('button[aria-label="Stop"]');
    stopButton.addEventListener("click", handleStopClick);

    document.body.appendChild(controlsContainer);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "request_recording") {
        console.log("Starting screen recording");

        try {
            let captureStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
            onScreenAccessGranted(captureStream);
        } catch (error) {
            console.error("Error capturing screen:", error);
        }
    }
});
