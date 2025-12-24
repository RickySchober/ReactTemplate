import React from "react";
import { useState } from "react";

import { parseAndAddList } from "../api/ParseList.js";

import { addOption } from "./ProfileCollection.js";

import api from "@/api/client.js";
import Button from "@/components/Button.js";
import SearchCard from "@/components/SearchCard.js";
import { card } from "@/lib/types.js";

interface ProfileAddProps {
  add: boolean;
  haves: boolean;
  addOption: addOption;
  refreshCards: () => void;
}
const ProfileAdd: React.FC<ProfileAddProps> = ({ add, haves, addOption, refreshCards }) => {
  const [listText, setListText] = useState<string>("");

  async function addFromSearch(card: card) {
    console.log(card);
    try {
      await api.post("/cards/", card);
      refreshCards();
    } catch {
      alert("Failed to add card");
      return null;
    }
  }
  return (
    <>
      {addOption === "search" && add && (
        <SearchCard onSelect={addFromSearch} placeholder="Search for a card to add..." />
      )}
      {addOption === "list" && add && (
        <div className="mt-4">
          <div className="mb-1.5 text-2xl font-semibold">Paste list (one card per line):</div>
          <textarea
            value={listText}
            onChange={(e) => setListText(e.target.value)}
            placeholder={`Example:\n1 Lightning Bolt (STA) \n1x Artist's Talent (BLB)`}
            rows={8}
            className="w-3/5 rounded-md border border-gray-700 bg-transparent p-2.5 text-base text-white"
          />
          <div className="mt-2 flex gap-2">
            <Button
              onClick={async () => {
                await parseAndAddList(listText, haves);
                setListText("");
                refreshCards();
              }}
            >
              Parse & Add
            </Button>
            <Button onClick={() => setListText("")}>Clear</Button>
          </div>
        </div>
      )}
    </>
  );
};
export default ProfileAdd;
