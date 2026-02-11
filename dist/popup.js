/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

function getPopupElements() {
    return {
        domainLabel: document.getElementById("domainLabel"),
        statsCount: document.getElementById("statsCount"),
        statusBadge: document.getElementById("statusBadge"),
        statusText: document.getElementById("statusText"),
        refreshBtn: document.getElementById("refreshBtn"),
        resetBtn: document.getElementById("resetBtn"),
        statusCard: document.getElementById("statusCard"),
        unsupportedMsg: document.getElementById("unsupportedMsg"),
        unsupportedDomain: document.getElementById("unsupportedDomain"),
        actions: document.getElementById("actions"),
        sitesSection: document.getElementById("sitesSection"),
        toast: document.getElementById("toast")
    };
}
const SUPPORTED_DOMAINS = [
    "zhihu.com",
    "juejin.cn",
    "jianshu.com",
    "csdn.net",
    "cnblogs.com",
    "weibo.com",
    "weibo.cn",
    "weixin.qq.com",
    "bilibili.com",
    "tieba.baidu.com",
    "51cto.com",
    "infoq.cn",
    "oschina.net"
];
function isSupportedDomain(hostname) {
    const lowerHostname = hostname.toLowerCase();
    return SUPPORTED_DOMAINS.some(domain => lowerHostname.includes(domain));
}
function showPopupToast(message, duration = 2000) {
    const { toast } = getPopupElements();
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}
function updateStatusCard(hostname, count, supported) {
    const { domainLabel, statsCount, statusBadge, statusText, statusCard, unsupportedMsg, unsupportedDomain, actions, sitesSection } = getPopupElements();
    domainLabel.textContent = hostname || "未知域名";
    statsCount.textContent = count.toString();
    if (supported) {
        statusBadge.className = "status-badge supported";
        statusText.textContent = "支持";
        statusCard.style.display = "block";
        actions.style.display = "flex";
        sitesSection.style.display = "block";
        unsupportedMsg.classList.add("hidden");
    }
    else {
        statusCard.style.display = "none";
        actions.style.display = "none";
        unsupportedMsg.classList.remove("hidden");
        unsupportedDomain.textContent = hostname || "未知域名";
        sitesSection.style.display = "block";
    }
}
function setPopupButtonLoading(btn, loading) {
    btn.disabled = loading;
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = "<span>⏳</span> 处理中...";
    }
    else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    }
}
async function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0] || null);
        });
    });
}
async function sendMessageToContent(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                console.log("[RealLink] Message error:", chrome.runtime.lastError);
                resolve(null);
            }
            else {
                resolve(response);
            }
        });
    });
}
async function fetchStats(tabId) {
    return sendMessageToContent(tabId, { type: "GET_STATS" });
}
async function resetStats(tabId) {
    const response = await sendMessageToContent(tabId, { type: "RESET_STATS" });
    return response?.success || false;
}
async function manualProcess(tabId) {
    return sendMessageToContent(tabId, { type: "MANUAL_PROCESS" });
}
async function initPopup() {
    const { refreshBtn, resetBtn } = getPopupElements();
    const tab = await getCurrentTab();
    if (!tab?.id) {
        updateStatusCard("无法获取当前页面", 0, false);
        return;
    }
    let hostname = "未知域名";
    try {
        if (tab.url) {
            hostname = new URL(tab.url).hostname;
        }
    }
    catch {
    }
    const supported = isSupportedDomain(hostname);
    if (supported) {
        const stats = await fetchStats(tab.id);
        if (stats) {
            updateStatusCard(stats.hostname || hostname, stats.count, stats.supported);
        }
        else {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content.js"]
                });
                const newStats = await fetchStats(tab.id);
                updateStatusCard(newStats?.hostname || hostname, newStats?.count || 0, newStats?.supported ?? supported);
            }
            catch (error) {
                console.log("[RealLink] Script injection failed:", error);
                updateStatusCard(hostname, 0, supported);
            }
        }
    }
    else {
        updateStatusCard(hostname, 0, false);
    }
    refreshBtn.addEventListener("click", async () => {
        if (!tab.id)
            return;
        setPopupButtonLoading(refreshBtn, true);
        try {
            const result = await manualProcess(tab.id);
            if (result) {
                updateStatusCard(hostname, result.count, supported);
                showPopupToast(`已刷新，共处理 ${result.count} 个链接`);
            }
            else {
                const stats = await fetchStats(tab.id);
                if (stats) {
                    updateStatusCard(stats.hostname || hostname, stats.count, stats.supported);
                    showPopupToast(`当前已处理 ${stats.count} 个链接`);
                }
                else {
                    showPopupToast("无法获取统计信息");
                }
            }
        }
        catch (error) {
            console.error("[RealLink] Refresh error:", error);
            showPopupToast("刷新失败，请重试");
        }
        finally {
            setPopupButtonLoading(refreshBtn, false);
        }
    });
    resetBtn.addEventListener("click", async () => {
        if (!tab.id)
            return;
        const confirmed = confirm("确定要重置统计计数吗？");
        if (!confirmed)
            return;
        setPopupButtonLoading(resetBtn, true);
        try {
            const success = await resetStats(tab.id);
            if (success) {
                updateStatusCard(hostname, 0, supported);
                showPopupToast("统计已重置");
            }
            else {
                showPopupToast("重置失败");
            }
        }
        catch (error) {
            console.error("[RealLink] Reset error:", error);
            showPopupToast("重置失败");
        }
        finally {
            setPopupButtonLoading(resetBtn, false);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    initPopup().catch(console.error);
});

/******/ })()
;