let totalWalkedMeters = 0;
let walkedMeters = -Number.MAX_SAFE_INTEGER;
let walkGoal = Number.MAX_SAFE_INTEGER;
let lastPos = null;
let onChangeWalk = null;
let onFinishedWalk = null;

const trackingOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
}

const MAX_ACCURACY_METERS = 7;

function trackPosition(position) {
    if (position.coords.accuracy > MAX_ACCURACY_METERS) return;
    if (lastPos === null) {
        lastPos = { lat: position.coords.latitude, lon: position.coords.longitude };
        return;
    }

    const distance = getDistanceInMeters(lastPos.lat, lastPos.lon, position.coords.latitude, position.coords.longitude);

    if (distance >= 1) {
        lastPos = { lat: position.coords.latitude, lon: position.coords.longitude };

        totalWalkedMeters += distance;
        walkedMeters += distance;

        if (onChangeWalk !== null)
            onChangeWalk(walkedMeters, walkGoal - Math.round(walkedMeters))

        if (walkedMeters >= walkGoal) {
            stopWalk();
            if (onFinishedWalk !== null)
                onFinishedWalk();
        }
    }
}

function startWalk(goal, callback1, callback2) {
    callback1(0, goal);
    if (goal == 0) {
        callback2();
        return;
    }
    walkGoal = goal;
    walkedMeters = 0;
    onChangeWalk = callback1;
    onFinishedWalk = callback2;
}

function stopWalk() {
    walkGoal = Number.MAX_SAFE_INTEGER;
    walkedMeters = -Number.MAX_SAFE_INTEGER;
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (value) => value * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

document.addEventListener("permissionsGranted", () => {
    const watchId = navigator.geolocation.watchPosition(trackPosition, () => { log("Fehler 1"); }, trackingOptions);
});
