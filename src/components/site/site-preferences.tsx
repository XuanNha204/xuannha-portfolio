"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SiteLanguage = "vi" | "en" | "zh";
export type SiteTheme = "light" | "dark";

type Dictionary = Record<string, string>;

const STORAGE_KEYS = {
  language: "xuannha.site.language",
  theme: "xuannha.site.theme",
};

const dictionaries: Record<SiteLanguage, Dictionary> = {
  vi: {
    "nav.home": "Trang chủ",
    "nav.about": "Giới thiệu",
    "nav.projects": "Dự án",
    "nav.blog": "Blog",
    "nav.contact": "Liên hệ",
    "nav.work": "Làm việc cùng tôi",
    "common.downloadCv": "Tải CV của tôi",
    "common.downloadCvShort": "Tải CV",
    "common.viewProjects": "Xem dự án",
    "common.website": "Xem website",
    "common.rss": "RSS",
    "hero.badge": "Vibe Coding Studio - AI-Assisted Development",
    "hero.greeting": "Xin chào, tôi là",
    "hero.fallbackHeadline":
      "Fullstack Developer - xây dựng sản phẩm web hiện đại với Next.js, MongoDB và AI.",
    "about.eyebrow": "// about me",
    "about.goalTitle": "Mục tiêu nghề nghiệp",
    "about.experience": "Kinh nghiệm",
    "about.education": "Học vấn",
    "about.certificates": "Chứng chỉ",
    "about.emptyExperience": "Chưa có dữ liệu kinh nghiệm.",
    "about.emptyEducation": "Chưa có dữ liệu học vấn.",
    "about.introFallback": "Thông tin giới thiệu sẽ được cập nhật qua CMS.",
    "contact.eyebrow": "// contact",
    "contact.title": "Liên hệ với tôi",
    "contact.description":
      "Có dự án cần xây dựng, cơ hội hợp tác hay đơn giản muốn trò chuyện về công nghệ? Gửi tin nhắn cho tôi bên dưới.",
    "contact.info": "Thông tin liên hệ",
    "contact.social": "Mạng xã hội",
    "footer.fallback":
      "xây dựng sản phẩm web hiện đại theo hướng AI-Assisted Development.",
    "footer.builtWith": "All rights reserved",
    "footer.explore": "Khám phá",
    "footer.connect": "Kết nối",
    "prefs.language": "Ngôn ngữ",
    "prefs.themeLight": "Sáng",
    "prefs.themeDark": "Tối",
    "chat.title": "Trợ lý AI",
    "chat.subtitle": "Hỏi về hồ sơ & dự án",
    "chat.greeting": "Xin chào! Mình có thể giúp gì cho bạn về portfolio này?",
    "chat.placeholder": "Nhập câu hỏi...",
    "chat.send": "Gửi",
    "chat.open": "Mở trợ lý AI",
    "chat.close": "Đóng",
    "chat.error": "Có lỗi xảy ra, vui lòng thử lại.",
    "chat.attach": "Thêm hình ảnh",
    "chat.mic": "Nói để nhập",
    "chat.listening": "Đang nghe...",
    "chat.readAloud": "Đọc to",
    "chat.stopAudio": "Dừng đọc",
    "chat.imageError": "Không đọc được ảnh, vui lòng thử ảnh khác.",
    "chat.describeImage": "Hãy mô tả nội dung hình ảnh này.",
    "chat.suggest1": "Có những dự án nào nổi bật?",
    "chat.suggest2": "Bạn có những kỹ năng gì?",
    "chat.suggest3": "Làm sao để liên hệ với bạn?",
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.work": "Work with me",
    "common.downloadCv": "Download my CV",
    "common.downloadCvShort": "Download CV",
    "common.viewProjects": "View projects",
    "common.website": "Visit website",
    "common.rss": "RSS",
    "hero.badge": "Vibe Coding Studio - AI-Assisted Development",
    "hero.greeting": "Hi, I'm",
    "hero.fallbackHeadline":
      "Fullstack Developer - building modern web products with Next.js, MongoDB, and AI.",
    "about.eyebrow": "// about me",
    "about.goalTitle": "Career goal",
    "about.experience": "Experience",
    "about.education": "Education",
    "about.certificates": "Certificates",
    "about.emptyExperience": "No experience data yet.",
    "about.emptyEducation": "No education data yet.",
    "about.introFallback": "Profile information will be updated through the CMS.",
    "contact.eyebrow": "// contact",
    "contact.title": "Contact me",
    "contact.description":
      "Have a project to build, a collaboration opportunity, or just want to talk about technology? Send me a message below.",
    "contact.info": "Contact information",
    "contact.social": "Social links",
    "footer.fallback": "building modern web products with AI-Assisted Development.",
    "footer.builtWith": "All rights reserved",
    "footer.explore": "Explore",
    "footer.connect": "Connect",
    "prefs.language": "Language",
    "prefs.themeLight": "Light",
    "prefs.themeDark": "Dark",
    "chat.title": "AI Assistant",
    "chat.subtitle": "Ask about the profile & projects",
    "chat.greeting": "Hi! How can I help you with this portfolio?",
    "chat.placeholder": "Type a message...",
    "chat.send": "Send",
    "chat.open": "Open AI assistant",
    "chat.close": "Close",
    "chat.error": "Something went wrong, please try again.",
    "chat.attach": "Attach image",
    "chat.mic": "Speak to type",
    "chat.listening": "Listening...",
    "chat.readAloud": "Read aloud",
    "chat.stopAudio": "Stop",
    "chat.imageError": "Couldn't read the image, please try another.",
    "chat.describeImage": "Please describe this image.",
    "chat.suggest1": "What are the featured projects?",
    "chat.suggest2": "What skills do you have?",
    "chat.suggest3": "How can I contact you?",
  },
  zh: {
    "nav.home": "首页",
    "nav.about": "关于",
    "nav.projects": "项目",
    "nav.blog": "博客",
    "nav.contact": "联系",
    "nav.work": "与我合作",
    "common.downloadCv": "下载我的简历",
    "common.downloadCvShort": "下载简历",
    "common.viewProjects": "查看项目",
    "common.website": "访问网站",
    "common.rss": "RSS",
    "hero.badge": "Vibe Coding Studio - AI 辅助开发",
    "hero.greeting": "你好，我是",
    "hero.fallbackHeadline":
      "全栈开发者 - 使用 Next.js、MongoDB 和 AI 构建现代 Web 产品。",
    "about.eyebrow": "// 关于我",
    "about.goalTitle": "职业目标",
    "about.experience": "经历",
    "about.education": "教育",
    "about.certificates": "证书",
    "about.emptyExperience": "暂无经历数据。",
    "about.emptyEducation": "暂无教育数据。",
    "about.introFallback": "个人资料将通过 CMS 更新。",
    "contact.eyebrow": "// 联系",
    "contact.title": "联系我",
    "contact.description":
      "如果你有项目、合作机会，或只是想聊聊技术，请在下方给我留言。",
    "contact.info": "联系信息",
    "contact.social": "社交链接",
    "footer.fallback": "以 AI 辅助开发方式构建现代 Web 产品。",
    "footer.builtWith": "All rights reserved",
    "footer.explore": "探索",
    "footer.connect": "连接",
    "prefs.language": "语言",
    "prefs.themeLight": "亮色",
    "prefs.themeDark": "暗色",
    "chat.title": "AI 助手",
    "chat.subtitle": "询问关于个人资料和项目",
    "chat.greeting": "你好！关于这个作品集我能帮你什么？",
    "chat.placeholder": "输入消息...",
    "chat.send": "发送",
    "chat.open": "打开 AI 助手",
    "chat.close": "关闭",
    "chat.error": "出错了，请重试。",
    "chat.attach": "添加图片",
    "chat.mic": "语音输入",
    "chat.listening": "正在聆听...",
    "chat.readAloud": "朗读",
    "chat.stopAudio": "停止",
    "chat.imageError": "无法读取图片，请换一张。",
    "chat.describeImage": "请描述这张图片的内容。",
    "chat.suggest1": "有哪些代表性项目？",
    "chat.suggest2": "你有哪些技能？",
    "chat.suggest3": "如何联系你？",
  },
};

type SitePreferencesContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  t: (key: string, fallback?: string) => string;
};

const SitePreferencesContext = createContext<SitePreferencesContextValue | null>(null);

export function SitePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("vi");
  const [theme, setThemeState] = useState<SiteTheme>("light");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);
    const savedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);

    if (savedLanguage === "vi" || savedLanguage === "en" || savedLanguage === "zh") {
      setLanguageState(savedLanguage);
    }
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.siteTheme = theme;
    return () => {
      delete document.documentElement.dataset.siteTheme;
    };
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
  }, [language]);

  const value = useMemo<SitePreferencesContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem(STORAGE_KEYS.language, nextLanguage);
      },
      theme,
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
      },
      t: (key, fallback) => dictionaries[language][key] ?? fallback ?? key,
    }),
    [language, theme]
  );

  return <SitePreferencesContext.Provider value={value}>{children}</SitePreferencesContext.Provider>;
}

export function useSitePreferences() {
  const context = useContext(SitePreferencesContext);
  if (!context) throw new Error("useSitePreferences must be used inside SitePreferencesProvider");
  return context;
}

export function T({ k, fallback }: { k: string; fallback?: string }) {
  const { t } = useSitePreferences();
  return <>{t(k, fallback)}</>;
}
