import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export function useRequestSequencer() {
  const { version } =
    useSelector((state: RootState) => state.notes);

  return {
    version,
  };
}
