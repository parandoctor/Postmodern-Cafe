import { MotionButton } from "@/components/ui/motion-button";
import { Reveal, RevealLines } from "@/components/landing/reveal";

const modules = ["笔记管理", "美学空间", "实用工具"];

export function Hero() {
  return (
    <section className="flex min-h-screen items-center px-5 pb-16 pt-28 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal trigger="mount">
            <p className="mb-7 text-[11px] tracking-[0.24em] text-[#999]">A QUIET DIGITAL SPACE</p>
          </Reveal>
          <h1 className="font-editorial text-[44px] leading-[1.16] tracking-[-0.03em] sm:text-[64px] lg:text-[76px]">
            <RevealLines lines={["把记录，", "放在安静的地方。"]} trigger="mount" delay={0.08} stagger={0.14} />
          </h1>
          <Reveal trigger="mount" delay={0.28}>
            <p className="mx-auto mt-7 max-w-xl text-[14px] leading-7 text-[#6f6f6f] sm:text-[15px]">
              后现代咖啡馆是一个只属于你的数字空间：写笔记、整理文件、听音乐、处理图片，也为一件事留出时间。
            </p>
          </Reveal>
          <Reveal trigger="mount" delay={0.4}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MotionButton href="/register" variant="primary" size="lg" floating arrow className="w-full sm:w-auto">开始使用</MotionButton>
              <MotionButton href="#features" variant="secondary" size="lg" className="w-full sm:w-auto">了解三个空间</MotionButton>
            </div>
          </Reveal>
        </div>

        <Reveal trigger="mount" delay={0.58}>
          <div className="mx-auto mt-20 max-w-3xl">
            <div className="relative flex items-center justify-between">
              <span className="absolute left-[12%] right-[12%] top-1/2 h-px bg-[#dcdcdc]" />
              {modules.map((label, index) => (
                <div key={label} className="group relative z-10 flex flex-1 flex-col items-center gap-3 bg-white px-2">
                  <span className="flex h-8 w-8 -translate-y-0 items-center justify-center rounded-full border border-[#d5d5d5] bg-white text-[10px] tabular-nums text-[#888] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-black group-hover:text-black">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[12px] text-[#444] transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-[13px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
