import React from "react";

export const GOOGLE_LOGO_URL = "https://res.cloudinary.com/dclr2ihxn/image/upload/v1794734384/01085b9e-b358-4913-9ac9-83474cad62ce.png";
export const WHATSAPP_LOGO_URL = "https://res.cloudinary.com/dclr2ihxn/image/upload/v1794734440/d7dc4f13-818b-4ec4-85d5-9a46944e928e.png";
export const INSTAGRAM_LOGO_URL = "https://res.cloudinary.com/dclr2ihxn/image/upload/v1794734491/294f6839-97b3-483f-ba1c-600365a9f3cf.png";

type GoogleLogoProps = {
  size?: number;
  className?: string;
};

export default function GoogleLogo({ size = 20, className }: GoogleLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={GOOGLE_LOGO_URL}
      alt="Google"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain", flexShrink: 0 }}
    />
  );
}

export function WhatsAppLogo({ size = 20, className }: GoogleLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={WHATSAPP_LOGO_URL}
      alt="WhatsApp"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain", flexShrink: 0 }}
    />
  );
}

export function InstagramLogo({ size = 20, className }: GoogleLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={INSTAGRAM_LOGO_URL}
      alt="Instagram"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain", flexShrink: 0 }}
    />
  );
}
