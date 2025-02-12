document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    const originalUrl = window.location.href;

    // Save the original URL in localStorage for restoration
    localStorage.setItem("originalTabUrl", originalUrl);

    // Redirect using chrome.tabs.update
    chrome.runtime.sendMessage({ action: "getTabId" });
  }
});
