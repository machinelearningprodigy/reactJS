import DisjointSet from "../Utils/DisjointSet";
import { HIRFunction, Identifier, Instruction, LValue, Place } from "./HIR";

export type AliasSet = Set<Identifier>;

class AliasAnalyser {
  aliases = new DisjointSet<Identifier>();

  alias(lvalue: LValue, alias: Place) {
    // This is handled by InferAliasForStores.
    if (lvalue.place.memberPath !== null) {
      return;
    }

    this.aliases.union([lvalue.place.identifier, alias.identifier]);
  }
}

export function inferAliases(func: HIRFunction): DisjointSet<Identifier> {
  const analyser = new AliasAnalyser();
  for (const [_, block] of func.body.blocks) {
    for (const instr of block.instructions) {
      inferInstr(instr, analyser);
    }
  }

  return analyser.aliases;
}

function inferInstr(instr: Instruction, state: AliasAnalyser) {
  const { lvalue, value: instrValue } = instr;
  let alias: Place | null = null;
  switch (instrValue.kind) {
    case "Identifier": {
      alias = instrValue;
      break;
    }
    default:
      return;
  }

  if (lvalue === null) {
    return;
  }

  state.alias(lvalue, alias);
}
