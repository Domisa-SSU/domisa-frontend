import { useState, type CSSProperties } from "react";

import ginkgoGif from "./assets/fallingGinkgo.gif";
import ginkgoPng from "./assets/fallingGinkgo.png";
import mapleGif from "./assets/fallingMaple.gif";
import maplePng from "./assets/fallingMaple.png";
import oakGif from "./assets/fallingOak.gif";
import oakPng from "./assets/fallingOak.png";

type FallingLeaf = {
  id: string;
  animatedSrc: string;
  stillSrc: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  drift: string;
  restY: string;
};

type FallingLeafStyle = CSSProperties & {
  "--leaf-left": string;
  "--leaf-size": string;
  "--leaf-duration": string;
  "--leaf-delay": string;
  "--leaf-drift": string;
  "--leaf-rest-y": string;
};

// 같은 낙하 주기를 5초씩 나눠 잎 사이의 세로 간격이 항상 유지되게 한다.
const fallingLeaves: FallingLeaf[] = [
  {
    id: "ginkgo",
    animatedSrc: ginkgoGif,
    stillSrc: ginkgoPng,
    left: "76%",
    size: "11.5rem",
    duration: "15s",
    delay: "-1.5s",
    drift: "-10vw",
    restY: "-4rem",
  },
  {
    id: "oak",
    animatedSrc: oakGif,
    stillSrc: oakPng,
    left: "18%",
    size: "11.5rem",
    duration: "15s",
    delay: "-6.5s",
    drift: "12vw",
    restY: "19rem",
  },
  {
    id: "maple",
    animatedSrc: mapleGif,
    stillSrc: maplePng,
    left: "82%",
    size: "12.5rem",
    duration: "15s",
    delay: "-11.5s",
    drift: "-10vw",
    restY: "42rem",
  },
];

type LeafTrajectory = Pick<FallingLeaf, "left" | "drift">;

const createRandomTrajectory = (): LeafTrajectory => {
  const left = 12 + Math.random() * 76;
  const minimumDrift = Math.max(-14, 12 - left);
  const maximumDrift = Math.min(14, 88 - left);
  const drift = minimumDrift + Math.random() * (maximumDrift - minimumDrift);

  return {
    left: `${left.toFixed(2)}%`,
    drift: `${drift.toFixed(2)}vw`,
  };
};

function FallingLeaves() {
  const [trajectories, setTrajectories] = useState<LeafTrajectory[]>(() =>
    fallingLeaves.map(({ left, drift }) => ({ left, drift })),
  );

  const changeTrajectory = (leafIndex: number) => {
    setTrajectories((currentTrajectories) =>
      currentTrajectories.map((trajectory, index) =>
        index === leafIndex ? createRandomTrajectory() : trajectory,
      ),
    );
  };

  return (
    <div className="home-falling-leaves" aria-hidden="true">
      {fallingLeaves.map((leaf, index) => {
        const trajectory = trajectories[index];
        const style: FallingLeafStyle = {
          "--leaf-left": trajectory.left,
          "--leaf-size": leaf.size,
          "--leaf-duration": leaf.duration,
          "--leaf-delay": leaf.delay,
          "--leaf-drift": trajectory.drift,
          "--leaf-rest-y": leaf.restY,
        };

        return (
          <picture
            className="home-falling-leaf"
            style={style}
            key={leaf.id}
            onAnimationIteration={() => changeTrajectory(index)}
          >
            <source
              media="(prefers-reduced-motion: reduce)"
              srcSet={leaf.stillSrc}
            />
            <img src={leaf.animatedSrc} alt="" draggable={false} />
          </picture>
        );
      })}
    </div>
  );
}

export default FallingLeaves;
