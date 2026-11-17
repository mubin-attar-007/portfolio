import {
  Briefcase,
  ChartLine,
  ChartNoAxesColumn,
  Clock,
  Database,
  FileText,
  FolderSearch,
  Laptop,
  MessageCircle,
  MessagesSquare,
  Nfc,
  PenLine,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NavIconName } from "@/config/nav";

const ICONS: Record<NavIconName, LucideIcon> = {
  "folder-search": FolderSearch,
  nfc: Nfc,
  database: Database,
  chart: ChartLine,
  trophy: Trophy,
  messages: MessagesSquare,
  users: Users,
  file: FileText,
  clock: Clock,
  laptop: Laptop,
  shield: ShieldCheck,
  bars: ChartNoAxesColumn,
  pen: PenLine,
  chat: MessageCircle,
  briefcase: Briefcase,
  sparkles: Sparkles,
};

/**
 * NavIcon — a navigation icon by name (config/nav.ts keeps names, not
 * components, so it stays data). 16px line icons at a 1.6 stroke, the
 * prototype's weight. Decorative: the link's label carries the meaning.
 */
export function NavIcon({ name, size = 16, className }: { name: NavIconName; size?: number; className?: string }) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={1.6} aria-hidden className={className} />;
}
