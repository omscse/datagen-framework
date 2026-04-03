export function getUiHtml(): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Data Generation UI</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6f9; color: #1a1a2e; min-height: 100vh; }

    /* Header */
    header { background: #ffffff; border-bottom: 1px solid #e2e6ec; padding: 14px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    header h1 { font-size: 17px; font-weight: 600; color: #1a1a2e; letter-spacing: -0.3px; }
    .pill { font-size: 11px; background: #5b5ef4; color: #fff; padding: 2px 8px; border-radius: 12px; font-weight: 500; }
    .store-path { font-size: 11px; color: #8892a4; font-family: 'SF Mono', Consolas, monospace; }

    /* Layout */
    main { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: .8px; color: #8892a4; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 16px; }

    /* Card */
    .card { background: #ffffff; border: 1px solid #e2e6ec; border-radius: 12px; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
    .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.06); }
    .card.has-data { border-color: #5b5ef4; }
    .card-header { padding: 14px 18px; border-bottom: 1px solid #f0f2f6; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .card-meta { flex: 1; min-width: 0; }
    .card-title { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    .card-desc { font-size: 12px; color: #8892a4; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge { font-size: 11px; padding: 3px 9px; border-radius: 10px; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
    .badge-ready { background: #f0f2f6; color: #8892a4; }
    .badge-generated { background: #eeeeff; color: #5b5ef4; }
    .card-body { padding: 14px 18px; }
    .generated-at { font-size: 11px; color: #8892a4; margin-bottom: 10px; }

    /* Buttons */
    .actions { display: flex; flex-wrap: wrap; gap: 7px; }
    .btn { padding: 5px 13px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: opacity .15s, background .15s; line-height: 1.5; }
    .btn:hover:not(:disabled) { opacity: .82; }
    .btn:disabled { opacity: .38; cursor: not-allowed; }
    .btn-primary  { background: #5b5ef4; color: #fff; }
    .btn-outline  { background: #fff; color: #4a5568; border: 1px solid #d4d9e2; }
    .btn-green    { background: #e8f8f2; color: #0f7a54; border: 1px solid #b2dece; }
    .btn-red      { background: #fef2f2; color: #c0222a; border: 1px solid #f5c0c2; }

    /* Custom input panel */
    .custom-panel { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f2f6; display: none; }
    .custom-panel.open { display: block; }
    .input-label { font-size: 11px; color: #8892a4; margin-bottom: 5px; display: block; }
    .json-input { width: 100%; background: #f8fafc; border: 1px solid #d4d9e2; border-radius: 6px; color: #1a1a2e; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; padding: 8px 10px; resize: vertical; min-height: 70px; outline: none; }
    .json-input:focus { border-color: #5b5ef4; box-shadow: 0 0 0 3px rgba(91,94,244,.1); }

    /* Data preview */
    .data-preview { margin-top: 10px; background: #f8fafc; border: 1px solid #e2e6ec; border-radius: 6px; padding: 10px 12px; font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #2d6a4f; max-height: 150px; overflow-y: auto; white-space: pre; display: none; }
    .data-preview.visible { display: block; }

    /* Toast */
    .toast { position: fixed; bottom: 24px; right: 24px; background: #fff; border: 1px solid #e2e6ec; color: #1a1a2e; padding: 11px 16px; border-radius: 8px; font-size: 13px; pointer-events: none; opacity: 0; transform: translateY(10px); transition: opacity .25s, transform .25s; z-index: 1000; box-shadow: 0 4px 16px rgba(0,0,0,.1); }
    .toast.show { opacity: 1; transform: translateY(0); }
    .toast.err { border-color: #f5c0c2; color: #c0222a; }

    /* Loading */
    .loading { display: flex; align-items: center; gap: 10px; padding: 60px 0; justify-content: center; color: #8892a4; font-size: 14px; }
    .spinner { width: 18px; height: 18px; border: 2px solid #e2e6ec; border-top-color: #5b5ef4; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <header>
    <div class="header-left">
      <h1>Data Generation UI</h1>
      <span class="pill">Test Factory</span>
    </div>
    <span class="store-path" id="store-path-label"></span>
  </header>
  <main>
    <p class="section-title">Registered Packs</p>
    <div id="root"><div class="loading"><div class="spinner"></div> Loading packs&hellip;</div></div>
  </main>
  <div class="toast" id="toast"></div>

  <script>
    (function () {
      var toastTimer;

      function toast(msg, isErr) {
        var el = document.getElementById('toast');
        el.textContent = msg;
        el.className = 'toast show' + (isErr ? ' err' : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 3200);
      }

      function showOutput(key, data) {
        var el = document.getElementById('preview-' + key);
        if (!el) return;
        el.textContent = JSON.stringify(data, null, 2);
        el.className = 'data-preview visible';
      }

      function toggleCustom(key) {
        var el = document.getElementById('custom-' + key);
        if (el) el.classList.toggle('open');
      }

      function setDisabled(key, disabled) {
        var card = document.getElementById('card-' + key);
        if (!card) return;
        card.querySelectorAll('.btn').forEach(function (b) { b.disabled = disabled; });
      }

      async function generate(key, custom) {
        setDisabled(key, true);
        var input;
        if (custom) {
          var raw = (document.getElementById('jinput-' + key) || {}).value || '';
          try { input = raw.trim() ? JSON.parse(raw.trim()) : {}; }
          catch (_) { toast('Invalid JSON input', true); setDisabled(key, false); return; }
        }
        try {
          var res = await fetch('/api/packs/' + key + '/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ custom: !!custom, input: input })
          });
          var result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Generation failed');
          showOutput(key, result.data);
          toast('Generated: ' + key);
          await refreshCard(key);
        } catch (e) {
          toast(e.message, true);
          setDisabled(key, false);
        }
      }

      function download(key) {
        var a = document.createElement('a');
        a.href = '/api/packs/' + key + '/download';
        a.click();
      }

      async function cleanup(key) {
        if (!confirm('Delete stored data for pack "' + key + '"?')) return;
        setDisabled(key, true);
        try {
          var res = await fetch('/api/packs/' + key, { method: 'DELETE' });
          var result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Cleanup failed');
          toast('Cleaned up: ' + key);
          await refreshCard(key);
        } catch (e) {
          toast(e.message, true);
          setDisabled(key, false);
        }
      }

      async function refreshCard(key) {
        var res = await fetch('/api/packs');
        var packs = await res.json();
        var pack = packs.find(function (p) { return p.key === key; });
        if (!pack) return;
        var old = document.getElementById('card-' + key);
        if (old) old.replaceWith(buildCard(pack));
      }

      function buildCard(pack) {
        var hasData = !!pack.stored;
        var card = document.createElement('div');
        card.className = 'card' + (hasData ? ' has-data' : '');
        card.id = 'card-' + pack.key;

        var createdAt = hasData ? new Date(pack.stored.createdAt).toLocaleString() : '';

        var actionsHtml = '';
        if (!hasData) {
          actionsHtml += '<button class="btn btn-primary" onclick="window._dg.generate(\\'' + pack.key + '\\', false)">Generate Default</button>';
          if (pack.supportsCustom) {
            actionsHtml += '<button class="btn btn-outline" onclick="window._dg.toggleCustom(\\'' + pack.key + '\\')">Custom &#9662;</button>';
          }
        } else {
          actionsHtml += '<button class="btn btn-green" onclick="window._dg.download(\\'' + pack.key + '\\')">&#x2193; Download JSON</button>';
          actionsHtml += '<button class="btn btn-outline" onclick="window._dg.generate(\\'' + pack.key + '\\', false)">Regenerate</button>';
          actionsHtml += '<button class="btn btn-red" onclick="window._dg.cleanup(\\'' + pack.key + '\\')">Cleanup</button>';
        }

        var customPanelHtml = '';
        if (pack.supportsCustom && !hasData) {
          customPanelHtml = '<div class="custom-panel" id="custom-' + pack.key + '">'
            + '<label class="input-label">JSON input for createCustom(input)</label>'
            + '<textarea class="json-input" id="jinput-' + pack.key + '" placeholder=\\'{"key": "value"}\\'></textarea>'
            + '<div class="actions" style="margin-top:8px">'
            + '<button class="btn btn-primary" onclick="window._dg.generate(\\'' + pack.key + '\\', true)">Generate Custom</button>'
            + '</div></div>';
        }

        card.innerHTML = '<div class="card-header">'
          + '<div class="card-meta">'
          + '<div class="card-title">' + pack.name + '</div>'
          + '<div class="card-desc">' + pack.description + '</div>'
          + '</div>'
          + '<span class="badge ' + (hasData ? 'badge-generated' : 'badge-ready') + '">' + (hasData ? 'Generated' : 'Ready') + '</span>'
          + '</div>'
          + '<div class="card-body">'
          + (hasData ? '<div class="generated-at">Stored ' + createdAt + '</div>' : '')
          + '<div class="actions">' + actionsHtml + '</div>'
          + customPanelHtml
          + '<div class="data-preview" id="preview-' + pack.key + '"></div>'
          + '</div>';

        return card;
      }

      async function loadPacks() {
        try {
          var res = await fetch('/api/packs');
          var packs = await res.json();
          var storePath = res.headers.get('X-Store-Path') || '';
          document.getElementById('store-path-label').textContent = storePath ? 'store: ' + storePath : '';
          var root = document.getElementById('root');
          if (!packs.length) { root.innerHTML = '<p style="color:#475569">No packs registered.</p>'; return; }
          var grid = document.createElement('div');
          grid.className = 'grid';
          packs.forEach(function (p) { grid.appendChild(buildCard(p)); });
          root.innerHTML = '';
          root.appendChild(grid);
        } catch (e) {
          document.getElementById('root').innerHTML = '<p style="color:#f87171">Failed to load packs: ' + e.message + '</p>';
        }
      }

      window._dg = { generate: generate, download: download, cleanup: cleanup, toggleCustom: toggleCustom };
      loadPacks();
    })();
  </script>
</body>
</html>`;
}
