# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

# Password Manager

一個基於 Electron + React + Vite 的安全密碼管理器。

## 功能特色

- 🔐 主密碼保護
- 📱 現代化 UI 設計
- 🔍 密碼可見性切換
- ✏️ 密碼新增、編輯、刪除
- 🎲 隨機密碼生成
- 💾 本地 JSON 數據存儲
- 🔒 BCrypt 密碼加密

## 技術架構

- **前端**: React 18 + TypeScript
- **打包工具**: Vite
- **桌面應用**: Electron
- **狀態管理**: Zustand
- **樣式**: Tailwind CSS
- **圖標**: Heroicons
- **加密**: BCrypt.js
- **數據存儲**: JSON 文件 (本地)

## 開發環境設置

### 前置要求

- Node.js 16 或更高版本
- npm 或 yarn

### 安裝步驟

1. 克隆或下載專案到本地
```bash
cd PasswordGenerator
```

2. 安裝依賴
```bash
npm install
```

3. 啟動開發模式
```bash
npm run electron:dev
```

這個命令會同時啟動 Vite 開發服務器和 Electron 應用程式。

## 可用腳本

- `npm run dev` - 啟動 Vite 開發服務器
- `npm run build` - 建置生產版本
- `npm run electron` - 啟動 Electron (需要先啟動 dev server)
- `npm run electron:dev` - 同時啟動開發服務器和 Electron
- `npm run electron:preview` - 建置並啟動生產版本
- `npm run electron:pack` - 打包為可執行文件

## 專案結構

```
PasswordGenerator/
├── electron/           # Electron 主進程和預載腳本
│   ├── main.ts        # 主進程
│   └── preload.ts     # 預載腳本
├── src/               # React 前端源碼
│   ├── components/    # React 組件
│   ├── stores/        # Zustand 狀態管理
│   ├── types/         # TypeScript 類型定義
│   └── App.tsx        # 主應用組件
├── data/              # 數據存儲 (會自動創建)
│   ├── passwords.json # 密碼數據
│   └── master.json    # 主密碼數據
└── package.json       # 專案配置
```

## 數據存儲

應用程式使用 JSON 文件來存儲數據：

- **開發環境**: `data/` 目錄
- **生產環境**: 應用程式資源目錄

數據包括：
- 密碼列表 (`passwords.json`)
- 主密碼哈希 (`master.json`)

## 安全特性

- 主密碼使用 BCrypt 進行哈希處理
- 本地數據存儲，不會上傳到雲端
- Context Isolation 啟用
- Node Integration 禁用

## 使用說明

1. **首次使用**: 設置主密碼
2. **登錄**: 輸入主密碼解鎖應用程式
3. **新增密碼**: 點擊「新增密碼」按鈕
4. **編輯密碼**: 點擊密碼條目旁的編輯圖標
5. **刪除密碼**: 點擊刪除圖標並確認
6. **查看密碼**: 點擊眼睛圖標切換密碼可見性
7. **生成密碼**: 在新增/編輯表單中點擊「生成」按鈕

## 開發提示

- 修改前端代碼會觸發熱重載
- 修改 Electron 代碼需要重新啟動應用程式
- 數據文件會在第一次運行時自動創建

## 構建部署

建置生產版本：
```bash
npm run build
```

打包為執行檔：
```bash
npm run electron:pack
```

打包後的文件會在 `release/` 目錄中。

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
