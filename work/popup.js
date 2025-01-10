document.addEventListener('DOMContentLoaded', function() {
  loadAccounts();
  document.getElementById('saveAccount').addEventListener('click', saveAccount);
});

function saveAccount() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;
  const emailPassword = document.getElementById('emailPassword').value;
  const rank = document.getElementById('rank').value;
  const note = document.getElementById('note').value;
  
  if (!username || !password || !email || !emailPassword) {
    alert('请输入所有必填字段！');
    return;
  }
  
  chrome.storage.sync.get(['accounts'], function(result) {
    const accounts = result.accounts || [];
    accounts.push({
      username,
      password,
      email,
      emailPassword,
      rank,
      note,
      id: Date.now()
    });
    
    chrome.storage.sync.set({ accounts }, function() {
      loadAccounts();
      clearForm();
    });
  });
}

// 添加邮箱服务商配置
const EMAIL_PROVIDERS = {
  'novachlps.com': 'https://lzt.market/letters2',
  'qq.com': 'https://mail.qq.com', // QQ邮箱直接登录
  'snapmail.cc': 'https://snapmail.cc/emailList/',
  'default': 'https://lzt.market/letters2'
};

function loadAccounts() {
  const accountsList = document.getElementById('accountsList');
  accountsList.innerHTML = '';
  
  chrome.storage.sync.get(['accounts'], function(result) {
    const accounts = result.accounts || [];
    
    accounts.forEach(account => {
      const accountElement = document.createElement('div');
      accountElement.className = 'account-item';
      accountElement.innerHTML = `
        <div>
          <strong>${account.username}</strong>
          <br><small>邮箱: ${account.email}</small>
          ${account.rank ? `<br><small class="rank ${account.rank}">段位: ${account.rank}</small>` : ''}
          ${account.note ? `<br><small>备注: ${account.note}</small>` : ''}
        </div>
        <div class="account-buttons">
          <button class="copy-btn" data-username="${account.username}" 
            data-password="${account.password}" 
            data-email="${account.email}"
            data-email-password="${account.emailPassword}">复制</button>
          <button class="verify-btn" data-email="${account.email}" 
            data-email-password="${account.emailPassword}">获取验证码</button>
          <button class="edit-rank-btn" data-id="${account.id}">修改段位</button>
          <button class="delete-btn" data-id="${account.id}">删除</button>
        </div>
      `;
      
      accountsList.appendChild(accountElement);
    });
    
    // 更新复制功能
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const username = this.dataset.username;
        const password = this.dataset.password;
        const email = this.dataset.email;
        const emailPassword = this.dataset.emailPassword;
        const textToCopy = `游戏账号：${username}\n游戏密码：${password}\n邮箱：${email}\n邮箱密码：${emailPassword}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
          alert('账号信息已复制到剪贴板！');
        });
      });
    });

    // 添加获取验证码功能
    document.querySelectorAll('.verify-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const email = this.dataset.email;
        const emailPassword = this.dataset.emailPassword;
        
        // 获取邮箱后缀
        const emailDomain = email.split('@')[1];
        
        // 根据不同的邮箱类型构建不同的URL
        let verifyUrl;
        switch(emailDomain) {
          case 'qq.com':
            // QQ邮箱直接跳转到登录页
            verifyUrl = 'https://mail.qq.com';
            break;
          case 'novachlps.com':
            verifyUrl = `https://lzt.market/letters2?email=${encodeURIComponent(email)}&password=${encodeURIComponent(emailPassword)}`;
            break;
          case 'snapmail.cc':
            verifyUrl = `https://snapmail.cc/emailList/${encodeURIComponent(email)}`;
            break;
          default:
            verifyUrl = `https://lzt.market/letters2?email=${encodeURIComponent(email)}&password=${encodeURIComponent(emailPassword)}`;
        }
        
        // 在新标签页中打开链接
        chrome.tabs.create({ url: verifyUrl });
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        deleteAccount(id);
      });
    });

    // 添加修改段位功能
    document.querySelectorAll('.edit-rank-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const newRank = prompt('请选择新段位：\n青铜、白银、黄金、铂金、钻石、大师、猎杀');
        if (newRank) {
          updateRank(id, newRank);
        }
      });
    });
  });
}

function deleteAccount(id) {
  chrome.storage.sync.get(['accounts'], function(result) {
    const accounts = result.accounts || [];
    const newAccounts = accounts.filter(account => account.id !== id);
    
    chrome.storage.sync.set({ accounts: newAccounts }, function() {
      loadAccounts();
    });
  });
}

// 添加更新段位的函数
function updateRank(id, newRank) {
  chrome.storage.sync.get(['accounts'], function(result) {
    const accounts = result.accounts || [];
    const accountIndex = accounts.findIndex(account => account.id === id);
    
    if (accountIndex !== -1) {
      accounts[accountIndex].rank = newRank;
      chrome.storage.sync.set({ accounts }, function() {
        loadAccounts();
      });
    }
  });
}

function clearForm() {
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('email').value = '';
  document.getElementById('emailPassword').value = '';
  document.getElementById('rank').value = '';
  document.getElementById('note').value = '';
} 