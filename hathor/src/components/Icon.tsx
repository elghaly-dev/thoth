import {
  Wheat, FlaskConical, Cylinder, Sprout, BrickWall, Flower2, Package, Recycle, Disc3, Flame, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = { Wheat, FlaskConical, Cylinder, Sprout, BrickWall, Flower2, Package, Recycle, Disc3, Flame };

export function NamedIcon({ name, className, strokeWidth = 1.5 }: { name: string; className?: string; strokeWidth?: number }) {
  const I = MAP[name] ?? Package;
  return <I className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
