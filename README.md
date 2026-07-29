# 排尿日记

儿童排尿日记网页应用（移动端优先），参考新华医院儿泌常用「日间 + 夜间」记录方式。

**Dry nights mean good mornings**

## 功能

- 孩子档案与年龄估算膀胱容量 `EBC = (年龄 + 1) × 30 ml`
- 日间：饮水、排尿、漏尿；自动计算 MVV 并白话解读
- 夜间：7 晚卡、尿布称重计算器（1g≈1ml）、TVV 解读
- 进度、汇总报告（可打印）、本机 JSON / GitHub 私有仓备份

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

数据默认保存在浏览器 localStorage。GitHub 备份请在「设置」中配置私有仓库与 Token。

> 仅供记录与就诊参考，不能代替医生诊断。
