import React from "react";
import { keyframes } from "@mui/system";
import { Box, Container } from "@mui/material";
import { RaceState } from "../RaceLogic";
import { useGameSettings } from "../../../contexts/GameSettings";
import { GameSettings } from "../../../constants/settings";

const usePrevious = (value: any): any => {
  const ref = React.useRef<any>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const styles = {
  marginTop: "-2.5px",
  position: "absolute",
  zIndex: 999,
};

const typeStyles = [
  {
    ...styles,
    minHeight: "40px",
    backgroundColor: "rgba(158, 219, 145, 0.3)",
  },
  {
    ...styles,
    minHeight: "32px",
    borderLeft: "2px solid",
  },
  {
    ...styles,
    minHeight: "32px",
    borderBottom: "2px solid",
  },
];

interface CharOffsets {
  ccol: number;
  ccot: number;
  ccw: number;
}

const DefaultCharOffsets = {
  ccol: 0,
  ccot: 0,
  ccw: 0,
};

interface FollowerProps {
  wbContainerRef: React.RefObject<HTMLDivElement>;
  wbRef: React.RefObject<HTMLDivElement>;
  raceState: RaceState;
  disabled?: boolean;
}

const Follower = ({
  wbContainerRef,
  wbRef,
  raceState,
  disabled,
}: FollowerProps) => {
  const followerRef = React.useRef<HTMLDivElement>(null);

  const { gameSettings } = useGameSettings();

  //   const followerSlide = keyframes`
  //   from {
  //     left: ${prevccol}px;
  //     width: ${prevccw}px
  //   }
  //   to {
  //     left: ${ccol}px;
  //   }
  // `;

  React.useEffect(() => {
    updateFollower(wbRef, wbContainerRef, followerRef, raceState, gameSettings);
  }, [raceState]);

  React.useEffect(() => {
    const initFollowerInterval = setInterval(() => {
      if (wbRef.current && wbRef.current.children[0]) {
        updateFollower(
          wbRef,
          wbContainerRef,
          followerRef,
          raceState,
          gameSettings
        );
        clearInterval(initFollowerInterval);
      }
    }, 100);

    const resizeListener = () => {
      updateFollower(
        wbRef,
        wbContainerRef,
        followerRef,
        raceState,
        gameSettings
      );
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const FollowerBox = React.useMemo(() => {
    return (
      <Box
        ref={followerRef}
        sx={{
          ...typeStyles[gameSettings.display.followerStyle],
          transition: gameSettings.display?.smoothFollower
            ? `left linear, width linear`
            : "none",
          transitionDuration: `${gameSettings.display.followerSpeed}s`,
        }}
        display={disabled ? "none" : "block"}
      ></Box>
    );
  }, [disabled, gameSettings]);

  return <>{FollowerBox}</>;
};

export default React.memo(Follower, (props, newProps) => {
  const { amount, statState, secondsRunning, ...state } = props.raceState;
  const {
    amount: newAmount,
    statState: newStatState,
    secondsRunning: newSecondsRunning,
    ...newState
  } = newProps.raceState;
  const raceState = JSON.stringify(state);
  const newRaceState = JSON.stringify(newState);

  if (raceState === newRaceState) return true;
  return false;
});

const updateFollower = (
  wbRef: React.RefObject<HTMLDivElement>,
  wbContainerRef: React.RefObject<HTMLDivElement>,
  followerRef: React.RefObject<HTMLDivElement>,
  raceState: RaceState,
  settings: GameSettings
) => {
  if (
    wbRef.current &&
    wbRef.current.children[1] &&
    wbRef.current.offsetLeft &&
    wbContainerRef.current &&
    followerRef.current
  ) {
    const charInfo = wbRef.current.children[raceState.wordsTyped].children[
      raceState.currentCharIndex - raceState.currentWordIndex
    ] as HTMLDivElement;
    if (!charInfo) return;
    if (charInfo.offsetTop > 155)
      wbRef.current.style.top = `-${charInfo.offsetTop - 149}px`;

    const ccol =
      wbContainerRef.current.offsetLeft +
      wbRef.current.offsetLeft +
      charInfo?.offsetLeft;
    const ccot =
      wbContainerRef.current.offsetTop +
      wbRef.current.offsetTop +
      charInfo?.offsetTop -
      4;
    const ccw = charInfo?.offsetWidth + 3;

    const followerSpeed = `${settings.display?.followerSpeed || 0.1}s`;

    if (ccot !== parseFloat(followerRef.current.style.top))
      followerRef.current.style.transitionDuration = "0.03s";
    else if (followerRef.current.style.transitionDuration !== "0.1s") {
      followerRef.current.style.transitionDuration = `${
        settings.display?.followerSpeed || 0.1
      }s`;
    }

    followerRef.current.style.left = `${ccol}px`;
    followerRef.current.style.top = `${ccot}px`;
    followerRef.current.style.width = `${ccw}px`;
  }
};
