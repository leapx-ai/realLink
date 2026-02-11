/**
 * RealLink Background Service Worker
 * 
 * Chrome Extension Manifest V3 的后台服务脚本
 * 负责：
 * - 扩展图标点击事件处理
 * - 跨标签页消息传递
 * - 存储管理
 */

// ============================================================
// 类型定义
// ============================================================

interface LinkStatsMessage {
  type: "LINK_STATS_UPDATE";
  count: number;
}

interface PopupQueryMessage {
  type: "GET_STATS" | "RESET_STATS" | "MANUAL_PROCESS";
}

// ============================================================
// 图标点击处理
// ============================================================

/**
 * 处理扩展图标点击事件
 * 在 Manifest V3 中，如果定义了 default_popup，此事件不会被触发
 * 保留此处理程序以备将来需要手动注入脚本的场景
 */
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    // 尝试向 content script 发送处理消息
    await chrome.tabs.sendMessage(tab.id, { action: "PROCESS_LINKS" });
  } catch {
    // 如果 content script 未加载，尝试注入
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      console.log("[RealLink] Content script injected successfully");
    } catch (error) {
      console.error("[RealLink] Failed to inject content script:", error);
    }
  }
});

// ============================================================
// 安装和更新处理
// ============================================================

chrome.runtime.onInstalled.addListener((details) => {
  const version = chrome.runtime.getManifest().version;
  
  if (details.reason === "install") {
    console.log(`[RealLink] Extension installed (v${version})`);
    
    // 设置默认存储值
    chrome.storage.local.set({
      totalLinksProcessed: 0,
      installDate: Date.now(),
      settings: {
        showNotifications: true,
        autoProcess: true
      }
    });
    
    // 可选：打开欢迎页面
    // chrome.tabs.create({ url: "welcome.html" });
    
  } else if (details.reason === "update") {
    const previousVersion = details.previousVersion;
    console.log(`[RealLink] Updated from v${previousVersion} to v${version}`);
    
    // 版本迁移逻辑
    if (previousVersion && previousVersion.startsWith("1.")) {
      console.log("[RealLink] Migrating from v1.x to v2.x");
      // 可以在这里执行数据迁移
    }
  }
});

// ============================================================
// 消息处理中心
// ============================================================

chrome.runtime.onMessage.addListener((
  message: LinkStatsMessage | PopupQueryMessage,
  sender,
  sendResponse
) => {
  // 处理来自 content script 的统计更新
  if ("type" in message && message.type === "LINK_STATS_UPDATE") {
    const statsMessage = message as LinkStatsMessage;
    
    // 更新总计数
    chrome.storage.local.get("totalLinksProcessed", (data) => {
      const total = (data.totalLinksProcessed || 0) + statsMessage.count;
      chrome.storage.local.set({ totalLinksProcessed: total });
    });
    
    // 更新徽章文本显示当前标签页的处理数量
    if (sender.tab?.id) {
      updateBadge(statsMessage.count, sender.tab.id);
    }
    
    return false;
  }
  
  // 其他消息类型需要异步响应
  return true;
});

// ============================================================
// 徽章更新
// ============================================================

/**
 * 更新扩展图标徽章
 */
function updateBadge(count: number, tabId: number): void {
  // 限制徽章显示的数字范围（Chrome 限制最多 4 个字符）
  let badgeText: string;
  if (count <= 0) {
    badgeText = "";
  } else if (count > 999) {
    badgeText = "999+";
  } else {
    badgeText = count.toString();
  }
  
  chrome.action.setBadgeText({
    text: badgeText,
    tabId: tabId
  });
  
  // 设置徽章颜色
  chrome.action.setBadgeBackgroundColor({
    color: "#667eea"
  });
}

// ============================================================
// 标签页切换处理
// ============================================================

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    // 获取当前标签页的统计信息并更新徽章
    const response = await chrome.tabs.sendMessage(activeInfo.tabId, { 
      type: "GET_STATS" 
    }).catch(() => null);
    
    if (response && typeof response === "object" && "count" in response) {
      updateBadge((response as { count: number }).count, activeInfo.tabId);
    } else {
      updateBadge(0, activeInfo.tabId);
    }
  } catch {
    // 标签页可能没有 content script，清除徽章
    updateBadge(0, activeInfo.tabId);
  }
});

// ============================================================
// 存储管理
// ============================================================

/**
 * 获取扩展统计信息
 */
async function getExtensionStats(): Promise<{
  totalLinks: number;
  installDate: number;
  version: string;
}> {
  const data = await chrome.storage.local.get(["totalLinksProcessed", "installDate"]);
  const manifest = chrome.runtime.getManifest();
  
  return {
    totalLinks: data.totalLinksProcessed || 0,
    installDate: data.installDate || Date.now(),
    version: manifest.version
  };
}

// 注意：Service Worker 不使用 ES6 模块导出
// 如需在其他地方使用 getExtensionStats，通过 chrome.runtime.sendMessage 调用
