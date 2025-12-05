/* Dropdwon menu used for sorting cards based on certain filters.
   Still requires the parent components to filter card arrays.
*/
import * as React from "react";

interface SortDropdownProps {
  sortField: string;
  setSortField: (field: string) => void;
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
        onChange={(e) => setSortField(e.target.value)}
        className="px-6 py-2 text-lg font-semibold"
      >
        <option value="nameSort">Name</option>
        <option value="price">Price</option>
        <option value="dateSort">Date Added</option>
        <option value="setName"> Set Name</option>
      </select>

      {/* Asc/Desc Toggle Button */}
      <button
        onClick={() => setAscending(!ascending)}
        className="flex cursor-pointer items-center justify-center bg-blue-400 px-4 hover:bg-blue-500"
      >
        <span className="text-3xl" style={{ opacity: ascending ? 1 : 0.25 }}>
          ↑
        </span>
        <span className="text-3xl" style={{ opacity: ascending ? 0.25 : 1 }}>
          ↓
        </span>
      </button>
    </div>
  );
};
export default SortDropown;
