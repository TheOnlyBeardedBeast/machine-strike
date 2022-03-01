import { styled } from "@stitches/react";
import { ArrowsOutCardinal } from "phosphor-react";
import { IPosition } from "../Machine";

const Indicator = styled("div", {
  width: "50px",
  height: "50px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  variants: {
    type: {
      sprint: {
        border: "2px dashed yellow",
        borderRadius: "50%",
      },
    },
  },
});

const Container = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

interface MoveIndicatorProps {
  type?: "sprint";
  position: IPosition;
  onClick: any;
}

export const MoveIndicator: React.FC<MoveIndicatorProps> = ({
  position,
  onClick,
  type,
}) => {
  return (
    <Container
      onClick={onClick}
      style={{
        gridColumn: position.x + 1,
        gridRow: position.y + 1,
      }}
    >
      <Indicator type={type}>
        <ArrowsOutCardinal color="yellow" size={32} />
      </Indicator>
    </Container>
  );
};
