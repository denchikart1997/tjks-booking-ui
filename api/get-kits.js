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

    const payload = JSON.stringify({
      action: 'getKits',
      start,
      end
    });

    let response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: payload,
      redirect: 'manual'
    });

    const location = response.headers.get('location');

    if (location) {
      response = await fetch(location, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: payload
      });
    }

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (parseErr) {
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
