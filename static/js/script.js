// script.js
function notif(title, msg) {
    if (Notification.permission === "granted") {
        new Notification(title, {body: msg});
    }
}

window.onload = function() {
    if (Notification) Notification.requestPermission();
    notif("SPARKO-OS", "Sistem siap digunakan!");
}