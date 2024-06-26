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

    if (bossNameSpan && companyNames.includes(bossNameSpan.textContent.trim())) {
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
        outsourceDiv.style.padding = '5px';
        outsourceDiv.style.border = '1px solid black';
        
        // 将新的 div 元素添加到 li 元素中
        card.style.position = 'relative'; // 确保 li 元素的 position 为 relative
        card.appendChild(outsourceDiv);
      }
    }
  });
}

// 初始化时检查现有的 job-card-box 元素
checkAndMarkOutsourceCompanies();

// 使用 MutationObserver 监听 DOM 变化
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains('job-card-box')) {
          // 新添加的节点是 job-card-box，进行检查
          checkAndMarkOutsourceCompanies();
        }
      });
    }
  });
});

// 开始观察 body 节点的子节点变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});
