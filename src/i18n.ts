import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// 翻譯資源將會放在 public/locales/{lng}/{namespace}.json
// 例如：public/locales/en/translation.json
//      public/locales/zh-TW/translation.json

i18n
  .use(LanguageDetector) // 自動偵測瀏覽器語言
  .use(initReactI18next) // 將 i18n 實例傳遞給 react-i18next
  .use(HttpApi) // 使用 HTTP 後端載入翻譯
  .init({
    fallbackLng: 'en', // 如果偵測不到語言或翻譯缺失，則使用英文
    debug: process.env.NODE_ENV === 'development', // 開發模式下啟用 debug
    interpolation: {
      escapeValue: false, // react 已經會處理 XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 指定翻譯文件的路徑
    },
    // resources 物件已被移除，因為翻譯將從外部文件載入
  });

export default i18n;