// 异步读取公司名称文件并返回数组
async function fetchCompanyNames() {
  const response = await fetch(chrome.runtime.getURL('companies.txt'));
  const text = await response.text();
  return text.split('\n').map(name => name.trim()).filter(name => name.length > 0);
}

// 函数：检查并标记外包公司
async function checkAndMarkOutsourceCompanies() {
  const companyNames = await fetchCompanyNames();
  
  // 查找所有的 job-card-box 元素
  const jobCards = document.querySelectorAll('.job-card-box');

  jobCards.forEach(card => {
    // 查找 boss-name 元素
    const bossNameSpan = card.querySelector('.boss-name');
    
    if (bossNameSpan) {
      const companyName = bossNameSpan.textContent.trim();
      if (companyNames.some(name => companyName.includes(name))) {
        // 检查是否已经添加过标记
        if (!card.querySelector('.outsource-company-badge')) {
          // 创建新的 div 元素
          const outsourceDiv = document.createElement('div');
          outsourceDiv.textContent = '外包公司';
          outsourceDiv.className = 'outsource-company-badge';
          outsourceDiv.style.position = 'absolute';
          outsourceDiv.style.top = '10px';
          outsourceDiv.style.right = '10px';
          outsourceDiv.style.backgroundColor = 'red';
          outsourceDiv.style.color = 'white';
          outsourceDiv.style.padding = '5px';
          outsourceDiv.style.borderRadius = '4px';
          outsourceDiv.style.fontSize = '12px';
          outsourceDiv.style.zIndex = '1000';
          
          // 将新的 div 元素添加到 card 元素中
          card.style.position = 'relative';
          card.appendChild(outsourceDiv);
        }
      }
    }
  });
}

// 初始化时检查现有的 job-card-box 元素
checkAndMarkOutsourceCompanies();

// 使用 MutationObserver 监听 DOM 变化
const observer = new MutationObserver((mutations) => {
  let shouldCheck = false;
  
  for (const mutation of mutations) {
    // 检查是否有新节点添加
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && (
          node.classList?.contains('job-card-box') || 
          node.querySelector?.('.job-card-box')
        )) {
          shouldCheck = true;
          break;
        }
      }
    }
    
    if (shouldCheck) break;
  }
  
  if (shouldCheck) {
    checkAndMarkOutsourceCompanies();
  }
});

// 开始观察整个文档的变化
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// 添加滚动事件监听器
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    checkAndMarkOutsourceCompanies();
  }, 500);
});
