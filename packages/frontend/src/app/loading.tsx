export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <div className="relative">
        {/* 外圈旋转动画 */}
        <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>

        {/* 内圈反向旋转动画 */}
        <div className="absolute top-2 left-2 w-16 h-16 border-4 border-secondary/30 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-b-secondary rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
        </div>

        {/* 中心脉冲点 */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full animate-pulse"></div>

        {/* 环绕的小点动画 */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/60 rounded-full animate-ping"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-12px)`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2s"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
