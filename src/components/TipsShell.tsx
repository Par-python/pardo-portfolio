"use client";

import { TipsModal, useTipsFirstVisit } from "./TipsModal";

export function TipsShell() {
  const { open, close, openManually } = useTipsFirstVisit(4000);

  return (
    <>
      <button
        type="button"
        onClick={openManually}
        aria-label="Show tips"
        title="Show tips"
        className="fixed bottom-3 right-3 sm:top-3 sm:right-auto sm:left-3 sm:bottom-auto z-40 size-[48px] sm:size-[40px] bg-[#c0c0c0] win-frame-outside flex items-center justify-center cursor-pointer hover:bg-[#d4d4d4]"
      >
        <span className="text-[#000080] text-[20px] sm:text-[24px] font-bold leading-none">
          ?
        </span>
      </button>
      <TipsModal open={open} onClose={close} />
    </>
  );
}
