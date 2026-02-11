/**
 * RealLink Options Page Script
 * 
 * 处理扩展选项页面的交互逻辑
 */

// ============================================================
// DOM 元素引用
// ============================================================

interface OptionsElements {
  totalLinks: HTMLElement;
  installDays: HTMLElement;
  autoProcess: HTMLInputElement;
  showNotifications: HTMLInputElement;
  showBadge: HTMLInputElement;
  resetDataBtn: HTMLButtonElement;
  toast: HTMLElement;
}

/** 获取 Options DOM 元素 */
function getOptionsElements(): OptionsElements {
  return {
    totalLinks: document.getElementById("totalLinks")!,
    installDays: document.getElementById("installDays")!,
    autoProcess: document.getElementById("autoProcess") as HTMLInputElement,
    showNotifications: document.getElementById("showNotifications") as HTMLInputElement,
    showBadge: document.getElementById("showBadge") as HTMLInputElement,
    resetDataBtn: document.getElementById("resetData") as HTMLButtonElement,
    toast: document.getElementById("toast")!
  };
}

// ============================================================
// UI 工具函数
// ============================================================

/** 显示 Options Toast 提示 */
function showOptionsToast(message: string, duration = 3000): void {
  const { toast } = getOptionsElements();
  toast.textContent = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/** 格式化数字 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/** 计算天数差 */
function calculateDays(startDate: number): number {
  const diff = Date.now() - startDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ============================================================
// 存储操作
// ============================================================

interface ExtensionSettings {
  autoProcess: boolean;
  showNotifications: boolean;
  showBadge: boolean;
}

interface ExtensionData {
  totalLinksProcessed: number;
  installDate: number;
  settings: ExtensionSettings;
}

/** 获取存储的数据 */
async function getStorageData(): Promise<ExtensionData> {
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

/** 保存设置 */
async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

/** 重置统计数据 */
async function resetStatistics(): Promise<void> {
  await chrome.storage.local.set({
    totalLinksProcessed: 0,
    installDate: Date.now()
  });
}

// ============================================================
// 页面初始化
// ============================================================

/** 更新统计显示 */
async function updateStatsDisplay(): Promise<void> {
  const { totalLinks, installDays } = getOptionsElements();
  const data = await getStorageData();
  
  totalLinks.textContent = formatNumber(data.totalLinksProcessed);
  installDays.textContent = calculateDays(data.installDate).toString();
}

/** 更新设置控件状态 */
async function updateSettingsDisplay(): Promise<void> {
  const { autoProcess, showNotifications, showBadge } = getOptionsElements();
  const data = await getStorageData();
  
  autoProcess.checked = data.settings.autoProcess;
  showNotifications.checked = data.settings.showNotifications;
  showBadge.checked = data.settings.showBadge;
}

/** 初始化页面 */
async function initOptionsPage(): Promise<void> {
  const { 
    autoProcess, 
    showNotifications, 
    showBadge, 
    resetDataBtn 
  } = getOptionsElements();

  // 加载并显示数据
  await updateStatsDisplay();
  await updateSettingsDisplay();

  // 绑定设置变更事件
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
    
    // 如果禁用徽章，清除所有徽章
    if (!showBadge.checked) {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.action.setBadgeText({ text: "", tabId: tab.id });
        }
      }
    }
  });

  // 绑定重置按钮
  resetDataBtn.addEventListener("click", async () => {
    const confirmed = confirm(
      "确定要重置所有统计数据吗？\n此操作不可恢复。"
    );
    
    if (confirmed) {
      await resetStatistics();
      await updateStatsDisplay();
      showOptionsToast("统计数据已重置");
    }
  });

  // 监听存储变化（实时更新）
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.totalLinksProcessed) {
      updateStatsDisplay();
    }
  });
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initOptionsPage().catch(console.error);
});
