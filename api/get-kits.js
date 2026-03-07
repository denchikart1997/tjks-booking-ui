export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { start, end, appsScriptUrl } = req.body || {};

    if (!start || !end || !appsScriptUrl) {
      return res.status(400).json({
        ok: false,
        message: 'Missing start, end or appsScriptUrl'
      });
    }

    const url = new URL(appsScriptUrl);
    url.searchParams.set('action', 'getKits');
    url.searchParams.set('start', start);
    url.searchParams.set('end', end);

    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        ok: false,
        message: 'Apps Script returned non-JSON response',
        status: response.status,
        raw: text.slice(0, 1500)
      });
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: String(err)
    });
  }
}
