"use client";

import { useLiveContent } from "@/lib/useLiveContent";
import { useDraggableWindow } from "@/lib/useDraggableWindow";
import { WindowFrame } from "./WindowFrame";

type ContactsContent = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
};

const CONTACTS_FALLBACK: ContactsContent = {
  email: "pardojeromeimportant@gmail.com",
  phone: "+639695666410",
  linkedin: "https://www.linkedin.com/in/john-jerome-pardo-24b5bb311/",
  github: "https://github.com/Par-python",
};

type ContactsModalProps = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
};

export function ContactsModal({
  open,
  onClose,
  zIndex = 40,
  onFocus,
}: ContactsModalProps) {
  const contacts = useLiveContent<ContactsContent>("contacts", CONTACTS_FALLBACK);
  const { pos, windowRef, onTitlePointerDown } = useDraggableWindow({ open });

  if (!open) return null;

  return (
    <div
      ref={windowRef}
      onPointerDownCapture={onFocus}
      className="fixed w-[min(675px,92vw)]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div
        onPointerDown={onTitlePointerDown}
        className="cursor-move touch-none"
        style={{ touchAction: "none" }}
      >
        <WindowFrame
          title="CONTACTS"
          titleBarColor="#26903d"
          bodyColor="#f2feff"
          statusText="3 object(s)"
          onClose={onClose}
          className="max-h-[85vh] sm:h-[320px]"
        >
          <div
            className="cursor-default h-full overflow-y-auto break-words"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header row: CONTACTS + connect link */}
            <div className="flex items-end justify-between flex-wrap gap-2">
              <p className="text-[#26903d] text-[28px] sm:text-[40px] tracking-[0.8px] leading-none">
                CONTACTS
              </p>
              <a
                href={contacts.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-vt323 text-[#26903d] text-[16px] sm:text-[20px] tracking-[0.32px] underline leading-[18px] sm:leading-[20px]"
              >
                connect with me :)
              </a>
            </div>

            {/* Dotted divider */}
            <div
              className="mt-2 sm:mt-3 h-[2px] w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, #26903d 0 8px, transparent 8px 14px)",
              }}
            />

            {/* Info */}
            <div className="mt-4 sm:mt-6 font-vt323 text-[16px] sm:text-[22px] tracking-[0.4px] leading-[20px] sm:leading-[28px]">
              <p className="break-all">
                <span className="font-bold">email: </span>
                <a
                  href={`mailto:${contacts.email}`}
                  className="hover:underline"
                >
                  {contacts.email}
                </a>
              </p>
              <p>
                <span className="font-bold">phone no: </span>
                <span>{contacts.phone}</span>
              </p>
            </div>

            {/* Socials */}
            <div className="mt-3 sm:mt-5">
              <p className="font-vt323 font-bold text-[16px] sm:text-[22px] tracking-[0.4px]">socials:</p>
              <div className="mt-2 flex gap-3 sm:gap-4 items-center">
                <a
                  href={contacts.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block size-[44px] sm:size-[32px] hover:opacity-80"
                >
                  <img
                    src="/assets/linkedin-pixel.svg"
                    alt="LinkedIn"
                    className="w-full h-full object-contain [image-rendering:pixelated]"
                  />
                </a>
                <a
                  href={contacts.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block size-[44px] sm:size-[32px] hover:opacity-80"
                >
                  <img
                    src="/assets/github-pixel.svg"
                    alt="GitHub"
                    className="w-full h-full object-contain [image-rendering:pixelated]"
                  />
                </a>
                <a
                  href={`mailto:${contacts.email}`}
                  className="block size-[44px] sm:size-[32px] hover:opacity-80"
                >
                  <img
                    src="/assets/email-pixel.svg"
                    alt="Email"
                    className="w-full h-full object-contain [image-rendering:pixelated]"
                  />
                </a>
              </div>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
