export function WatchableLogoText() {
  return (
    <div
      className="!text-[32px] md:!text-[32px]"
      style={{
        fontFamily: 'Inter, "SF Pro Display", "Segoe UI", Arial, sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          backgroundImage: 'linear-gradient(0deg,rgba(252, 252, 252, 1) 0%, rgba(135, 135, 135, 1) 22%, rgba(9, 9, 10, 1) 40%, rgba(11, 13, 18, 1) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        Watch
      </span>
      <span
        style={{
          backgroundImage: 'linear-gradient(0deg, rgba(252, 252, 252, 1) 0%, rgba(232, 232, 255, 1) 2%, rgba(172, 173, 252, 1) 10%,rgba(91, 97, 255, 1) 50%, rgba(91, 97, 255, 1) 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        able
      </span>
      <span style={{ fontSize: '38px', marginLeft: '0.015em', color: '#FF6A1A' }}>
        .
      </span>
    </div>
  );
}