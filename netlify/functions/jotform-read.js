```js
exports.handler = async () => {
const API_KEY = process.env.JOTFORM_API_KEY;
const FORM_ID = process.env.JOTFORM_FORM_ID;
if (!API_KEY || !FORM_ID) {
return { statusCode: 500, body: JSON.stringify({ error: "Server not configured" }) };
}
try {
const resp = await fetch(
`https://api.jotform.com/form/${FORM_ID}/submissions?apiKey=${API_KEY}&limit=100&orderby=created_at`
);
const json = await resp.json();
return {
statusCode: 200,
headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
body: JSON.stringify(json)
};
} catch (e) {
return { statusCode: 502, body: JSON.stringify({ error: "Jotform request failed", detail: String(e) }) };
}
};
```
