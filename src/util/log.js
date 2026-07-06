function log(...args) {
    console.log(...args);

    fetch("/log", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(args)
    }).catch(() => { });
}

window.addEventListener("error", event => {
    log("Uncaught Error", {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
    });
});

window.addEventListener("unhandledrejection", event => {
    log("Unhandled Promise Rejection", {
        reason: event.reason?.stack || event.reason
    });
});
