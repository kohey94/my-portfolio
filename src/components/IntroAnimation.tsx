"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

type Props = { onFinish?: () => void };
const nextFrame = () => new Promise<void>(r => requestAnimationFrame(() => r()));

// 512x512 を前提。半径 128px の真円（中心 256,256）
const CIRCLE_D =
  "M256 64 A192 192 0 1 0 256 448 A192 192 0 1 0 256 64 Z";

// あなたのロゴ（そのまま使える）
const LOGO_D =
  "M256,0 0,256 H256 Z M0,0 256,256 V0 Z M256,256 512,0 H256 Z M0,256 256,512 V256 Z M512,512 256,256 v256 z";

export default function IntroAnimation({ onFinish }: Props) {
  const [phase, setPhase] = useState<1|2|3|4>(1);
  const screenFill = useAnimation();    // 黒ゲージ
  const circleCtrl = useAnimation();    // ← 円アニメ専用に変更
   const shellFade   = useAnimation();    // phase3: div円のフェードアウト
  const svgFade     = useAnimation();    // phase3: SVGのフェードイン
  const pathCtrl    = useAnimation();    // phase3: 円→ロゴ morph
  const textCtrl    = useAnimation();    // phase4: KH94表示
  useEffect(() => {
    (async () => {
      await screenFill.start({ height: "100%", transition:{ duration:1.2, ease:"easeInOut" } });

      setPhase(2);
      await nextFrame();
      await circleCtrl.start({
        width: "12vmin",
        height: "12vmin",
        borderRadius: "50%",
        transition: { duration: 1.0, ease: "easeInOut" },
      });

      
      
      
      onFinish?.();
    })();
  }, [onFinish, screenFill, circleCtrl, shellFade, svgFade, pathCtrl, textCtrl]);

  return (
    <div style={{
      position:"fixed", inset:0, background:"#fff", zIndex:9999,
      display:"flex", alignItems:"flex-end", justifyContent:"center", overflow:"hidden",
    }}>
      {phase === 1 && (
        <motion.div
          initial={{ height:"0%", width:"100%", background:"#000" }}
          animate={screenFill}
        />
      )}

      {phase >= 2 && (
        <div style={{
          position:"fixed", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)", zIndex:10000, pointerEvents:"none",
        }}>
          <motion.div
            initial={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:"100vw", height:"100vh",   // ← 初期は全画面四角
              background:"#000", borderRadius:"0%",
            }}
            animate={phase === 2 ? circleCtrl : { opacity: 0 }}  // ← コントローラ接続
          />
        </div>
      )}


    </div>
  );
}
