import api from "@/api/client.js";
/*  Function to parse lines of the exact required format:
    Quantity, name, set identifier in parentheses. Lines without quantity or without a set are ignored.
    Examples accepted: "1x Umara Wizard (ZNR)", "2 Lightning Bolt (M21)"; trailing text after the ) is ignored.
    */
export async function parseAndAddList(listText: string, haves: boolean) {
  if (!listText.trim()) {
    alert("Empty textbox.");
    return;
  }

  const lines = listText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) {
    alert("No card lines found.");
    return;
  }
  function parseLine(line: string): { qty: number; name: string; setId: string } | null {
    const m = line.match(/^\s*(\d+)\s*x?\s+(.+?)\s*\(([^)]+)\)/i);
    if (!m) return null; // ignore lines that don't match the required format
    const qty = parseInt(m[1], 10);
    const name = m[2].trim();
    const setId = m[3].trim();
    return { qty, name, setId };
  }

  let added: number = 0;
  let failed: number = 0;
  let ignored: number = 0;

  for (const raw of lines) {
    const parsed = parseLine(raw);
    if (!parsed) {
      ignored += 1;
      continue;
    }
    const { qty, name, setId } = parsed;
    try {
      // Try Scryfall named endpoint with exact name + set code first (best chance for exact edition match)
      const setCode = encodeURIComponent(setId.toLowerCase());
      const exactUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
        name
      )}&set=${setCode}`;
      let res = await fetch(exactUrl);
      let card;
      if (!res.ok) {
        // fallback: fuzzy by name and set
        const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          `${name} set:${setId}`
        )}`;
        res = await fetch(fuzzyUrl);
        if (!res.ok) throw new Error(`Scryfall lookup failed for ${name} (${setId})`);
        const searchResult = await res.json();
        if (!searchResult.data || searchResult.data.length === 0)
          throw new Error(`No results for ${name} (${setId})`);
        card = searchResult.data[0];
      } else {
        card = await res.json();
      }

      const payload = {
        name: card.name,
        set_name: card.set_name || card.set || "",
        rarity: card.rarity || "",
        price: card.prices?.usd ? parseFloat(card.prices.usd) : 0,
        image_url: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "",
        quantity: qty,
        intent: haves ? "have" : "want",
      };

      try {
        await api.post("/cards/", payload);
        added += 1;
      } catch (err) {
        console.error("Failed to add line:", raw, err);
        failed += 1;
      }
    } catch (err) {
      console.error("Failed to add line:", raw, err);
      failed += 1;
    }
  }
  alert(
    `Added ${added} cards. ${failed ? `${failed} failed.` : ""} ${ignored ? `${ignored} failed.` : ""}`
  );
}
