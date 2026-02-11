/**
 * RealLink Popup 脚本
 * 
 * 处理扩展弹出窗口的交互逻辑，包括：
 * - 显示当前网站域名
 * - 显示已处理的链接统计
 * - 支持平台列表展示
 * - 刷新和重置功能
 */

// ============================================================
// DOM 元素引用
// ============================================================

interface PopupElements {
  domainLabel: HTMLElement;
  statsCount: HTMLElement;
  statusBadge: HTMLElement;
  statusText: HTMLElement;
  refreshBtn: HTMLButtonElement;
  resetBtn: HTMLButtonElement;
  statusCard: HTMLElement;
  unsupportedMsg: HTMLElement;
  unsupportedDomain: HTMLElement;
  actions: HTMLElement;
  sitesSection: HTMLElement;
  toast: HTMLElement;
}

/** 获取 Popup DOM 元素 */
function getPopupElements(): PopupElements {
  return {
    domainLabel: document.getElementById("domainLabel")!,
    statsCount: document.getElementById("statsCount")!,
    statusBadge: document.getElementById("statusBadge")!,
    statusText: document.getElementById("statusText")!,
    refreshBtn: document.getElementById("refreshBtn") as HTMLButtonElement,
    resetBtn: document.getElementById("resetBtn") as HTMLButtonElement,
    statusCard: document.getElementById("statusCard")!,
    unsupportedMsg: document.getElementById("unsupportedMsg")!,
    unsupportedDomain: document.getElementById("unsupportedDomain")!,
    actions: document.getElementById("actions")!,
    sitesSection: document.getElementById("sitesSection")!,
    toast: document.getElementById("toast")!
  };
}

// ============================================================
// 支持的平台列表
// ============================================================

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

/** 检查域名是否受支持 */
function isSupportedDomain(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();
  return SUPPORTED_DOMAINS.some(domain => lowerHostname.includes(domain));
}

// ============================================================
// UI 更新函数
// ============================================================

/** 显示 Popup Toast 提示 */
function showPopupToast(message: string, duration = 2000): void {
  const { toast } = getPopupElements();
  toast.textContent = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/** 更新状态卡片 */
function updateStatusCard(hostname: string, count: number, supported: boolean): void {
  const { 
    domainLabel, 
    statsCount, 
    statusBadge, 
    statusText,
    statusCard,
    unsupportedMsg,
    unsupportedDomain,
    actions,
    sitesSection
  } = getPopupElements();

  domainLabel.textContent = hostname || "未知域名";
  statsCount.textContent = count.toString();

  if (supported) {
    statusBadge.className = "status-badge supported";
    statusText.textContent = "支持";
    
    // 显示支持的元素
    statusCard.style.display = "block";
    actions.style.display = "flex";
    sitesSection.style.display = "block";
    unsupportedMsg.classList.add("hidden");
  } else {
    // 不支持状态下，显示提示信息但保留平台列表
    statusCard.style.display = "none";
    actions.style.display = "none";
    unsupportedMsg.classList.remove("hidden");
    unsupportedDomain.textContent = hostname || "未知域名";
    
    // 保留平台列表显示，让用户知道支持哪些平台
    sitesSection.style.display = "block";
  }
}

/** 设置 Popup 按钮加载状态 */
function setPopupButtonLoading(btn: HTMLButtonElement, loading: boolean): void {
  btn.disabled = loading;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = "<span>⏳</span> 处理中...";
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

// ============================================================
// 消息通信
// ============================================================

/** 获取当前标签页信息 */
async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

/** 向 content script 发送消息 */
async function sendMessageToContent<T>(
  tabId: number, 
  message: unknown
): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.log("[RealLink] Message error:", chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(response as T);
      }
    });
  });
}

/** 从 content script 获取统计信息 */
async function fetchStats(tabId: number): Promise<{ count: number; hostname: string; supported: boolean } | null> {
  return sendMessageToContent(tabId, { type: "GET_STATS" });
}

/** 重置统计 */
async function resetStats(tabId: number): Promise<boolean> {
  const response = await sendMessageToContent<{ success: boolean }>(tabId, { type: "RESET_STATS" });
  return response?.success || false;
}

/** 手动处理链接 */
async function manualProcess(tabId: number): Promise<{ success: boolean; count: number } | null> {
  return sendMessageToContent(tabId, { type: "MANUAL_PROCESS" });
}

// ============================================================
// 事件处理
// ============================================================

/** 初始化弹出窗口 */
async function initPopup(): Promise<void> {
  const { refreshBtn, resetBtn } = getPopupElements();
  
  const tab = await getCurrentTab();
  
  if (!tab?.id) {
    updateStatusCard("无法获取当前页面", 0, false);
    return;
  }

  // 获取域名
  let hostname = "未知域名";
  try {
    if (tab.url) {
      hostname = new URL(tab.url).hostname;
    }
  } catch {
    // 忽略 URL 解析错误
  }

  const supported = isSupportedDomain(hostname);

  // 如果是支持的域名，尝试获取统计信息
  if (supported) {
    const stats = await fetchStats(tab.id);
    if (stats) {
      updateStatusCard(stats.hostname || hostname, stats.count, stats.supported);
    } else {
      // 如果没有响应，content script 可能未加载，尝试注入
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
        // 再次尝试获取统计
        const newStats = await fetchStats(tab.id);
        updateStatusCard(
          newStats?.hostname || hostname, 
          newStats?.count || 0, 
          newStats?.supported ?? supported
        );
      } catch (error) {
        console.log("[RealLink] Script injection failed:", error);
        updateStatusCard(hostname, 0, supported);
      }
    }
  } else {
    updateStatusCard(hostname, 0, false);
  }

  // 绑定按钮事件
  refreshBtn.addEventListener("click", async () => {
    if (!tab.id) return;
    
    setPopupButtonLoading(refreshBtn, true);
    
    try {
      // 尝试重新处理页面上的链接
      const result = await manualProcess(tab.id);
      
      if (result) {
        updateStatusCard(hostname, result.count, supported);
        showPopupToast(`已刷新，共处理 ${result.count} 个链接`);
      } else {
        // 如果 content script 未响应，尝试重新获取统计
        const stats = await fetchStats(tab.id);
        if (stats) {
          updateStatusCard(stats.hostname || hostname, stats.count, stats.supported);
          showPopupToast(`当前已处理 ${stats.count} 个链接`);
        } else {
          showPopupToast("无法获取统计信息");
        }
      }
    } catch (error) {
      console.error("[RealLink] Refresh error:", error);
      showPopupToast("刷新失败，请重试");
    } finally {
      setPopupButtonLoading(refreshBtn, false);
    }
  });

  resetBtn.addEventListener("click", async () => {
    if (!tab.id) return;
    
    const confirmed = confirm("确定要重置统计计数吗？");
    if (!confirmed) return;

    setPopupButtonLoading(resetBtn, true);
    
    try {
      const success = await resetStats(tab.id);
      if (success) {
        updateStatusCard(hostname, 0, supported);
        showPopupToast("统计已重置");
      } else {
        showPopupToast("重置失败");
      }
    } catch (error) {
      console.error("[RealLink] Reset error:", error);
      showPopupToast("重置失败");
    } finally {
      setPopupButtonLoading(resetBtn, false);
    }
  });
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initPopup().catch(console.error);
});
