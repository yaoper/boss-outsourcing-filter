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
          // 创建外层容器
          const containerDiv = document.createElement('div');
          containerDiv.className = 'outsource-company-badge';
          containerDiv.style.position = 'absolute';
          containerDiv.style.top = '16px';
          containerDiv.style.left = '200px';
          containerDiv.style.display = 'flex';
          containerDiv.style.padding = '2px';
          containerDiv.style.backgroundColor = '#000000';
          containerDiv.style.borderRadius = '2px';
          containerDiv.style.zIndex = '1000';
          
          // 创建左侧"外包"元素
          const leftDiv = document.createElement('div');
          leftDiv.textContent = '外包';
          leftDiv.style.backgroundColor = '#000000';
          leftDiv.style.color = '#ffffff';
          leftDiv.style.padding = '3px 6px';
          leftDiv.style.fontSize = '13px';
          leftDiv.style.fontWeight = 'bold';
          leftDiv.style.letterSpacing = '0.5px';
          
          // 创建右侧"公司"元素
          const rightDiv = document.createElement('div');
          rightDiv.textContent = '公司';
          rightDiv.style.backgroundColor = '#f90';
          rightDiv.style.color = '#000000';
          rightDiv.style.padding = '3px 6px';
          rightDiv.style.fontSize = '13px';
          rightDiv.style.fontWeight = 'bold';
          rightDiv.style.letterSpacing = '0.5px';
          
          // 组装标记
          containerDiv.appendChild(leftDiv);
          containerDiv.appendChild(rightDiv);
          
          // 将新的标记添加到 card 元素中
          card.style.position = 'relative';
          card.appendChild(containerDiv);
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
