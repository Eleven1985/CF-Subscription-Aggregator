📖 部署教程
前置要求
1.
Cloudflare账户

2.
安装Wrangler CLI: npm install -g wrangler

3.
注册Wrangler: wrangler login

步骤1: 创建KV命名空间
bash
复制
wrangler kv:namespace create SUB_STORE
将输出的ID添加到wrangler.toml中的kv_namespaces部分。

步骤2: 配置项目
1.
克隆或下载本项目文件

2.
安装依赖: npm install

3.
配置wrangler.toml中的account_id和zone_id

步骤3: 部署Worker
bash
复制
# 测试部署
wrangler dev

# 生产部署
wrangler deploy
步骤4: 配置自定义域名（可选）
在Cloudflare DNS中添加CNAME记录，指向您的Worker域名。

步骤5: 使用管理界面
访问您的Worker域名，例如:

•
https://your-worker.your-subdomain.workers.dev/manage

•
或您的自定义域名: https://sub.yourdomain.com/manage

🎯 使用方法
1.
​添加订阅链接​：在管理界面中输入您的订阅链接（每行一个）

2.
​设置自定义规则​（可选）：根据需要添加自定义分流规则

3.
​选择输出格式​：选择适合您客户端的输出格式

4.
​生成订阅链接​：点击生成获取聚合订阅链接

5.
​导入客户端​：使用生成的链接导入到您的代理客户端

🔧 高级配置
环境变量
变量名

描述

默认值

SUB_CONVERT_API

订阅转换API端点

https://sub.xf.free.hr

DEFAULT_TOKEN

默认访问Token

auto

自定义分流规则
支持Surge/Clash格式的分流规则：

复制
# 规则语法
规则类型,匹配内容,策略组

# 示例
DOMAIN-SUFFIX,google.com,Proxy
DOMAIN-KEYWORD,blogspot,Proxy
IP-CIDR,8.8.8.8/32,Direct
📝 API参考
获取订阅
复制
GET /sub?token=[token]&format=[format]
参数:

•
token: 订阅标识符

•
format: 输出格式 (clash, surge, quantumult, shadowrocket, base64)

🗂️ 注意事项
1.
本项目需自行搭建订阅转换API或使用公共API

2.
大量节点聚合可能导致订阅生成缓慢

3.
建议使用Token参数防止订阅泄露

4.
非Base64订阅会生成24小时临时链接

📄 许可证
MIT License

🤝 贡献
欢迎提交Issue和Pull Request来改进本项目。

💬 支持
如有问题，请通过以下方式联系：

•
创建GitHub Issue

•
通过Telegram群组联系

​免责声明: 本项目仅供学习交流使用，请遵守当地法律法规
。
