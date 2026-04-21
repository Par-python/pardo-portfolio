import { ReactNode } from "react";

type WindowFrameProps = {
  title: string;
  className?: string;
  children?: ReactNode;
  statusText?: string;
};

export function WindowFrame({
  title,
  className = "",
  children,
  statusText,
}: WindowFrameProps) {
  return (
    <div
      className={`relative flex flex-col bg-[#c0c0c0] win-frame-outside p-[4px] gap-[4px] ${className}`}
    >
      <Titlebar title={title} />
      <div className="relative flex-1 min-h-0 bg-white win-frame-inside overflow-hidden p-[16px]">
        {children}
      </div>
      {statusText !== undefined && <Statusbar text={statusText} />}
    </div>
  );
}

function Titlebar({ title }: { title: string }) {
  return (
    <div className="bg-[#000080] flex items-center justify-between pl-[4px] pr-[2px] py-[2px] w-full">
      <div className="flex items-center gap-[4px] h-[16px]">
        <img src="/assets/folder.png" alt="" className="size-[16px]" />
        <span className="text-white text-[20px] leading-[13px] tracking-[0.4px] whitespace-nowrap">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-[2px]">
        <WindowButton icon="minimize" />
        <WindowButton icon="maximize" />
        <WindowButton icon="close" />
      </div>
    </div>
  );
}

function WindowButton({ icon }: { icon: "minimize" | "maximize" | "close" }) {
  return (
    <div className="relative size-[16px] bg-[#c0c0c0] win-frame-outside flex items-end justify-center p-[4px]">
      {icon === "minimize" && (
        <div className="w-full h-[2px] bg-black" />
      )}
      {icon === "maximize" && (
        <img
          src="/assets/maximize.png"
          alt=""
          className="size-[8px] absolute bottom-[2px] left-1/2 -translate-x-1/2"
        />
      )}
      {icon === "close" && (
        <img
          src="/assets/close.png"
          alt=""
          className="size-[8px] absolute bottom-[2px] left-1/2 -translate-x-1/2"
        />
      )}
    </div>
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
