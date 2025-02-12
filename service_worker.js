const DEFAULT_INACTIVITY_TIME = 300; // in sec
let inactivityTime = DEFAULT_INACTIVITY_TIME;

// Track last active time of tabs
const tabLastActive = new Map();

// Function to suspend inactive tabs
function suspendInactiveTabs() {
  chrome.tabs.query({}, (tabs) => {
    const now = Date.now();

    tabs.forEach((tab) => {
      if (!tab.active && tab.id && tab.status === "complete") {
        const lastActive = tabLastActive.get(tab.id);

        if (!lastActive) {
          chrome.tabs.discard(tab.id);
          tabLastActive.delete(tab.id);

          return;
        }

        if (now - lastActive > inactivityTime * 1000) {
          chrome.tabs.discard(tab.id);
          tabLastActive.delete(tab.id);
        }
      }
    });
  });
}

// Immediately suspend all inactive tabs on installation or enable
chrome.runtime.onInstalled.addListener(() => {
  suspendInactiveTabs();
});

// Update activity on tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
  tabLastActive.set(tabId, Date.now());
});

// Check tabs periodically
chrome.alarms.create("checkTabs", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkTabs") {
    suspendInactiveTabs();
  }
});

// Load saved inactivity time from storage
chrome.storage.sync.get("inactivityTime", (data) => {
  if (data.inactivityTime) {
    inactivityTime = data.inactivityTime;
  }
});

// Listen for updates to inactivity time
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateInactivityTime") {
    inactivityTime = request.inactivityTime;

    chrome.storage.sync.set({ inactivityTime });
  }
});
