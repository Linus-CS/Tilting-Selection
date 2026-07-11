document.body.insertAdjacentHTML("afterbegin", `
<div id="permissionOverlay" class="overlay is-visible">
    <div class="overlay-card">
        <p>
            Welcome to Footnotes!
        </p>
        <p class="">
            Please allow access to your location, orientation and motion sensors to use this website
        </p>
        <button id="permissionButton">Allow Access</button>
        <p id="permissionStatus" class="status-text"></p>
    </div>
</div>
`);

const permissionOverlay = document.querySelector("#permissionOverlay");
const permissionStatus = document.querySelector("#permissionStatus");
const permissionButton = document.querySelector("#permissionButton");

const locationOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20000
}

function onSuccess(position) {
    localStorage.setItem("motionAccess", "granted");
    localStorage.setItem("locationAccess", "granted");
    permissionOverlay.classList.remove("is-visible");

    document.dispatchEvent(new CustomEvent("permissionsGranted"));
}

function onError() {
    permissionStatus.textContent = "Standort konnte nicht gelesen werden. Bitte erlaube den Standortzugriff auf der Startseite.";
    localStorage.removeItem("locationAccess");
}

const FAIL_REQUEST_PERMISSION = "Berechtigungen konnten nicht vollständig angefragt werden. Bitte gehe zurück zur Startseite und erlaube den Zugriff dort.";

async function requestPermission() {
    try {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        if (motionPermission !== "granted" || orientationPermission !== "granted" || !("geolocation" in navigator)) {
            throw new Error("Eines der Berechtigungen wurde nicht aktzeptiert!");
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError, locationOptions);
    } catch (error) {
        log(error);
        permissionStatus.textContent = FAIL_REQUEST_PERMISSION;
    }
}

permissionButton.addEventListener("click", requestPermission);