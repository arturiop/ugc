import type { CSSProperties, ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    src: string;
    alt: string;
    fill?: boolean;
    unoptimized?: boolean;
};

export default function Image({ fill = false, style, unoptimized: _unoptimized, ...props }: ImageProps) {
    const mergedStyle: CSSProperties | undefined = fill
        ? {
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: style?.objectFit ?? "cover",
              position: "absolute",
              ...style,
          }
        : style;

    return <img {...props} style={mergedStyle} />;
}
