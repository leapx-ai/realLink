/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/* unused harmony exports LinkStats, getStrategy */
function extractTargetParam(url) {
    try {
        const match = url.match(/https?:\/\/link\.[^\/]+\/\?target=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        console.error("[RealLink] Error parsing URL:", e);
        return { matched: false };
    }
}
function extractWeixinUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*weixin[^\/]*\/.*?[?&]url=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractBilibiliUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*bilibili[^\/]*\/.*?[?&]url=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractWeiboUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*weibo[^\/]*\/sinaurl\?(?:toasturl|u)=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractTiebaUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*tieba[^\/]*\/.*?[?&]url=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extract51CTOUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*51cto[^\/]*\/transfer\?.*?target=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractInfoQUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*infoq[^\/]*\/.*?(?:[?&]url=|redirect=)([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractOSChinaUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*oschina[^\/]*\/.*?[?&]url=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractCNBlogsUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*cnblogs[^\/]*\/.*?[?&](?:url|target|u)=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
function extractJianshuUrl(url) {
    try {
        const match = url.match(/https?:\/\/[^\/]*jianshu[^\/]*\/go-wild\?.*?[?&]ac=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return extractTargetParam(url);
    }
    catch (e) {
        return { matched: false };
    }
}
function extractJuejinUrl(url) {
    try {
        let result = extractTargetParam(url);
        if (result.matched)
            return result;
        const match = url.match(/https?:\/\/[^\/]*juejin[^\/]*\/.*?[?&](?:url|target)=([^&]+)/i);
        if (match && match[1]) {
            return {
                matched: true,
                originalUrl: decodeURIComponent(match[1]),
                needElementReplace: false
            };
        }
        return { matched: false };
    }
    catch (e) {
        return { matched: false };
    }
}
class TargetHrefStrategy {
    constructor() {
        this.name = "TargetHref";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractTargetParam(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class TargetCSDNHrefStrategy {
    constructor() {
        this.name = "CSDN";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true" || !anchor.href) {
            return false;
        }
        const result = extractTargetParam(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        this.replaceWithClickableSpan(anchor);
        return true;
    }
    replaceWithClickableSpan(anchor) {
        const attributes = Array.from(anchor.attributes);
        const content = anchor.innerHTML;
        const parent = anchor.parentElement;
        if (!parent)
            return;
        const span = document.createElement("span");
        attributes.forEach((attr) => {
            if (attr.name === "style" || attr.name === "class") {
                span.setAttribute(attr.name, attr.value);
            }
        });
        span.style.cursor = "pointer";
        span.style.textDecoration = "underline";
        span.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(anchor.href, "_blank", "noopener,noreferrer");
        });
        span.dataset.reallinkProcessed = "true";
        span.dataset.originalHref = anchor.href;
        span.innerHTML = content;
        parent.replaceChild(span, anchor);
        LinkStats.increment();
    }
}
class WeixinStrategy {
    constructor() {
        this.name = "Weixin";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractWeixinUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class BilibiliStrategy {
    constructor() {
        this.name = "Bilibili";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractBilibiliUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class WeiboStrategy {
    constructor() {
        this.name = "Weibo";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractWeiboUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class TiebaStrategy {
    constructor() {
        this.name = "Tieba";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractTiebaUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class CTO51Strategy {
    constructor() {
        this.name = "51CTO";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extract51CTOUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class InfoQStrategy {
    constructor() {
        this.name = "InfoQ";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractInfoQUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class OSChinaStrategy {
    constructor() {
        this.name = "OSChina";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractOSChinaUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class CNBlogsStrategy {
    constructor() {
        this.name = "CNBlogs";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractCNBlogsUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class JianshuStrategy {
    constructor() {
        this.name = "Jianshu";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractJianshuUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class JuejinStrategy {
    constructor() {
        this.name = "Juejin";
    }
    apply(anchor) {
        if (anchor.dataset.reallinkProcessed === "true") {
            return false;
        }
        const result = extractJuejinUrl(anchor.href);
        if (result.matched && result.originalUrl) {
            anchor.href = result.originalUrl;
            anchor.dataset.reallinkProcessed = "true";
            LinkStats.increment();
            return true;
        }
        return false;
    }
}
class DefaultStrategy {
    constructor() {
        this.name = "Default";
    }
    apply(_anchor) {
        return false;
    }
}
class LinkStats {
    static increment() {
        this.count++;
        this.notifyChange();
    }
    static getCount() {
        return this.count;
    }
    static reset() {
        this.count = 0;
        this.notifyChange();
    }
    static notifyChange() {
        try {
            chrome.runtime.sendMessage({
                type: "LINK_STATS_UPDATE",
                count: this.count
            }).catch(() => {
            });
        }
        catch {
        }
    }
}
LinkStats.count = 0;
class LinkReplacementContext {
    constructor(strategy) {
        this.strategy = strategy;
    }
    applyStrategy(anchor) {
        return this.strategy.apply(anchor);
    }
}
function getStrategy() {
    const hostname = location.hostname.toLowerCase();
    if (hostname.includes("zhihu.com")) {
        return new TargetHrefStrategy();
    }
    if (hostname.includes("juejin.cn")) {
        return new JuejinStrategy();
    }
    if (hostname.includes("jianshu.com")) {
        return new JianshuStrategy();
    }
    if (hostname.includes("csdn.net")) {
        return new TargetCSDNHrefStrategy();
    }
    if (hostname.includes("cnblogs.com")) {
        return new CNBlogsStrategy();
    }
    if (hostname.includes("weixin.qq.com") || hostname.includes("mp.weixin.qq.com")) {
        return new WeixinStrategy();
    }
    if (hostname.includes("bilibili.com")) {
        return new BilibiliStrategy();
    }
    if (hostname.includes("weibo.com") || hostname.includes("weibo.cn")) {
        return new WeiboStrategy();
    }
    if (hostname.includes("tieba.baidu.com")) {
        return new TiebaStrategy();
    }
    if (hostname.includes("51cto.com")) {
        return new CTO51Strategy();
    }
    if (hostname.includes("infoq.cn")) {
        return new InfoQStrategy();
    }
    if (hostname.includes("oschina.net")) {
        return new OSChinaStrategy();
    }
    return new DefaultStrategy();
}
function applyLinkReplacement() {
    const strategy = getStrategy();
    if (strategy instanceof DefaultStrategy) {
        return;
    }
    const context = new LinkReplacementContext(strategy);
    const anchors = document.querySelectorAll("a[href]");
    let processed = 0;
    anchors.forEach((anchor) => {
        if (context.applyStrategy(anchor)) {
            processed++;
        }
    });
    if (processed > 0) {
        console.log(`[RealLink] ${strategy.name} 策略处理了 ${processed} 个链接`);
    }
}
function processAnchor(anchor) {
    const strategy = getStrategy();
    if (strategy instanceof DefaultStrategy) {
        return;
    }
    const context = new LinkReplacementContext(strategy);
    context.applyStrategy(anchor);
}
function throttleRAF(callback) {
    let ticking = false;
    return () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    };
}
function createMutationObserver() {
    const throttledApply = throttleRAF(() => {
        applyLinkReplacement();
    });
    return new MutationObserver((mutations) => {
        let shouldProcess = false;
        const newAnchors = [];
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node;
                    if (element.tagName === "A") {
                        newAnchors.push(element);
                        shouldProcess = true;
                    }
                    const anchors = element.querySelectorAll?.("a[href]");
                    if (anchors && anchors.length > 0) {
                        anchors.forEach((anchor) => {
                            newAnchors.push(anchor);
                        });
                        shouldProcess = true;
                    }
                }
            });
        });
        if (newAnchors.length > 0) {
            const strategy = getStrategy();
            if (!(strategy instanceof DefaultStrategy)) {
                const context = new LinkReplacementContext(strategy);
                newAnchors.forEach((anchor) => {
                    context.applyStrategy(anchor);
                });
            }
        }
        if (shouldProcess && newAnchors.length > 5) {
            throttledApply();
        }
    });
}
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        switch (request.type) {
            case "GET_STATS":
                sendResponse({
                    count: LinkStats.getCount(),
                    hostname: location.hostname,
                    supported: !(getStrategy() instanceof DefaultStrategy)
                });
                break;
            case "RESET_STATS":
                LinkStats.reset();
                sendResponse({ success: true });
                break;
            case "MANUAL_PROCESS":
                applyLinkReplacement();
                sendResponse({
                    success: true,
                    count: LinkStats.getCount()
                });
                break;
            default:
                sendResponse({ error: "Unknown message type" });
        }
        return true;
    });
}
function init() {
    console.log("[RealLink] 初始化，当前域名:", location.hostname);
    const strategy = getStrategy();
    if (strategy instanceof DefaultStrategy) {
        console.log("[RealLink] 当前网站不在支持列表中");
        return;
    }
    console.log("[RealLink] 使用策略:", strategy.name);
    applyLinkReplacement();
    const observer = createMutationObserver();
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    setupMessageListener();
    if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === "PROCESS_LINKS") {
                applyLinkReplacement();
            }
        });
    }
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
}
else {
    init();
}


/******/ })()
;