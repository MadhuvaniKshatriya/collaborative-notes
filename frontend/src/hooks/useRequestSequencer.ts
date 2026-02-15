import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export function useRequestSequencer() {
  const { requestSequence, lastCommittedSequence } =
    useSelector((state: RootState) => state.notes);

  return {
    requestSequence,
    lastCommittedSequence,
  };
}
