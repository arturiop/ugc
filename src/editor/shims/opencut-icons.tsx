import {
    Blend,
    Captions,
    LayoutPanelTop,
    PanelsTopLeft,
    SlidersVertical,
    Video,
} from "lucide-react";

const iconProps = {
    strokeWidth: 1.8,
};

export function OcVideoIcon(props: React.ComponentProps<typeof Video>) {
    return <Video {...iconProps} {...props} />;
}

export function OcDataBuddyIcon(props: React.ComponentProps<typeof PanelsTopLeft>) {
    return <PanelsTopLeft {...iconProps} {...props} />;
}

export function OcMarbleIcon(props: React.ComponentProps<typeof LayoutPanelTop>) {
    return <LayoutPanelTop {...iconProps} {...props} />;
}

export function OcSlidersVerticalIcon(props: React.ComponentProps<typeof SlidersVertical>) {
    return <SlidersVertical {...iconProps} {...props} />;
}

export function OcSocialIcon(props: React.ComponentProps<typeof Captions>) {
    return <Captions {...iconProps} {...props} />;
}

export function OcTextHeightIcon(props: React.ComponentProps<typeof Captions>) {
    return <Captions {...iconProps} {...props} />;
}

export function OcTextWidthIcon(props: React.ComponentProps<typeof Captions>) {
    return <Captions {...iconProps} {...props} />;
}

export function OcCheckerboardIcon(props: React.ComponentProps<typeof Blend>) {
    return <Blend {...iconProps} {...props} />;
}
