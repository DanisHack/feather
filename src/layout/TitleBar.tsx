import { FeatherLogo } from '../components/FeatherLogo';

export function TitleBar() {
  return (
    <div className="h-12 flex items-center justify-center draggable select-none shrink-0">
      {/* Traffic light buttons are handled natively by titleBarStyle: 'hiddenInset' */}
      {/* This area is draggable for window movement */}
      <FeatherLogo size={18} textSize={12} />
    </div>
  );
}
