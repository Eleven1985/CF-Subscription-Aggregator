// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('subForm');
  const resultDiv = document.getElementById('result');
  const subLinkInput = document.getElementById('subLink');
  const directLink = document.getElementById('directLink');
  const clashLink = document.getElementById('clashLink');
  const surgeLink = document.getElementById('surgeLink');
  const previewDiv = document.getElementById('preview');
  const nodeList = document.getElementById('nodeList');
  
  // 检查URL参数
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('saved') === '1') {
    alert('配置已保存！');
  }
  
  // 表单提交处理
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const subUrls = formData.get('subUrls');
    const customRules = formData.get('customRules');
    const outputFormat = formData.get('outputFormat');
    const subName = formData.get('subName');
    
    // 保存配置到后端
    fetch('/save', {
      method: 'POST',
      body: new URLSearchParams({
        subUrls,
        customRules,
        outputFormat,
        subName
      })
    })
    .then(response => {
      if (response.ok) {
        // 生成订阅链接
        const token = urlParams.get('token') || 'default';
        const baseUrl = window.location.origin;
        const subUrl = `${baseUrl}/sub?token=${token}&format=${outputFormat}`;
        
        // 更新UI显示
        subLinkInput.value = subUrl;
        directLink.href = subUrl;
        clashLink.href = `clash://install-config?url=${encodeURIComponent(subUrl)}`;
        surgeLink.href = `surge:///install-config?url=${encodeURIComponent(subUrl)}`;
        
        resultDiv.style.display = 'block';
        previewNodes(subUrls);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('保存失败，请重试');
    });
  });
  
  // 预览节点信息
  function previewNodes(subUrls) {
    const urlList = subUrls.split('\n').filter(url => url.trim());
    nodeList.innerHTML = '';
    
    if (urlList.length > 0) {
      previewDiv.style.display = 'block';
      nodeList.innerHTML = `
        <p>共添加了 ${urlList.length} 个订阅源</p>
        <ul>
          ${urlList.map(url => `<li>${url}</li>`).join('')}
        </ul>
        <p><small>实际节点数量取决于订阅源内容</small></p>
      `;
    }
  }
});

// 复制订阅链接
function copySubLink() {
  const subLinkInput = document.getElementById('subLink');
  subLinkInput.select();
  document.execCommand('copy');
  alert('订阅链接已复制到剪贴板');
}
