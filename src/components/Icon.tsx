import eva from "eva-icons";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 20, color = "currentColor", className }: IconProps) {
  const icon = (eva.icons as Record<string, { contents: string } | undefined>)[name];
  if (!icon) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.contents }}
    />
  );
}
