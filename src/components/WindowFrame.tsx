import { ReactNode } from "react";

type WindowFrameProps = {
  title: string;
  className?: string;
  children?: ReactNode;
  statusText?: string;
  titleBarColor?: string;
  bodyColor?: string;
  onClose?: () => void;
};

export function WindowFrame({
  title,
  className = "",
  children,
  statusText,
  titleBarColor = "#000080",
  bodyColor = "#ffffff",
  onClose,
}: WindowFrameProps) {
  return (
    <div
      className={`relative flex flex-col bg-[#c0c0c0] win-frame-outside p-[4px] gap-[4px] ${className}`}
    >
      <Titlebar title={title} color={titleBarColor} onClose={onClose} />
      <div
        className="relative flex-1 min-h-0 win-frame-inside overflow-hidden p-[16px]"
        style={{ backgroundColor: bodyColor }}
      >
        {children}
      </div>
      {statusText !== undefined && <Statusbar text={statusText} />}
    </div>
  );
}

function Titlebar({
  title,
  color,
  onClose,
}: {
  title: string;
  color: string;
  onClose?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between pl-[4px] pr-[2px] py-[2px] w-full"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-[4px] h-[16px]">
        <img src="/assets/folder.png" alt="" className="size-[16px]" />
        <span className="text-white text-[20px] leading-[13px] tracking-[0.4px] whitespace-nowrap">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-[2px] sm:gap-[2px]">
        <WindowButton icon="minimize" />
        <WindowButton icon="maximize" />
        <WindowButton icon="close" onClick={onClose} />
      </div>
    </div>
  );
}

function WindowButton({
  icon,
  onClick,
}: {
  icon: "minimize" | "maximize" | "close";
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="relative size-[28px] sm:size-[16px] bg-[#c0c0c0] win-frame-outside flex items-center justify-center cursor-pointer"
    >
      {icon === "minimize" && (
        <div className="absolute bottom-[6px] sm:bottom-[3px] left-1/2 -translate-x-1/2 w-[10px] sm:w-[6px] h-[3px] sm:h-[2px] bg-black" />
      )}
      {icon === "maximize" && (
        <div className="absolute top-[6px] sm:top-[3px] left-1/2 -translate-x-1/2 size-[14px] sm:size-[8px] border border-black border-t-2" />
      )}
      {icon === "close" && (
        <span className="text-black text-[18px] sm:text-[10px] leading-none font-bold font-mono">
          ×
        </span>
      )}
    </Tag>
  );
}

function Statusbar({ text }: { text: string }) {
  return (
    <div className="relative h-[18px] w-full bg-[#c0c0c0] win-frame-outside">
      <p className="absolute left-[4px] right-[16px] top-1/2 -translate-y-1/2 text-[11px] text-black leading-[10px]">
        {text}
      </p>
      <img
        src="/assets/dragsize.png"
        alt=""
        className="absolute bottom-0 right-0 size-[13px]"
      />
    </div>
  );
}
