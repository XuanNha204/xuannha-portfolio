import {
  Github,
  Linkedin,
  Facebook,
  Mail,
  MessageCircle,
  Twitter,
  Youtube,
  Instagram,
  Globe,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  email: Mail,
  mail: Mail,
  zalo: MessageCircle,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  instagram: Instagram,
};

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = ICONS[platform.toLowerCase()] ?? Globe;
  return <Icon className={className} />;
}
