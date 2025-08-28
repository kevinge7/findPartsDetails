const inputEl = document.getElementById('primaryInput');
const btn = document.getElementById('searchBtn');
const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');

function parsePrimaries(raw) {
    const parts = (raw || '')
        .split(/[,\uFF0C\s]+/)   // 英文逗号、中文逗号、任意空白
        .map(s => s.trim())
        .filter(Boolean);

    const seen = new Set();
    const ordered = [];
    for (const p of parts) {
        const key = p.toUpperCase();
        if (!seen.has(key)) { seen.add(key); ordered.push(p); }
    }
    return ordered;
}

function renderChips(list) {
    chipsEl.innerHTML = '';
    list.forEach(p => {
        const span = document.createElement('span');
        span.className = 'chip mono';
        span.textContent = p;
        chipsEl.appendChild(span);
    });
}

function renderSkeleton(list) {
    resultsEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th style="width:14%">Enter Primary</th>
          <th style="width:12%">Match Status</th>
          <th style="width:14%">Item</th>
          <th style="width:18%">Primary Make/Model</th>
          <th style="width:24%">OEM / Addl Info</th>
          <th style="width:10%">KGs / W1</th>
          <th style="width:8%">Details</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(() => `
          <tr>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// 动态渲染：把行对象转成 Key-Value 表格（显示所有列）
function renderKeyValueTable(row) {
    const keys = Object.keys(row || {});
    if (keys.length === 0) return '<div class="hint">No More</div>';
    const rows = keys.map(k => `
    <tr>
      <th>${escapeHtml(k)}</th>
      <td class="mono">${escapeHtml(row[k] ?? '')}</td>
    </tr>
  `).join('');
    return `<table class="kv">${rows}</table>`;
}

function renderResults(inputOrder, apiData) {
    const mapByPrimary = new Map();
    (apiData.results || []).forEach(row => {
        if (!row) return;
        mapByPrimary.set(String(row.Primary || '').toUpperCase(), row);
    });

    const rows = inputOrder.map(inp => {
        const hit = mapByPrimary.get(inp.toUpperCase());
        return { inp, hit };
    });

    resultsEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th style="width:14%">Enter Primary</th>
          <th style="width:12%">Match Status</th>
          <th style="width:14%">Item</th>
          <th style="width:18%">Primary Make/Model</th>
          <th style="width:24%">OEM / Addl Info</th>
          <th style="width:10%">KGs / W1</th>
          <th style="width:8%">Details</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(({inp, hit}, idx) => `
          <tr>
            <td class="mono">${escapeHtml(inp)}</td>
            <td>${hit ? `<span class="tag ok">Found</span>` : `<span class="tag warn">Not Found</span>`}</td>
            <td>${hit ? escapeHtml(hit["Item"] ?? "") : "-"}</td>
            <td>
              ${hit ? escapeHtml(hit["Primary Make"] ?? "") : "-"}
              ${hit ? (hit["Primary Model"] ? ` / ${escapeHtml(hit["Primary Model"])}` : "") : ""}
              <div class="muted" style="color:var(--muted); font-size:12px; margin-top:4px;">
                ${hit ? escapeHtml(hit["Sub-Category 1"] ?? "") : ""}
              </div>
            </td>
            <td>
              <div class="mono">${hit ? escapeHtml(hit["OEM"] ?? "") : "-"}</div>
              <div style="color:var(--muted); font-size:12px; margin-top:4px;">
                ${hit ? escapeHtml(hit["Addl Info"] ?? "") : ""}
              </div>
            </td>
            <td>
              <div>KGs: <span class="mono">${hit ? escapeHtml(hit["KGs"] ?? "") : "-"}</span></div>
              <div>W1: <span class="mono">${hit ? escapeHtml(hit["W1"] ?? "") : "-"}</span></div>
            </td>
            <td>
              ${hit
        ? `<button class="btn-link" data-det="det-${idx}">Expand</button>`
        : `<span class="hint">-</span>`
    }
            </td>
          </tr>
          ${hit ? `
            <tr id="det-${idx}" style="display:none;">
              <td colspan="7">
                <div class="details">
                  ${renderKeyValueTable(hit)}
                </div>
              </td>
            </tr>
          ` : ''}
        `).join('')}
      </tbody>
    </table>
  `;

    // 绑定每行“展开/收起”
    document.querySelectorAll('[data-det]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-det');
            const row = document.getElementById(id);
            const isHidden = row.style.display === 'none';
            row.style.display = isHidden ? '' : 'none';
            btn.textContent = isHidden ? 'Hide' : 'Expand';
        });
    });
}

async function doSearch() {
    const list = parsePrimaries(inputEl.value);
    renderChips(list);

    if (list.length === 0) {
        resultsEl.innerHTML = '<div class="hint">Please Enter Parts Primary Number</div>';
        return;
    }

    renderSkeleton(list);

    try {
        const qs = encodeURIComponent(list.join(','));
        const resp = await fetch(`/api/findParts?primary=${qs}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        renderResults(list, data);
    } catch (e) {
        resultsEl.innerHTML = `<div class="hint" style="color:#ffb3b3">Request Failed：${escapeHtml(e.message)}</div>`;
    }
}

// 事件
btn.addEventListener('click', doSearch);
inputEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') doSearch();
    if (e.key === 'Enter' && (e.shiftKey || inputEl.value.length < 40)) {
        e.preventDefault();
        doSearch();
    }
});
