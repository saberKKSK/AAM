// 创建并插入账号选择器
function createAccountSelector(accounts) {
  const selectorContainer = document.createElement('div');
  selectorContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
  `;

  // 添加作者信息
  const authorInfo = document.createElement('div');
  authorInfo.textContent = 'Created by TOGO';
  authorInfo.style.cssText = `
    font-size: 10px;
    color: #666;
    text-align: center;
    margin-bottom: 5px;
    font-style: italic;
  `;
  selectorContainer.appendChild(authorInfo);

  const select = document.createElement('select');
  select.style.cssText = `
    padding: 5px;
    margin-right: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  `;

  // 添加默认选项
  select.innerHTML = '<option value="">选择账号</option>';
  
  // 添加所有账号
  accounts.forEach(account => {
    const option = document.createElement('option');
    option.value = JSON.stringify({
      username: account.email,
      password: account.password
    });
    option.textContent = `${account.username} (${account.rank || '无段位'})`;
    select.appendChild(option);
  });

  const fillButton = document.createElement('button');
  fillButton.textContent = '自动填充';
  fillButton.style.cssText = `
    padding: 5px 10px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;

  fillButton.addEventListener('click', () => {
    const selectedValue = select.value;
    if (!selectedValue) {
      alert('请先选择一个账号');
      return;
    }

    const accountInfo = JSON.parse(selectedValue);
    fillLoginForm(accountInfo);
  });

  selectorContainer.appendChild(select);
  selectorContainer.appendChild(fillButton);
  document.body.appendChild(selectorContainer);
}

// 填充登录表单
function fillLoginForm(accountInfo) {
  // EA登录页面的邮箱输入框
  const emailInput = document.querySelector('input[name="email"]') || 
                    document.querySelector('input[type="email"]') ||
                    document.querySelector('#email');

  // EA登录页面的密码输入框
  const passwordInput = document.querySelector('input[name="password"]') ||
                       document.querySelector('input[type="password"]') ||
                       document.querySelector('#password');

  if (emailInput) {
    emailInput.value = accountInfo.username;
    // 触发change事件
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (passwordInput) {
    passwordInput.value = accountInfo.password;
    // 触发change事件
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// 从存储中获取账号信息
chrome.storage.sync.get(['accounts'], function(result) {
  if (result.accounts && result.accounts.length > 0) {
    createAccountSelector(result.accounts);
  }
});

// 监听页面变化，确保在动态加载的登录表单上也能工作
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      const loginForm = document.querySelector('form');
      if (loginForm) {
        chrome.storage.sync.get(['accounts'], function(result) {
          if (result.accounts && result.accounts.length > 0) {
            createAccountSelector(result.accounts);
          }
        });
        observer.disconnect();
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 