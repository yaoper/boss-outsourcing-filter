// 词库单例缓存：整个生命周期只 fetch 一次 companies.txt，预编译为正则表达式
let outsourceRegexPromise = null;

function getOutsourceRegex() {
  if (!outsourceRegexPromise) {
    outsourceRegexPromise = fetch(chrome.runtime.getURL('companies.txt'))
      .then(res => res.text())
      .then(text => {
        const names = [...new Set(
          text.split('\n').map(n => n.trim()).filter(Boolean)
        )];
        const escaped = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        return new RegExp(escaped.join('|'));
      });
  }
  return outsourceRegexPromise;
}

// 样式注入：一次性写入 CSS 类，替代逐元素行内样式赋值
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .outsource-company-badge {
      position: absolute;
      top: 16px;
      left: 200px;
      display: flex;
      padding: 2px;
      background-color: #000000;
      border-radius: 2px;
      z-index: 1000;
    }
    .outsource-badge-left {
      background-color: #000000;
      color: #ffffff;
      padding: 3px 6px;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .outsource-badge-right {
      background-color: #f90;
      color: #000000;
      padding: 3px 6px;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
  `;
  document.head.appendChild(style);
}

// 增量检测：仅处理尚未扫描过的卡片
async function checkAndMarkOutsourceCompanies() {
  const regex = await getOutsourceRegex();
  const uncheckedCards = document.querySelectorAll('.job-card-box:not([data-outsource-checked])');

  uncheckedCards.forEach(card => {
    card.dataset.outsourceChecked = 'true';

    const bossNameSpan = card.querySelector('.boss-name');
    if (!bossNameSpan) return;

    const companyName = bossNameSpan.textContent.trim();
    if (regex.test(companyName)) {
      card.style.position = 'relative';
      card.insertAdjacentHTML('beforeend',
        '<div class="outsource-company-badge">' +
          '<div class="outsource-badge-left">外包</div>' +
          '<div class="outsource-badge-right">公司</div>' +
        '</div>'
      );
    }
  });
}

// 防抖调度器：合并高频触发为单次执行
let debounceTimer = null;
function scheduleCheck() {
  if (debounceTimer) return;
  debounceTimer = requestAnimationFrame(() => {
    debounceTimer = null;
    checkAndMarkOutsourceCompanies();
  });
}

// 初始化
injectStyles();
checkAndMarkOutsourceCompanies();

// MutationObserver：监听新增卡片节点，带防抖
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (!mutation.addedNodes || mutation.addedNodes.length === 0) continue;
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1 && (
        node.classList?.contains('job-card-box') ||
        node.querySelector?.('.job-card-box')
      )) {
        scheduleCheck();
        return;
      }
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// 滚动兜底：低频备用检测，覆盖 MutationObserver 可能遗漏的懒加载场景
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(scheduleCheck, 500);
});
