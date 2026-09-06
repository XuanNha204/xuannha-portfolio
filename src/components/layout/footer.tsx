import { ArrowUpRight, ChevronRight } from "lucide-react";
import { getSiteSettings } from "@/services/settings.service";
import { getSocialLinks } from "@/services/profile.service";
import { resolveSiteContent } from "@/lib/site-content";

export async function Footer() {
  const [settings, socials] = await Promise.all([getSiteSettings(), getSocialLinks()]);
  const content = resolveSiteContent(settings.content);
  const links = socials.filter((link) => /^(https?:\/\/|mailto:)/i.test(link.url));
  return <footer className="editorial-footer" id="footer">
    <div className="footer-inner">
      <p className="footer-note">{content.footerNote}</p>
      <div className="footer-breadcrumb"><a href="#home" className="footer-mark" aria-label="Về đầu trang">Xnha.Dev</a><ChevronRight size={12} aria-hidden /><span>Không gian cá nhân</span></div>
      <div className="footer-columns">
        <div><h2>Khám phá</h2><a href="#home">Trang đầu</a><a href="#about">Giới thiệu</a><a href="#skills">Kỹ năng</a><a href="#work">Dự án & sản phẩm</a></div>
        <div><h2>Cùng làm việc</h2><a href="#contact">Liên hệ hợp tác</a>{content.contactEmail && <a href={`mailto:${content.contactEmail}`}>Gửi email <ArrowUpRight size={11} /></a>}<a href="#contact">Chia sẻ ý tưởng</a></div>
        <div><h2>Kết nối</h2>{links.length ? links.map((link) => <a key={link._id} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={11} aria-hidden /></a>) : <a href="#contact">Bắt đầu một cuộc trò chuyện</a>}<a href="#home">Trở về đầu trang ↑</a></div>
        <div className="footer-signoff"><h2>Mỗi ngày, một điều mới.</h2><p>Code. Khám phá.<br />Và một chút niềm vui.</p><span>Made with curiosity ↗</span></div>
      </div>
      <p className="footer-contact">Một lời chào có thể mở ra nhiều điều. <a href="#contact">Kết nối với Nhã.</a></p>
      <div className="footer-bottom"><span>Copyright © {new Date().getFullYear()} {settings.siteName}. Bảo lưu mọi quyền.</span><span>Việt Nam</span></div>
    </div>
  </footer>;
}
