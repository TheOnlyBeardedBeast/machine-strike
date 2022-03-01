import { styled } from "@stitches/react";
import React from "react";
import { IMachine } from "../Machine";

const Indicator = styled("div", {
  borderRadius: "0 50% 50%",
  transform: "rotate(45deg)",
  background: "black",
  width: "50px",
  height: "50px",

  variants: {
    type: {
      selected: {
        background: "Yellow",
      },
    },
  },
});

const Container = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "75px",
  height: "75px",
});

export interface MachineIndicatorProps {
  type?: "selected";
  onClick: any;
  machine: IMachine;
}

export const MachineIndicator: React.FC<MachineIndicatorProps> = ({
  onClick,
  type,
  machine,
}) => {
  return (
    <Container
      onClick={onClick}
      style={{
        gridColumn: machine.Position.x + 1,
        gridRow: machine.Position.y + 1,
        transform: `rotateZ(${machine.Rotation * 90}deg)`,
      }}
    >
      <Indicator type={type} />
    </Container>
  );
};
