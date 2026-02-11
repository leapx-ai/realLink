/**
 * RealLink - 外链还原内容脚本
 * 
 * 自动识别并还原中文网站的外链跳转拦截，将中间跳转链接替换为原始链接
 */

// ============================================================
// 类型定义
// ============================================================

/** 链接替换策略接口 */
interface LinkReplacementStrategy {
  /** 应用策略处理锚点元素 */
  apply(anchor: HTMLAnchorElement): boolean;
  /** 策略名称 */
  readonly name: string;
}

/** 链接解析结果 */
interface LinkParseResult {
  /** 是否匹配 */
  matched: boolean;
  /** 原始链接 */
  originalUrl?: string;
  /** 是否需要元素替换（如 CSDN） */
  needElementReplace?: boolean;
}

// ============================================================
// 链接解析工具函数
// ============================================================

/**
 * 从 URL 中提取 target 参数
 * @param url - 要解析的 URL
 * @returns 解析结果
 */
function extractTargetParam(url: string): LinkParseResult {
  try {
    // 匹配各种 link.*.com/?target=xxx 格式
    const match = url.match(/https?:\/\/link\.[^\/]+\/\?target=([^&]+)/i);
    if (match && match[1]) {
      return {
        matched: true,
        originalUrl: decodeURIComponent(match[1]),
        needElementReplace: false
      };
    }
    return { matched: false };
  } catch (e) {
    console.error("[RealLink] Error parsing URL:", e);
    return { matched: false };
  }
}

/**
 * 提取 weixin.qq.com 的跳转链接
 * 格式：https://mp.weixin.qq.com/s?... 中的链接
 */
function extractWeixinUrl(url: string): LinkParseResult {
  try {
    // 微信文章中的外链通常格式较复杂，可能有多种格式
    const match = url.match(/https?:\/\/[^\/]*weixin[^\/]*\/.*?[?&]url=([^&]+)/i);
    if (match && match[1]) {
      return {
        matched: true,
        originalUrl: decodeURIComponent(match[1]),
        needElementReplace: false
      };
    }
    return { matched: false };
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取 Bilibili 的跳转链接
 */
function extractBilibiliUrl(url: string): LinkParseResult {
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
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取微博的跳转链接
 */
function extractWeiboUrl(url: string): LinkParseResult {
  try {
    // 微博链接格式：https://weibo.cn/sinaurl?u=xxx 或 https://weibo.cn/sinaurl?toasturl=xxx
    const match = url.match(/https?:\/\/[^\/]*weibo[^\/]*\/sinaurl\?(?:toasturl|u)=([^&]+)/i);
    if (match && match[1]) {
      return {
        matched: true,
        originalUrl: decodeURIComponent(match[1]),
        needElementReplace: false
      };
    }
    return { matched: false };
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取百度贴吧的跳转链接
 */
function extractTiebaUrl(url: string): LinkParseResult {
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
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取 51CTO 的跳转链接
 */
function extract51CTOUrl(url: string): LinkParseResult {
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
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取 InfoQ 的跳转链接
 */
function extractInfoQUrl(url: string): LinkParseResult {
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
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取 OSChina 的跳转链接
 */
function extractOSChinaUrl(url: string): LinkParseResult {
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
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取博客园的跳转链接
 */
function extractCNBlogsUrl(url: string): LinkParseResult {
  try {
    // 博客园可能使用多种跳转格式
    const match = url.match(/https?:\/\/[^\/]*cnblogs[^\/]*\/.*?[?&](?:url|target|u)=([^&]+)/i);
    if (match && match[1]) {
      return {
        matched: true,
        originalUrl: decodeURIComponent(match[1]),
        needElementReplace: false
      };
    }
    return { matched: false };
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取简书的跳转链接
 */
function extractJianshuUrl(url: string): LinkParseResult {
  try {
    const match = url.match(/https?:\/\/[^\/]*jianshu[^\/]*\/go-wild\?.*?[?&]ac=([^&]+)/i);
    if (match && match[1]) {
      return {
        matched: true,
        originalUrl: decodeURIComponent(match[1]),
        needElementReplace: false
      };
    }
    // 简书也有 target 格式的链接
    return extractTargetParam(url);
  } catch (e) {
    return { matched: false };
  }
}

/**
 * 提取掘金的新格式跳转链接
 */
function extractJuejinUrl(url: string): LinkParseResult {
  try {
    // 掘金可能有多种格式
    let result = extractTargetParam(url);
    if (result.matched) return result;

    // 其他可能的格式
    const match = url.match(/https?:\/\/[^\/]*juejin[^\/]*\/.*?[?&](?:url|target)=([^&]+)/i);
    if (match && match[1]) {
      return {
        matched: true,
        originalUrl: decodeURIComponent(match[1]),
        needElementReplace: false
      };
    }
    return { matched: false };
  } catch (e) {
    return { matched: false };
  }
}

// ============================================================
// 策略类
// ============================================================

/** 通用 target 参数提取策略 - 适用于知乎、掘金、简书等 */
class TargetHrefStrategy implements LinkReplacementStrategy {
  readonly name = "TargetHref";

  apply(anchor: HTMLAnchorElement): boolean {
    // 跳过已处理的链接
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

/** CSDN 特殊策略 - 需要元素替换 */
class TargetCSDNHrefStrategy implements LinkReplacementStrategy {
  readonly name = "CSDN";

  apply(anchor: HTMLAnchorElement): boolean {
    // 检查是否已经被处理过或是空链接
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

    // 对于无法直接替换的 CSDN 链接，进行元素替换
    this.replaceWithClickableSpan(anchor);
    return true;
  }

  private replaceWithClickableSpan(anchor: HTMLAnchorElement): void {
    // 保存原元素属性和内容
    const attributes = Array.from(anchor.attributes);
    const content = anchor.innerHTML;
    const parent = anchor.parentElement;

    if (!parent) return;

    // 创建 span 元素
    const span = document.createElement("span");

    // 复制样式相关属性
    attributes.forEach((attr) => {
      if (attr.name === "style" || attr.name === "class") {
        span.setAttribute(attr.name, attr.value);
      }
    });

    // 添加点击事件处理
    span.style.cursor = "pointer";
    span.style.textDecoration = "underline";
    span.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(anchor.href, "_blank", "noopener,noreferrer");
    });

    // 标记为已处理
    span.dataset.reallinkProcessed = "true";
    span.dataset.originalHref = anchor.href;

    // 复制内容
    span.innerHTML = content;

    // 替换元素
    parent.replaceChild(span, anchor);
    LinkStats.increment();
  }
}

/** 微信策略 */
class WeixinStrategy implements LinkReplacementStrategy {
  readonly name = "Weixin";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** Bilibili 策略 */
class BilibiliStrategy implements LinkReplacementStrategy {
  readonly name = "Bilibili";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 微博策略 */
class WeiboStrategy implements LinkReplacementStrategy {
  readonly name = "Weibo";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 百度贴吧策略 */
class TiebaStrategy implements LinkReplacementStrategy {
  readonly name = "Tieba";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 51CTO 策略 */
class CTO51Strategy implements LinkReplacementStrategy {
  readonly name = "51CTO";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** InfoQ 策略 */
class InfoQStrategy implements LinkReplacementStrategy {
  readonly name = "InfoQ";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** OSChina 策略 */
class OSChinaStrategy implements LinkReplacementStrategy {
  readonly name = "OSChina";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 博客园策略 */
class CNBlogsStrategy implements LinkReplacementStrategy {
  readonly name = "CNBlogs";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 简书策略 */
class JianshuStrategy implements LinkReplacementStrategy {
  readonly name = "Jianshu";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 掘金策略 */
class JuejinStrategy implements LinkReplacementStrategy {
  readonly name = "Juejin";

  apply(anchor: HTMLAnchorElement): boolean {
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

/** 默认策略：不进行任何操作 */
class DefaultStrategy implements LinkReplacementStrategy {
  readonly name = "Default";

  apply(_anchor: HTMLAnchorElement): boolean {
    return false;
  }
}

// ============================================================
// 统计模块
// ============================================================

/** 链接处理统计 */
class LinkStats {
  private static count = 0;

  static increment(): void {
    this.count++;
    this.notifyChange();
  }

  static getCount(): number {
    return this.count;
  }

  static reset(): void {
    this.count = 0;
    this.notifyChange();
  }

  private static notifyChange(): void {
    // 发送消息给 background 或 popup
    try {
      chrome.runtime.sendMessage({
        type: "LINK_STATS_UPDATE",
        count: this.count
      }).catch(() => {
        // 忽略连接错误
      });
    } catch {
      // 忽略错误
    }
  }
}

// ============================================================
// 策略上下文
// ============================================================

/** 策略上下文，用于根据不同域名执行不同的替换策略 */
class LinkReplacementContext {
  private strategy: LinkReplacementStrategy;

  constructor(strategy: LinkReplacementStrategy) {
    this.strategy = strategy;
  }

  applyStrategy(anchor: HTMLAnchorElement): boolean {
    return this.strategy.apply(anchor);
  }
}

// ============================================================
// 策略工厂
// ============================================================

/**
 * 根据当前域名获取对应的策略
 * 支持多种域名匹配方式：精确匹配、后缀匹配、子域名匹配
 */
function getStrategy(): LinkReplacementStrategy {
  const hostname = location.hostname.toLowerCase();

  // 知乎 - target 参数格式
  if (hostname.includes("zhihu.com")) {
    return new TargetHrefStrategy();
  }

  // 掘金
  if (hostname.includes("juejin.cn")) {
    return new JuejinStrategy();
  }

  // 简书
  if (hostname.includes("jianshu.com")) {
    return new JianshuStrategy();
  }

  // CSDN - 特殊处理
  if (hostname.includes("csdn.net")) {
    return new TargetCSDNHrefStrategy();
  }

  // 博客园
  if (hostname.includes("cnblogs.com")) {
    return new CNBlogsStrategy();
  }

  // 微信
  if (hostname.includes("weixin.qq.com") || hostname.includes("mp.weixin.qq.com")) {
    return new WeixinStrategy();
  }

  // Bilibili
  if (hostname.includes("bilibili.com")) {
    return new BilibiliStrategy();
  }

  // 微博
  if (hostname.includes("weibo.com") || hostname.includes("weibo.cn")) {
    return new WeiboStrategy();
  }

  // 百度贴吧
  if (hostname.includes("tieba.baidu.com")) {
    return new TiebaStrategy();
  }

  // 51CTO
  if (hostname.includes("51cto.com")) {
    return new CTO51Strategy();
  }

  // InfoQ
  if (hostname.includes("infoq.cn")) {
    return new InfoQStrategy();
  }

  // OSChina
  if (hostname.includes("oschina.net")) {
    return new OSChinaStrategy();
  }

  return new DefaultStrategy();
}

// ============================================================
// 核心处理逻辑
// ============================================================

/** 应用策略到所有 <a> 标签 */
function applyLinkReplacement(): void {
  const strategy = getStrategy();
  
  // 如果是默认策略，说明当前网站不支持，直接返回
  if (strategy instanceof DefaultStrategy) {
    return;
  }

  const context = new LinkReplacementContext(strategy);
  const anchors = document.querySelectorAll<HTMLAnchorElement>("a[href]");

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

/** 处理单个新增节点 */
function processAnchor(anchor: HTMLAnchorElement): void {
  const strategy = getStrategy();
  if (strategy instanceof DefaultStrategy) {
    return;
  }

  const context = new LinkReplacementContext(strategy);
  context.applyStrategy(anchor);
}

// ============================================================
// DOM 观察器 - 处理动态内容
// ============================================================

/**
 * 使用 requestAnimationFrame 节流处理函数
 * 避免 MutationObserver 频繁触发导致的性能问题
 */
function throttleRAF<T extends (...args: unknown[]) => unknown>(
  callback: T
): () => void {
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

/** 创建并配置 MutationObserver */
function createMutationObserver(): MutationObserver {
  const throttledApply = throttleRAF(() => {
    applyLinkReplacement();
  });

  return new MutationObserver((mutations) => {
    let shouldProcess = false;
    const newAnchors: HTMLAnchorElement[] = [];

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 如果新增的是锚点元素
          if (element.tagName === "A") {
            newAnchors.push(element as HTMLAnchorElement);
            shouldProcess = true;
          }
          
          // 如果新增的元素包含锚点
          const anchors = element.querySelectorAll?.("a[href]");
          if (anchors && anchors.length > 0) {
            anchors.forEach((anchor) => {
              newAnchors.push(anchor as HTMLAnchorElement);
            });
            shouldProcess = true;
          }
        }
      });
    });

    // 优先处理新添加的锚点
    if (newAnchors.length > 0) {
      const strategy = getStrategy();
      if (!(strategy instanceof DefaultStrategy)) {
        const context = new LinkReplacementContext(strategy);
        newAnchors.forEach((anchor) => {
          context.applyStrategy(anchor);
        });
      }
    }

    // 如果变化较大，进行全面扫描
    if (shouldProcess && newAnchors.length > 5) {
      throttledApply();
    }
  });
}

// ============================================================
// 消息通信
// ============================================================

/** 设置消息监听器 */
function setupMessageListener(): void {
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

// ============================================================
// 初始化
// ============================================================

/** 初始化扩展 */
function init(): void {
  console.log("[RealLink] 初始化，当前域名:", location.hostname);

  const strategy = getStrategy();
  if (strategy instanceof DefaultStrategy) {
    console.log("[RealLink] 当前网站不在支持列表中");
    return;
  }

  console.log("[RealLink] 使用策略:", strategy.name);

  // 初始处理页面中的链接
  applyLinkReplacement();

  // 监听 DOM 变化处理动态加载的内容
  const observer = createMutationObserver();
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 设置消息监听
  setupMessageListener();

  // 监听来自 background 的脚本注入通知
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "PROCESS_LINKS") {
        applyLinkReplacement();
      }
    });
  }
}

// DOM 加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// 导出供测试使用
export { LinkStats, getStrategy };
