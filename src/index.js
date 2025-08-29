// 订阅转换API端点（可自行搭建或使用公共API）
const SUB_CONVERT_API = "https://sub.xf.free.hr";

// HTML管理界面
const managePage = (token) => {
  return `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>订阅聚合管理</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
    <style>
      .container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .subscription-list { margin: 20px 0; }
      .subscription-item { 
        padding: 15px; 
        margin-bottom: 10px; 
        background: #f9f9f9; 
        border-radius: 5px; 
        border-left: 4px solid #007bff; 
      }
      .actions { margin-top: 20px; }
      .preview-area { 
        background: #f5f5f5; 
        padding: 15px; 
        border-radius: 5px; 
        margin-top: 20px;
        max-height: 300px;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <main class="container">
      <h1>订阅聚合管理</h1>
      <p>当前访问Token: <code>${token}</code></p>
      
      <form id="subForm">
        <label for="subUrls">订阅链接（每行一个）:</label>
        <textarea 
          id="subUrls" 
          name="subUrls" 
          rows="5" 
          placeholder="https://example.com/subscribe
https://sub.example.com/link" 
        ></textarea>
        
        <label for="customRules">自定义分流规则（可选）:</label>
        <textarea 
          id="customRules" 
          name="customRules" 
          rows="3" 
          placeholder="DOMAIN-SUFFIX,google.com,Proxy
DOMAIN-KEYWORD,blogspot,Proxy" 
        ></textarea>
        
        <div class="grid">
          <div>
            <label for="outputFormat">输出格式:</label>
            <select id="outputFormat" name="outputFormat">
              <option value="clash">Clash</option>
              <option value="surge">Surge</option>
              <option value="quantumult">Quantumult X</option>
              <option value="shadowrocket">Shadowrocket</option>
              <option value="base64">Base64</option>
            </select>
          </div>
          <div>
            <label for="subName">订阅名称:</label>
            <input type="text" id="subName" name="subName" value="我的聚合订阅">
          </div>
        </div>
        
        <button type="submit">生成订阅链接</button>
      </form>
      
      <div id="result" style="display: none;">
        <h3>您的订阅链接:</h3>
        <div class="input-group">
          <input type="text" id="subLink" readonly>
          <button onclick="copySubLink()">复制</button>
        </div>
        <div class="actions">
          <a href="" id="directLink" target="_blank">直接访问</a>
          <a href="" id="clashLink" target="_blank">Clash导入</a>
          <a href="" id="surgeLink" target="_blank">Surge导入</a>
        </div>
      </div>
      
      <div class="preview-area" id="preview" style="display: none;">
        <h4>节点预览（前10个）:</h4>
        <div id="nodeList"></div>
      </div>
    </main>
    <script src="script.js"></script>
  </body>
  </html>`;
};

// 获取URL参数
const getParam = (request, param) => {
  const url = new URL(request.url);
  return url.searchParams.get(param);
};

// 获取订阅内容
async function getSubscriptionContent(subUrl, customRules) {
  try {
    // 这里简单返回示例，实际应实现订阅获取和转换逻辑
    return `# 聚合订阅
${subUrl}

# 自定义规则
${customRules || "默认规则"}`;
  } catch (error) {
    return `# 错误: 无法获取订阅内容 ${error.message}`;
  }
}

// 处理订阅请求
async function handleSubscribeRequest(request, env, token) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'clash';
  const subUrls = await env.SUB_STORE.get(`${token}:urls`);
  const customRules = await env.SUB_STORE.get(`${token}:rules`);
  
  if (!subUrls) {
    return new Response('未找到订阅配置，请先通过管理界面添加订阅链接', { status: 404 });
  }
  
  const urls = subUrls.split('\n').filter(url => url.trim());
  let content = '';
  
  // 获取所有订阅内容
  for (const subUrl of urls) {
    const subContent = await getSubscriptionContent(subUrl, customRules);
    content += subContent + '\n\n';
  }
  
  // 根据格式处理内容
  let responseBody = content;
  if (format === 'base64') {
    responseBody = btoa(unescape(encodeURIComponent(content)));
  }
  
  return new Response(responseBody, {
    headers: {
      'Content-Type': format === 'base64' ? 'text/plain' : 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscription.${format === 'base64' ? 'txt' : format}"`
    }
  });
}

// Worker请求处理
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const token = getParam(request, 'token') || 'default';
    
    // 管理界面
    if (path === '/manage' || path === '/') {
      return new Response(managePage(token), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 保存订阅配置
    if (path === '/save' && request.method === 'POST') {
      const formData = await request.formData();
      const subUrls = formData.get('subUrls');
      const customRules = formData.get('customRules');
      
      await env.SUB_STORE.put(`${token}:urls`, subUrls);
      await env.SUB_STORE.put(`${token}:rules`, customRules);
      
      return Response.redirect(`${url.origin}/manage?token=${token}&saved=1`);
    }
    
    // 订阅请求
    if (path === '/sub') {
      return handleSubscribeRequest(request, env, token);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
