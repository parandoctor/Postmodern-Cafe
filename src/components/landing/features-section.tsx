import { BookOpen, Image, Wrench, ArrowUpRight } from "lucide-react";

const items = [
  {
    index: "01",
    title: "笔记管理",
    icon: BookOpen,
    description: "用 Markdown 写下想法，自动保存；图片、视频和文档也收在同一个安静的抽屉里。",
    detail: "写下来，留下来",
  },
  {
    index: "02",
    title: "美学空间",
    icon: Image,
    description: "播放自己的音乐，或直接在浏览器里裁剪、调色、加文字与图层，完成一张图片。",
    detail: "听一点，做一点",
  },
  {
    index: "03",
    title: "实用工具",
    icon: Wrench,
    description: "一个可以跨页面持续的倒计时，和一张不打扰你的月历。",
    detail: "给时间一个位置",
  },
];

export function FeaturesSection() {
  return (
    <>
      <section id="features" className="border-t border-[#ececec] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.24em] text-[#999]">THREE SPACES</p>
              <h2 className="mt-4 font-editorial text-[32px] tracking-[-0.02em] sm:text-[40px]">只保留真正会用的三个空间</h2>
            </div>
            <span className="hidden text-[12px] text-[#aaa] sm:block">少一点，反而更清楚</span>
          </div>

          <div className="border-t border-[#dedede]">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="group grid gap-5 border-b border-[#dedede] py-8 sm:grid-cols-[64px_1fr_auto] sm:items-center sm:gap-8">
                  <span className="text-[12px] tabular-nums text-[#aaa]">{item.index}</span>
                  <div className="flex items-start gap-5">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-[#dedede] text-[#555] transition-colors group-hover:border-black group-hover:text-black">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="text-[20px] font-medium">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#707070]">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#999] sm:justify-end">
                    {item.detail}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 border-t border-[#ececec] pt-16 md:grid-cols-[220px_1fr]">
          <p className="text-[11px] tracking-[0.24em] text-[#999]">ABOUT</p>
          <div>
            <h2 className="font-editorial text-[30px] leading-snug tracking-[-0.02em] sm:text-[36px]">
              不是更多的功能，
              <br />
              而是更少的打扰。
            </h2>
            <p className="mt-6 max-w-2xl text-[14px] leading-7 text-[#707070]">
              后现代咖啡馆从一个文件管理工具，回到更朴素的目标：把日常里值得留下的东西放在一起，并且让它们看起来安静、清楚、可以长久使用。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
