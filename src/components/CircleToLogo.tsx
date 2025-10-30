"use client";
import { motion, animate, useAnimation } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { interpolate } from "flubber";

// 円
const CIRCLE_D =
  "M256 64 A192 192 0 1 0 256 448 A192 192 0 1 0 256 64 Z";

// ロゴ
const LOGO_D =
  "M 0,0 128,128 0,256 256,512 H 512 L 256,256 512,0 H 256 Z";

/** 上部に寄せたときの余白(px) */
const TOP_PX = 24;

export default function CircleToLogoThenTextMoveTop() {
  const [d, setD] = useState(CIRCLE_D);

  const stageCtrl = useAnimation();
  const groupCtrl = useAnimation();
  const textCtrl  = useAnimation();

  const textRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const GAP_PX = 24;

  useLayoutEffect(() => {
    const w = textRef.current?.offsetWidth ?? 0;
    const offset = (w + GAP_PX) / 2;

    // 初期：ロゴだけ中央に見せるため、横方向に右へ寄せて開始
    groupCtrl.set({ x: offset });

    // 初期：テキストはその場で透明（幅は確保される）
    textCtrl.set({ opacity: 0 });

    // 縦方向は中央(= y:0) で開始
    stageCtrl.set({ y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 円 → ロゴ
    const interp = interpolate(CIRCLE_D, LOGO_D, { maxSegmentLength: 3 });
    const morph = animate(0, 1, {
      duration: 1.2,
      ease: "easeInOut",
      delay: 0.2,
      onUpdate: (t) => setD(interp(t)),
      onComplete: async () => {
        // ロゴを左へ
        await groupCtrl.start({
          x: 0,
          transition: {
            duration: 1.4,
            ease: [0.42, 0.0, 0.25, 1],
            delay: 0.05,
          },
        });

        // テキストをその場でフェードイン
        await textCtrl.start({
          opacity: 1,
          transition: { duration: 0.55, ease: "easeOut", delay: 0.05 },
        });

        // ロゴ＋KH94を画面上部へ移動
        const rect = groupRef.current?.getBoundingClientRect();
        if (rect) {
          // 現在のグループ上端 -> 目標TOP_PX までの差分
          const deltaY = -(rect.top - TOP_PX);

          await stageCtrl.start({
            y: deltaY,
            transition: {
              duration: 1.0,
              ease: [0.42, 0.0, 0.25, 1],
              delay: 0.05,
            },
          });
        }
      },
    });

    return () => morph.stop();
  }, [groupCtrl, textCtrl, stageCtrl]);

  return (
    // ラッパー：最初は中央配置。そのまま全体をY方向にアニメで上へ送る
    <motion.div
      animate={stageCtrl}
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 1000,
        willChange: "transform",
      }}
    >
      {/* ロゴ＋KH94 */}
      <motion.div
        ref={groupRef}
        animate={groupCtrl}
        style={{
          display: "flex",
          alignItems: "center",
          gap: `${GAP_PX}px`,
          willChange: "transform",
        }}
      >
        <motion.svg
          viewBox="0 0 512 512"
          width="9vmin"
          height="9vmin"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d={d} fill="#000" />
        </motion.svg>

        <motion.div
          ref={textRef}
          animate={textCtrl}
          style={{
            fontSize: "clamp(36px, 7vmin, 110px)",
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#000",
            userSelect: "none",
            willChange: "opacity",
          }}
        >
          KH94
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
