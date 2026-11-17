export const BRAND_LOGO_URL = "https://res.cloudinary.com/dclr2ihxn/image/upload/v1794885338/VISTAR_Gradient_Orbit_Logo_kjolcb.png";

type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BRAND_LOGO_URL} alt="Vistar" className={`brand-logo ${className}`.trim()} />
  );
}
