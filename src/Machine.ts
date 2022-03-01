enum MachineType {
  Swoop,
  Melee,
  Dash,
  Ram,
  Gunner,
  Pull,
}

export type PositionScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface IPosition {
  x: PositionScale;
  y: PositionScale;
}

enum Rotation {
  N,
  E,
  S,
  W,
}

interface IStats {
  AttackPower: number;
  AttackRange: number;
  MovementRange: number;
  Health: number;
}

enum ArmorType {
  Weak,
  Neutral,
  Armored,
}

interface IArmor {
  [Rotation.N]: ArmorType;
  [Rotation.E]: ArmorType;
  [Rotation.S]: ArmorType;
  [Rotation.W]: ArmorType;
}

interface IMoveState {
  MoveDisabled: boolean;
  AttackDisabled: boolean;
  OverchargeDisabled: boolean;
}

export interface IMachine {
  Value: number;
  Name: string;
  Type: MachineType;

  Position: IPosition;
  Rotation: Rotation;

  Stats: IStats;

  Armor: IArmor;

  // move state
  MoveState: IMoveState;
}

// class Machine implements IMachine {
//   Value: number;
//   Name: string;
//   Type: MachineType;
//   Position: IPosition;
//   Rotation: Rotation;
//   Stats: IStats;
//   Armor: IArmor;
// }

export const Lancehorn = (x: PositionScale = 0, y: PositionScale = 0) => ({
  Value: 2, // Low
  Name: "Lancehorn",
  Type: MachineType.Ram,
  Position: { x: x as PositionScale, y: y as PositionScale },
  Rotation: Rotation.N,
  Stats: {
    AttackPower: 2, // Weak
    AttackRange: 2, // Average
    MovementRange: 2, // Short
    Health: 5, // Average
  },
  Armor: {
    [Rotation.N]: ArmorType.Armored,
    [Rotation.E]: ArmorType.Weak,
    [Rotation.W]: ArmorType.Weak,
    [Rotation.S]: ArmorType.Neutral,
  },
  MoveState: {
    OverchargeDisabled: false,
    MoveDisabled: false,
    AttackDisabled: false,
  },
});

export enum BoardCell {
  Chasm = -2,
  MarshTerrain = -1,
  GrasslandTerrain = 0,
  ForestTerrain = 1,
  HillTerrain = 2,
  MontainTerrain = 3,
}

export class Player {
  points: number = 0;
  readonly board: StrikeBoard;
  machines: Array<IMachine> = new Array<IMachine>();
  selectedMachine: IMachine | undefined;

  constructor(board: StrikeBoard, machines?: IMachine[]) {
    this.board = board;
    if (machines) {
      this.machines.push(...machines);
    }
  }

  public SelectMachine(machine?: IMachine) {
    if (!machine) {
      this.selectedMachine = undefined;
      return;
    }

    if (this.machines.indexOf(machine) >= 0) {
      this.selectedMachine = machine;
    }
  }

  public CanMoveTo() {
    const availableMoves: { sprints: IPosition[]; moves: IPosition[] } = {
      sprints: [],
      moves: [],
    };

    if (!this.selectedMachine) {
      return availableMoves;
    }

    if (this.selectedMachine.MoveState.MoveDisabled) {
      return availableMoves;
    }

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const xDif = Math.abs(this.selectedMachine.Position.x - x);
        const yDif = Math.abs(this.selectedMachine.Position.y - y);

        const stepCount = xDif + yDif;

        if (
          stepCount != 0 &&
          stepCount <= this.selectedMachine.Stats.MovementRange
        ) {
          availableMoves.moves.push({
            x: x as PositionScale,
            y: y as PositionScale,
          });
        } else if (stepCount === this.selectedMachine.Stats.MovementRange + 1) {
          availableMoves.sprints.push({
            x: x as PositionScale,
            y: y as PositionScale,
          });
        }
      }
    }

    return availableMoves;
  }

  private _Move(
    machine: IMachine,
    position: IPosition,
    allovedSteps: number,
    rotation?: Rotation
  ) {
    const xDif = Math.abs(position.x - machine.Position.x);
    const yDif = Math.abs(position.y - machine.Position.y);

    const stepCount = xDif + yDif;

    if (stepCount <= allovedSteps) {
      machine.Position = position;
      machine.Rotation = rotation ?? machine.Rotation;
    }

    machine.MoveState.MoveDisabled = true;
  }

  public Move(machine: IMachine, position: IPosition, rotation?: Rotation) {
    if (
      this.selectedMachine?.MoveState.MoveDisabled ||
      comparePosition(machine.Position, position)
    ) {
      return;
    }

    this._Move(machine, position, machine.Stats.MovementRange, rotation);
  }

  public Sprint(machine: IMachine, position: IPosition, rotation?: Rotation) {
    this._Move(machine, position, machine.Stats.MovementRange + 1, rotation);

    machine.MoveState.AttackDisabled = true;
  }

  public OverChargeMove(
    machine: IMachine,
    position: IPosition,
    rotation?: Rotation
  ) {
    this._Move(machine, position, machine.Stats.MovementRange, rotation);

    machine.Stats.Health - 2;
  }

  public Attack(Attacker: IMachine, Defender: IMachine) {
    // should include terrain effects
    const combatPower = Attacker.Stats.AttackPower - Defender.Stats.AttackPower;

    if (combatPower > 0) {
      Defender.Stats.Health -= combatPower;
    } else {
      Defender.Stats.Health -= 1;
      Attacker.Stats.Health -= 1;
    }
  }

  public OverChargeAttack(Attacker: IMachine, Defender: IMachine) {
    this.Attack(Attacker, Defender);

    Attacker.MoveState.AttackDisabled = true;
    Attacker.Stats.Health -= 2;
  }

  EndTurn() {
    for (let machine of this.machines) {
      machine.MoveState.MoveDisabled = false;
      machine.MoveState.AttackDisabled = false;
      machine.MoveState.OverchargeDisabled = false;
    }

    this.selectedMachine = undefined;
  }
}

const boardsize = 8;

export class StrikeBoard {
  cells: Array<Array<BoardCell>> = Array.from(Array(8), () => new Array(8));

  constructor() {
    for (let x = 0; x < boardsize; x++) {
      for (let y = 0; y < boardsize / 2; y++) {
        this.cells[x][y] = Math.round(Math.random() * 5 - 2);
      }
    }

    for (let x = 0; x < boardsize; x++) {
      for (let y = 0; y < boardsize / 2; y++) {
        this.cells[x][y + boardsize / 2] =
          this.cells[boardsize - 1 - x][boardsize / 2 - 1 - y];
      }
    }
  }
}

export const Attack = (
  Attacker: IMachine,
  Defender: IMachine,
  overcharge: boolean = false
) => {
  // should include terrain effects
  const combatPower = Attacker.Stats.AttackPower - Defender.Stats.AttackPower;

  if (combatPower > 0) {
    Defender.Stats.Health -= combatPower;
  }
  //   Defense Break:
  //   If an attacking piece has an equal or lower Combat Power than a defending piece,
  //   both pieces will lose 1 Health point, and the defending piece will be knocked back one space.
  else {
    Defender.Stats.Health -= 1;
    Attacker.Stats.Health -= 1;
  }

  if (overcharge) {
    Attacker.Stats.Health -= 2;
  }
};

export const Move = (
  machine: IMachine,
  position: IPosition,
  rotation?: Rotation,
  sprint?: boolean
) => {
  const allovedSteps = machine.Stats.MovementRange + (sprint ? 1 : 0);

  const xDif = Math.abs(position.x - machine.Position.x);
  const yDif = Math.abs(position.y - machine.Position.y);

  const stepCount = xDif + yDif;

  if (stepCount <= allovedSteps) {
    machine.Position = position;
    machine.Rotation = rotation ?? machine.Rotation;
  }

  // if sprint disable attack
};

export const comparePosition = (position1: IPosition, position2: IPosition) => {
  return position1.y === position2.y && position2.x === position1.x;
};
