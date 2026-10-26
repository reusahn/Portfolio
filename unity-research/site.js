"use strict";
document.querySelectorAll("[data-video]").forEach(function (button) {
  button.addEventListener("click", function () {
    var source = button.getAttribute("data-video");
    var url = new URL(source);
    if (url.origin !== "https://player.vimeo.com") return;
    url.searchParams.set("autoplay", "1");
    var frame = document.createElement("iframe");
    frame.src = url.toString();
    frame.title = button.getAttribute("data-title") || "Existing project footage";
    frame.allow = "autoplay; fullscreen; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    button.replaceWith(frame);
    frame.focus();
  });
});
