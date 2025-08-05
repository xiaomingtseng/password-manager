# Password Manager

一個基於 Electron + React + Vite 的安全密碼管理器。

## 功能特色

- 🔐 主密碼保護
- 📱 現代化 UI 設計
- 🔍 密碼可見性切換
- ✏️ 密碼新增、編輯、刪除
- 🎲 隨機密碼生成
- 💾 本地 JSON 數據存儲
- 🔒 簡單 Base64 編碼（開發版本）

## 技術架構

- **前端**: React 18 + TypeScript
- **打包工具**: Vite
- **桌面應用**: Electron
- **狀態管理**: Zustand
- **樣式**: Tailwind CSS v4 ✨
- **圖標**: Heroicons
- **加密**: 簡單 Base64 編碼（開發版本）
- **數據存儲**: JSON 文件 (Electron) / localStorage (瀏覽器)

> **注意**: 原計劃使用 SQLite 數據庫，但因為 `better-sqlite3` 在 Electron 環境中的編譯複雜性，目前版本採用 JSON 文件存儲。未來版本將會實現完整的 SQLite 支援。

### 🎨 Tailwind CSS v4 配置

本專案採用最新的 Tailwind CSS v4，具有以下特點：
- **零配置**: 無需 `tailwind.config.js`
- **新語法**: 使用 `@import "tailwindcss"` 替代傳統的 `@tailwind` 指令
- **內建 PostCSS**: 不需要額外的 PostCSS 配置
- **更快速**: 編譯速度和性能優化

> **重要**: Tailwind CSS v4 與 v3 不完全兼容，配置方式有重大變更。詳見 [Tailwind CSS v4 文檔](https://tailwindcss.com/docs)

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

目前版本使用雙模式數據存儲：

- **Electron 環境**: JSON 文件存儲在 `data/` 目錄
  - 開發環境: `data/` 目錄
  - 生產環境: 應用程式資源目錄

- **瀏覽器環境**: localStorage 存儲（用於開發測試）

數據包括：
- 密碼列表 (`passwords.json` 或 localStorage)
- 主密碼哈希 (`master.json` 或 localStorage)

### 未來計劃

- [ ] 實現 SQLite 數據庫支援
- [ ] 增強加密演算法（BCrypt）
- [ ] 數據遷移工具
- [ ] 數據備份與還原功能

## 安全特性

- 主密碼使用 Base64 編碼（當前版本，計劃升級為 BCrypt）
- 本地數據存儲，不會上傳到雲端
- Context Isolation 啟用
- Node Integration 禁用

> **安全注意**: 當前版本使用簡單的 Base64 編碼進行主密碼處理，僅適用於開發和測試環境。生產環境建議實現 BCrypt 或其他安全的雜湊演算法。

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

### 🎨 Tailwind CSS v4 開發須知

**配置文件**: 
- ❌ 不需要 `tailwind.config.js`
- ❌ 不需要 `postcss.config.js` 
- ✅ 只需在 `src/index.css` 中使用 `@import "tailwindcss"`

**安裝套件**:
```bash
npm install @tailwindcss/postcss autoprefixer
```

**CSS 語法變更**:
```css
/* ❌ Tailwind v3 語法 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ Tailwind v4 語法 */
@import "tailwindcss";
```

**Vite 配置**: 無需特殊配置，Vite 會自動處理 Tailwind v4。

### 開發版本限制

- 密碼加密使用簡單的 Base64 編碼（非安全）
- 數據存儲使用 JSON 文件而非 SQLite 數據庫
- 瀏覽器環境使用 localStorage（僅供測試）

### 生產版本規劃

- 實現 SQLite 數據庫存儲
- 使用 BCrypt 進行安全的密碼雜湊
- 添加數據加密和完整性驗證
- 實現安全的密鑰派生功能

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

## 故障排除

### 常見問題

1. **應用程式無法啟動**: 確認 Node.js 版本 >= 16
2. **依賴安裝失敗**: 嘗試刪除 `node_modules` 和重新安裝
3. **Electron 窗口空白**: 檢查開發服務器是否正在運行 (http://localhost:5173)
4. **Tailwind CSS 樣式未生效**: 
   - 確認使用 Tailwind CSS v4 語法 (`@import "tailwindcss"`)
   - 檢查 `src/index.css` 是否正確導入
   - 確認沒有多餘的 `tailwind.config.js` 或 `postcss.config.js` 文件
   - 重新啟動開發服務器

### 開發模式調試

按 `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (macOS) 開啟開發者工具。

## 許可證

本專案僅供學習和開發參考使用。
