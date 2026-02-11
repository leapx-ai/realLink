/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

function getOptionsElements() {
    return {
        totalLinks: document.getElementById("totalLinks"),
        installDays: document.getElementById("installDays"),
        autoProcess: document.getElementById("autoProcess"),
        showNotifications: document.getElementById("showNotifications"),
        showBadge: document.getElementById("showBadge"),
        resetDataBtn: document.getElementById("resetData"),
        toast: document.getElementById("toast")
    };
}
function showOptionsToast(message, duration = 3000) {
    const { toast } = getOptionsElements();
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
}
function calculateDays(startDate) {
    const diff = Date.now() - startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
async function getStorageData() {
    const data = await chrome.storage.local.get([
        "totalLinksProcessed",
        "installDate",
        "settings"
    ]);
    return {
        totalLinksProcessed: data.totalLinksProcessed || 0,
        installDate: data.installDate || Date.now(),
        settings: {
            autoProcess: true,
            showNotifications: true,
            showBadge: true,
            ...data.settings
        }
    };
}
async function saveSettings(settings) {
    await chrome.storage.local.set({ settings });
}
async function resetStatistics() {
    await chrome.storage.local.set({
        totalLinksProcessed: 0,
        installDate: Date.now()
    });
}
async function updateStatsDisplay() {
    const { totalLinks, installDays } = getOptionsElements();
    const data = await getStorageData();
    totalLinks.textContent = formatNumber(data.totalLinksProcessed);
    installDays.textContent = calculateDays(data.installDate).toString();
}
async function updateSettingsDisplay() {
    const { autoProcess, showNotifications, showBadge } = getOptionsElements();
    const data = await getStorageData();
    autoProcess.checked = data.settings.autoProcess;
    showNotifications.checked = data.settings.showNotifications;
    showBadge.checked = data.settings.showBadge;
}
async function initOptionsPage() {
    const { autoProcess, showNotifications, showBadge, resetDataBtn } = getOptionsElements();
    await updateStatsDisplay();
    await updateSettingsDisplay();
    autoProcess.addEventListener("change", async () => {
        const data = await getStorageData();
        data.settings.autoProcess = autoProcess.checked;
        await saveSettings(data.settings);
        showOptionsToast("设置已保存");
    });
    showNotifications.addEventListener("change", async () => {
        const data = await getStorageData();
        data.settings.showNotifications = showNotifications.checked;
        await saveSettings(data.settings);
        showOptionsToast("设置已保存");
    });
    showBadge.addEventListener("change", async () => {
        const data = await getStorageData();
        data.settings.showBadge = showBadge.checked;
        await saveSettings(data.settings);
        showOptionsToast("设置已保存");
        if (!showBadge.checked) {
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                if (tab.id) {
                    chrome.action.setBadgeText({ text: "", tabId: tab.id });
                }
            }
        }
    });
    resetDataBtn.addEventListener("click", async () => {
        const confirmed = confirm("确定要重置所有统计数据吗？\n此操作不可恢复。");
        if (confirmed) {
            await resetStatistics();
            await updateStatsDisplay();
            showOptionsToast("统计数据已重置");
        }
    });
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.totalLinksProcessed) {
            updateStatsDisplay();
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    initOptionsPage().catch(console.error);
});

/******/ })()
;