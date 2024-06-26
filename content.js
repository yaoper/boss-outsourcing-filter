// 查找所有的 job-card-box 元素
const jobCards = document.querySelectorAll('.job-card-box');

jobCards.forEach(card => {
  // 查找 boss-name 元素
  const bossNameSpan = card.querySelector('.boss-name');

  if (bossNameSpan && bossNameSpan.textContent.includes('科技')) {
    // 创建新的 div 元素
    const techDiv = document.createElement('div');
    techDiv.textContent = '科技公司';
    techDiv.style.position = 'absolute';
    techDiv.style.top = '10px';
    techDiv.style.right = '10px';
    techDiv.style.backgroundColor = 'red';
    techDiv.style.padding = '5px';
    techDiv.style.border = '1px solid black';
    
    // 将新的 div 元素添加到 li 元素中
    card.style.position = 'relative'; // 确保 li 元素的 position 为 relative
    card.appendChild(techDiv);
  }
});
