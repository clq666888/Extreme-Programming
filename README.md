本项目是极限编程作业，采用 前后端分离结构 实现一个联系人管理系统。

文件结构为：
Extreme-Programming/
├─ contacts_backend
│  ├─ src/
│     ├─ app.py
│     ├─ database.py
│     └─ controller
│        └─ contacts.py
|
├─ contacts_frontend
│  ├─ src/
│  |  ├─contacts.html
│  |  ├─ style.css
│  |  └─ script.js
└─ README.md

Extreme-Programming-cloud文件夹为云端用，由于云服务器限制，虚拟环境是基于python3.10搭建
云端网址：
http://120.26.174.47:5000/

功能介绍
✔ 1. 收藏联系人（⭐）

点击星标可收藏/取消收藏

收藏状态会更新到数据库 contacts.is_favorite

✔ 2. 多联系方式（多字段结构）

每个联系人包含多种联系方式：

电话 phone

邮箱 email

QQ

微信 weixin

地址 address

这些信息存储在 contact_details 表中，结构灵活可扩展。

✔ 3. Excel 导入 / 导出

格式完全统一（中文表头）：

| 姓名 | 收藏 | 电话 | 邮箱 | QQ | 微信 | 地址 |

支持：

导出所有联系人到 Excel

上传 Excel 并批量导入联系人

后端全部由 contacts.py 负责，包括格式处理。