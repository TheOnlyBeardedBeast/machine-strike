import { styled } from "@stitches/react";
import { ArrowsOutCardinal } from "phosphor-react";
import React from "react";
import { MachineIndicator } from "./Components/MachineIndicator";
import { MoveIndicator } from "./Components/MoveIndicator";
import {
  BoardCell,
  StrikeBoard,
  Player as StrikePlayer,
  Lancehorn,
  IMachine,
  PositionScale,
} from "./Machine";

const Grid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(8,75px)",
  gridTemplateRows: "repeat(8,75px)",
  rowGap: "2px",
  columnGap: "2px",
});

const Terrain = styled("div", {
  width: "75px",
  height: "75px",

  variants: {
    type: {
      [BoardCell.Chasm]: {
        background: "brown",
      },
      [BoardCell.MarshTerrain]: {
        background: "aqua",
      },
      [BoardCell.GrasslandTerrain]: {
        background: "GreenYellow",
      },
      [BoardCell.ForestTerrain]: {
        background: "green",
      },
      [BoardCell.HillTerrain]: {
        background: "gray",
      },
      [BoardCell.MontainTerrain]: {
        background: "White",
      },
    },
  },
});

const stikeBoard = new StrikeBoard();
const player = new StrikePlayer(stikeBoard, [Lancehorn(0, 7), Lancehorn(3, 7)]);

export const Board: React.FC = () => {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        player.EndTurn();
        setTick(tick + 1);
      }
    });
  }, []);

  return (
    <Grid>
      {stikeBoard.cells.map((x, ix) =>
        x.map((y, iy) => (
          <Terrain
            key={`${ix},${iy}`}
            type={y}
            style={{ gridColumn: ix + 1, gridRow: iy + 1 }}
          >
            {ix},{iy}
          </Terrain>
        ))
      )}

      {player.machines.map((machine, i) => (
        <MachineIndicator
          onClick={() => {
            if (player.selectedMachine !== machine) {
              player.SelectMachine(machine);
            } else {
              player.SelectMachine(undefined);
            }
            setTick(tick + 1);
          }}
          type={player.selectedMachine === machine ? "selected" : undefined}
          machine={machine}
          key={`machine${i}`}
        />
      ))}
      {player.CanMoveTo().moves.map((position) => (
        <MoveIndicator
          onClick={() => {
            if (player.selectedMachine) {
              player.Move(player.selectedMachine, position);
              setTick(tick + 1);
            }
          }}
          position={position}
        />
      ))}
      {player.CanMoveTo().sprints.map((position) => (
        <MoveIndicator
          type="sprint"
          onClick={() => {
            if (player.selectedMachine) {
              player.Sprint(player.selectedMachine, position);
              setTick(tick + 1);
            }
          }}
          position={position}
        />
      ))}
    </Grid>
  );
};
