/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id)
        return;
    try {
        await chrome.tabs.sendMessage(tab.id, { action: "PROCESS_LINKS" });
    }
    catch {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });
            console.log("[RealLink] Content script injected successfully");
        }
        catch (error) {
            console.error("[RealLink] Failed to inject content script:", error);
        }
    }
});
chrome.runtime.onInstalled.addListener((details) => {
    const version = chrome.runtime.getManifest().version;
    if (details.reason === "install") {
        console.log(`[RealLink] Extension installed (v${version})`);
        chrome.storage.local.set({
            totalLinksProcessed: 0,
            installDate: Date.now(),
            settings: {
                showNotifications: true,
                autoProcess: true
            }
        });
    }
    else if (details.reason === "update") {
        const previousVersion = details.previousVersion;
        console.log(`[RealLink] Updated from v${previousVersion} to v${version}`);
        if (previousVersion && previousVersion.startsWith("1.")) {
            console.log("[RealLink] Migrating from v1.x to v2.x");
        }
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if ("type" in message && message.type === "LINK_STATS_UPDATE") {
        const statsMessage = message;
        chrome.storage.local.get("totalLinksProcessed", (data) => {
            const total = (data.totalLinksProcessed || 0) + statsMessage.count;
            chrome.storage.local.set({ totalLinksProcessed: total });
        });
        if (sender.tab?.id) {
            updateBadge(statsMessage.count, sender.tab.id);
        }
        return false;
    }
    return true;
});
function updateBadge(count, tabId) {
    let badgeText;
    if (count <= 0) {
        badgeText = "";
    }
    else if (count > 999) {
        badgeText = "999+";
    }
    else {
        badgeText = count.toString();
    }
    chrome.action.setBadgeText({
        text: badgeText,
        tabId: tabId
    });
    chrome.action.setBadgeBackgroundColor({
        color: "#667eea"
    });
}
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const response = await chrome.tabs.sendMessage(activeInfo.tabId, {
            type: "GET_STATS"
        }).catch(() => null);
        if (response && typeof response === "object" && "count" in response) {
            updateBadge(response.count, activeInfo.tabId);
        }
        else {
            updateBadge(0, activeInfo.tabId);
        }
    }
    catch {
        updateBadge(0, activeInfo.tabId);
    }
});
async function getExtensionStats() {
    const data = await chrome.storage.local.get(["totalLinksProcessed", "installDate"]);
    const manifest = chrome.runtime.getManifest();
    return {
        totalLinks: data.totalLinksProcessed || 0,
        installDate: data.installDate || Date.now(),
        version: manifest.version
    };
}

/******/ })()
;