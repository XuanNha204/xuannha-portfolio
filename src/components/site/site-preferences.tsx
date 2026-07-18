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
    "about.present": "Hiện tại",
    "about.certificatesDesc": "Các chứng chỉ và khóa học tôi đã hoàn thành.",
    "about.viewCertificate": "Xem chứng chỉ",
    "projects.title": "Dự án của tôi",
    "projects.countSuffix": "dự án — kéo ngang hoặc dùng nút điều hướng để khám phá.",
    "projects.emptyLead": "Danh sách dự án sẽ sớm được cập nhật.",
    "projects.emptyTitle": "Chưa có dự án nào được công bố",
    "projects.emptyDesc": "Quay lại sau nhé — các dự án đang được hoàn thiện.",
    "projects.all": "Tất cả dự án",
    "blog.description": "Kiến thức, kinh nghiệm và góc nhìn về phát triển phần mềm hiện đại.",
    "blog.searchPlaceholder": "Tìm kiếm bài viết…",
    "blog.all": "Tất cả",
    "blog.emptyTitle": "Chưa có bài viết nào",
    "blog.notFoundPrefix": "Không tìm thấy bài viết cho",
    "blog.emptyDesc": "Thử từ khóa khác hoặc quay lại sau nhé.",
    "contact.eyebrow": "// contact",
    "contact.title": "Liên hệ với tôi",
    "contact.description":
      "Có dự án cần xây dựng, cơ hội hợp tác hay đơn giản muốn trò chuyện về công nghệ? Gửi tin nhắn cho tôi bên dưới.",
    "contact.info": "Thông tin liên hệ",
    "contact.social": "Mạng xã hội",
    "contact.formName": "Họ tên",
    "contact.formNamePlaceholder": "Nguyễn Văn A",
    "contact.formEmail": "Email",
    "contact.formEmailPlaceholder": "ban@email.com",
    "contact.formSubject": "Tiêu đề",
    "contact.formSubjectPlaceholder": "Về dự án…",
    "contact.formContent": "Nội dung",
    "contact.formContentPlaceholder": "Chào bạn, mình muốn trao đổi về…",
    "contact.formSubmit": "Gửi tin nhắn",
    "contact.success": "Đã gửi tin nhắn! Tôi sẽ phản hồi sớm nhất có thể.",
    "contact.fail": "Gửi tin nhắn thất bại, vui lòng thử lại.",
    "contact.network": "Không gửi được tin nhắn — kiểm tra kết nối mạng rồi thử lại.",
    "contact.errName": "Tên tối thiểu 2 ký tự",
    "contact.errEmail": "Email không hợp lệ",
    "contact.errContent": "Nội dung tối thiểu 10 ký tự",
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
    "chat.thinking": "Trợ lý đang trả lời...",
    "chat.timeout": "Phản hồi đang mất nhiều thời gian hơn bình thường, vui lòng thử lại.",
    "chat.micDenied": "Không truy cập được micro — hãy cấp quyền trong cài đặt trình duyệt.",
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
    "about.present": "Present",
    "about.certificatesDesc": "Certificates and courses I have completed.",
    "about.viewCertificate": "View certificate",
    "projects.title": "My projects",
    "projects.countSuffix": "projects — swipe or use the arrows to explore.",
    "projects.emptyLead": "The project list will be updated soon.",
    "projects.emptyTitle": "No projects published yet",
    "projects.emptyDesc": "Check back soon — projects are being polished.",
    "projects.all": "All projects",
    "blog.description": "Knowledge, experience and perspectives on modern software development.",
    "blog.searchPlaceholder": "Search posts…",
    "blog.all": "All",
    "blog.emptyTitle": "No posts yet",
    "blog.notFoundPrefix": "No posts found for",
    "blog.emptyDesc": "Try another keyword or come back later.",
    "contact.eyebrow": "// contact",
    "contact.title": "Contact me",
    "contact.description":
      "Have a project to build, a collaboration opportunity, or just want to talk about technology? Send me a message below.",
    "contact.info": "Contact information",
    "contact.social": "Social links",
    "contact.formName": "Full name",
    "contact.formNamePlaceholder": "John Doe",
    "contact.formEmail": "Email",
    "contact.formEmailPlaceholder": "you@email.com",
    "contact.formSubject": "Subject",
    "contact.formSubjectPlaceholder": "About a project…",
    "contact.formContent": "Message",
    "contact.formContentPlaceholder": "Hi, I'd like to talk about…",
    "contact.formSubmit": "Send message",
    "contact.success": "Message sent! I'll get back to you as soon as possible.",
    "contact.fail": "Failed to send the message, please try again.",
    "contact.network": "Couldn't send the message — check your connection and try again.",
    "contact.errName": "Name must be at least 2 characters",
    "contact.errEmail": "Invalid email address",
    "contact.errContent": "Message must be at least 10 characters",
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
    "chat.thinking": "Assistant is replying...",
    "chat.timeout": "The response is taking longer than usual, please try again.",
    "chat.micDenied": "Microphone access was denied — please allow it in your browser settings.",
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
    "about.present": "至今",
    "about.certificatesDesc": "我完成的证书与课程。",
    "about.viewCertificate": "查看证书",
    "projects.title": "我的项目",
    "projects.countSuffix": "个项目——横向滑动或使用导航按钮探索。",
    "projects.emptyLead": "项目列表即将更新。",
    "projects.emptyTitle": "暂无公开项目",
    "projects.emptyDesc": "敬请期待——项目正在完善中。",
    "projects.all": "全部项目",
    "blog.description": "关于现代软件开发的知识、经验与观点。",
    "blog.searchPlaceholder": "搜索文章…",
    "blog.all": "全部",
    "blog.emptyTitle": "暂无文章",
    "blog.notFoundPrefix": "未找到相关文章：",
    "blog.emptyDesc": "换个关键词或稍后再来。",
    "contact.eyebrow": "// 联系",
    "contact.title": "联系我",
    "contact.description":
      "如果你有项目、合作机会，或只是想聊聊技术，请在下方给我留言。",
    "contact.info": "联系信息",
    "contact.social": "社交链接",
    "contact.formName": "姓名",
    "contact.formNamePlaceholder": "张三",
    "contact.formEmail": "邮箱",
    "contact.formEmailPlaceholder": "you@email.com",
    "contact.formSubject": "主题",
    "contact.formSubjectPlaceholder": "关于项目…",
    "contact.formContent": "内容",
    "contact.formContentPlaceholder": "你好，我想聊聊…",
    "contact.formSubmit": "发送消息",
    "contact.success": "消息已发送！我会尽快回复。",
    "contact.fail": "发送失败，请重试。",
    "contact.network": "无法发送——请检查网络后重试。",
    "contact.errName": "姓名至少 2 个字符",
    "contact.errEmail": "邮箱格式不正确",
    "contact.errContent": "内容至少 10 个字符",
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
    "chat.thinking": "助手正在回复...",
    "chat.timeout": "响应时间比平时长，请重试。",
    "chat.micDenied": "无法访问麦克风——请在浏览器设置中允许。",
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
  // Dark mode first — light is an explicit opt-in persisted in localStorage.
  const [theme, setThemeState] = useState<SiteTheme>("dark");

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
