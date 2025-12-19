/* Dropdwon menu used for sorting cards based on certain filters.
   Still requires the parent components to filter card arrays.
*/
import * as React from "react";
import { SortOption } from "../lib/types.js";
import Button from "./Button.js";
interface SortDropdownProps {
  sortField: SortOption;
  setSortField: (field: SortOption) => void;
  ascending: boolean;
  setAscending: (asc: boolean) => void;
}

const SortDropown: React.FC<SortDropdownProps> = ({
  sortField,
  setSortField,
  ascending,
  setAscending,
}) => {
  return (
    <div className="item-center m-2.5 flex gap-2.5">
      {/* Dropdown */}
      <select
        value={sortField}
        onChange={(e) => setSortField(e.target.value as SortOption)}
        className="px-6 py-2 text-lg font-semibold"
      >
        <option value={SortOption.NAME}>Name</option>
        <option value={SortOption.PRICE}>Price</option>
        <option value={SortOption.DATE_ADDED}>Date Added</option>
        <option value={SortOption.SET_NAME}> Set Name</option>
      </select>

      {/* Asc/Desc Toggle Button */}
      <Button onClick={() => setAscending(!ascending)}>
        <span className="text-3xl" style={{ opacity: ascending ? 1 : 0.25 }}>
          ↑
        </span>
        <span className="text-3xl" style={{ opacity: ascending ? 0.25 : 1 }}>
          ↓
        </span>
      </Button>
    </div>
  );
};
export default SortDropown;
