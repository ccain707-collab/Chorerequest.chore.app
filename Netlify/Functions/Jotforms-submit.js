let fieldCache = null;
let fieldCacheAt = 0;

async function getFieldMap(API_KEY, FORM_ID) {
  if (fieldCache && Date.now() - fieldCacheAt < 10 * 60 * 1000) return fieldCache;
  const resp = await fetch(`https://api.jotform.com/form/${FORM_ID}/questions?apiKey=${API_KEY}`);
  const json = await resp.json();
  const qs = json.content || {};
  const map = {};
  for (const qid in qs) {
    const q = qs[qid];
    const label = (q.text || q.name || "").toLowerCase();
    if (label.includes("child")) map.name = qid;
    else if (label.includes("chore")) map.chore = qid;
    else if (label.includes("earning")) map.earnings = qid;
    else if (q.type === "control_datetime" || label.includes("date")) map.date = qid;
    else if (label.includes("time")) map.time = qid;
    else if (label.includes("photo")) map.photo = qid;
  }
  fieldCache = map;
  fieldCacheAt = Date.now();
  return map;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  const API_KEY = process.env.JOTFORM_API_KEY;
  const FORM_ID = process.env.JOTFORM_FORM_ID;
  if (!API_KEY || !FORM_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server not configured" }) };
  }

  let data;
  try { data = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: "Bad request body" }) }; }

  let map;
  try { map = await getFieldMap(API_KEY, FORM_ID); }
  catch (e) { return { statusCode: 502, body: JSON.stringify({ error: "Could not read form fields", detail: String(e) }) }; }

  const params = new URLSearchParams();
  if (map.name) params.append(`submission[${map.name}]`, data.child || "");
  if (map.chore) params.append(`submission[${map.chore}]`, data.chore || "");
  if (map.earnings) params.append(`submission[${map.earnings}]`,
