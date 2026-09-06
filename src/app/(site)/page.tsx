import Image from "next/image";
import { ArrowDown, ArrowUpRight, Asterisk, Braces, Download, FileText, Github, Layers3, Sparkles } from "lucide-react";
import { getProfile } from "@/services/profile.service";
import { getSiteSettings } from "@/services/settings.service";
import { resolveSiteContent } from "@/lib/site-content";
import { AmbientVideo } from "@/features/landing/ambient-video";
import { ScrollExperience } from "@/features/landing/scroll-experience";
import { ContactForm } from "@/features/contact/contact-form";
import { ChatWidget } from "@/features/chat/chat-widget";

export const revalidate = 60;
export default async function HomePage() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  const content = resolveSiteContent(settings.content);
  const icons = [Braces, Layers3, Sparkles];
  return <>
    <ScrollExperience />
    <section id="home" className="hero-track" aria-label="Mở đầu">
      <div className="hero-scene">
        <AmbientVideo src={content.heroVideo} poster={content.heroPoster} />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-eyebrow"><span />{content.heroEyebrow}</p>
          <h1>{content.homeTitle}</h1>
          <p className="hero-description">{content.homeDescription}</p>
          <a href="#about" className="hero-link">Khám phá câu chuyện <ArrowUpRight size={18} aria-hidden /></a>
        </div>
        <div className="hero-bottom"><a href="#about"><span className="scroll-cue"><ArrowDown size={14} aria-hidden /></span>Cuộn để khám phá</a><span className="hero-edition">PORTFOLIO / {new Date().getFullYear()}</span></div>
      </div>
    </section>

    <section id="about" className="about-section">
      <div className="section-container">
        <div className="section-meta" data-reveal><span>01 / VỀ MÌNH</span><Asterisk size={22} aria-hidden /></div>
        <h2 className="about-statement">{content.aboutTitle}</h2>
        <div className="about-grid">
          <div className="portrait-stage" data-reveal>
            <div className="portrait-halo" aria-hidden />
            <span className="portrait-orbit" aria-hidden />
            <Image src={profile.avatar || "/media/portrait.png"} alt={profile.name} width={868} height={1157} sizes="(max-width: 767px) 70vw, 300px" unoptimized={!!profile.avatar && !profile.avatar.startsWith("/") && !/^https:\/\/(images\.unsplash\.com|avatars\.githubusercontent\.com)\//.test(profile.avatar)} className="about-portrait" />
          </div>
          <div className="about-copy" data-reveal>
            <span className="small-label">RẤT VUI ĐƯỢC GẶP BẠN</span>
            <h3>{profile.name || "Huỳnh Xuân Nhã"}<span>.</span></h3>
            <p className="about-role">{profile.headline}</p>
            <p className="about-description">{profile.about}</p>
            <div className="about-note"><span aria-hidden>↗</span><p>{content.aboutNote}</p></div>
            <a className="text-link" href="#contact">Kể mình nghe ý tưởng của bạn <ArrowUpRight size={18} aria-hidden /></a>
            {profile.resumeUrl && <a className="about-cv" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
              <span className="about-cv-icon"><FileText size={23} strokeWidth={1.5} aria-hidden /></span>
              <span className="about-cv-copy"><strong>CV của mình</strong><span>Tìm hiểu thêm về chuyên môn & kinh nghiệm</span></span>
              <span className="about-cv-action">Tải CV <Download size={17} aria-hidden /></span>
            </a>}
          </div>
        </div>
      </div>
    </section>

    <section id="skills" className="skills-section">
      <div className="section-container skills-layout">
        <div className="skills-intro">
          <p className="small-label" data-reveal>02 / KỸ NĂNG & KHÁM PHÁ</p>
          <h2 data-reveal>{content.skillsTitle}</h2>
          <p data-reveal>{content.skillsDescription}</p>
          <div className="skills-orbit" aria-hidden><span>+</span><i /><i /><i /></div>
          <span className="skills-caption">HỌC. THỬ. TẠO NÊN.</span>
        </div>
        <div className="skills-stack">
          {content.skills.map((skill, index) => {
            const Icon = icons[index % icons.length];
            return <article key={index} className={`skill-card skill-card-${index % 3}`} style={{ top: `calc(110px + ${index * 18}px)` }}>
              <div className="skill-card-top"><span>{skill.symbol || String(index + 1).padStart(2, "0")}</span><Icon size={32} strokeWidth={1.3} aria-hidden /></div>
              <span className="skill-category">{skill.category}</span>
              <h3>{skill.title}</h3>
              <p>{skill.description}</p>
              <div className="skill-tools">{skill.tools.split("·").map((tool) => <span key={tool}>{tool.trim()}</span>)}</div>
            </article>;
          })}
        </div>
      </div>
    </section>

    <section id="work" className="work-section" aria-labelledby="work-title">
      <div className="section-container">
        <div className="section-meta" data-reveal><span>03 / DỰ ÁN & SẢN PHẨM</span><Github size={22} aria-hidden /></div>
        <a className="work-card" href={content.projectsUrl} target="_blank" rel="noopener noreferrer" data-reveal>
          <div className="work-copy"><span className="small-label">TỪ NHỮNG DÒNG CODE</span><h2 id="work-title">{content.projectsTitle}</h2><p>{content.projectsDescription}</p><span className="work-cta">Xem sản phẩm trên GitHub <ArrowUpRight size={20} aria-hidden /></span></div>
          <div className="work-art" aria-hidden><span className="work-art-orbit" /><span className="work-art-code">&lt;/&gt;</span><span className="work-art-label"><Github size={18} /> BUILT BY XNHA.DEV</span></div>
        </a>
      </div>
    </section>

    <section id="contact" className="contact-section">
      <div className="section-container">
        <div className="section-meta" data-reveal><span>04 / CÙNG TẠO ĐIỀU MỚI</span><span className="availability"><i />{content.availability}</span></div>
        <div className="contact-layout">
          <div className="contact-copy" data-reveal><h2>{content.contactTitle}</h2><p>{content.contactDescription}</p>
            {content.contactEmail && <a className="contact-email" href={`mailto:${content.contactEmail}`}>{content.contactEmail}<ArrowUpRight size={22} aria-hidden /></a>}
            <span className="contact-doodle" aria-hidden>↗</span>
          </div>
          <div className="contact-form-card" data-reveal><div className="form-heading"><span>Gửi một lời nhắn</span><ArrowUpRight size={21} aria-hidden /></div><ContactForm /></div>
        </div>
      </div>
    </section>
    {content.chatbotEnabled && <ChatWidget name={content.chatbotName} greeting={content.chatbotGreeting} />}
  </>;
}
