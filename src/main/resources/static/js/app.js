const inputEl = document.getElementById('primaryInput');
const btn = document.getElementById('searchBtn');
const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');

function parsePrimaries(raw) {
    // 英文逗号、中文逗号、任意空白分隔；去空白；去重；保持输入顺序
    const parts = (raw || '')
        .split(/[,\uFF0C\s]+/)
        .map(s => s.trim())
        .filter(Boolean);

    const seen = new Set();
    const ordered = [];
    for (const p of parts) {
        const key = p.toUpperCase(); // 去重不区分大小写
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
          <th style="width:14%">输入 Primary</th>
          <th style="width:16%">匹配状态</th>
          <th style="width:14%">Item</th>
          <th style="width:18%">Primary Make/Model</th>
          <th style="width:24%">OEM / Addl Info</th>
          <th style="width:14%">KGs / W1</th>
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
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
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
          <th style="width:14%">输入 Primary</th>
          <th style="width:16%">匹配状态</th>
          <th style="width:14%">Item</th>
          <th style="width:18%">Primary Make/Model</th>
          <th style="width:24%">OEM / Addl Info</th>
          <th style="width:14%">KGs / W1</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(({inp, hit}) => `
          <tr>
            <td class="mono">${inp}</td>
            <td>${hit
        ? `<span class="tag ok">Found</span>`
        : `<span class="tag warn">Not Found</span>`}
            </td>
            <td>${hit ? (hit["Item"] ?? "") : "-"}</td>
            <td>
              ${hit ? (hit["Primary Make"] ?? "") : "-"}
              ${hit ? (hit["Primary Model"] ? ` / ${hit["Primary Model"]}` : "") : ""}
              <div class="muted" style="color:var(--muted); font-size:12px; margin-top:4px;">
                ${hit ? (hit["Sub-Category 1"] ?? "") : ""}
              </div>
            </td>
            <td>
              <div class="mono">${hit ? (hit["OEM"] ?? "") : "-"}</div>
              <div style="color:var(--muted); font-size:12px; margin-top:4px;">
                ${hit ? (hit["Addl Info"] ?? "") : ""}
              </div>
            </td>
            <td>
              <div>KGs: <span class="mono">${hit ? (hit["KGs"] ?? "") : "-"}</span></div>
              <div>W1: <span class="mono">${hit ? (hit["W1"] ?? "") : "-"}</span></div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function doSearch() {
    const list = parsePrimaries(inputEl.value);
    renderChips(list);

    if (list.length === 0) {
        resultsEl.innerHTML = '<div class="hint">请先输入 Primary 编号</div>';
        return;
    }

    renderSkeleton(list);

    try {
        // 拼接为逗号形式传给后端
        const qs = encodeURIComponent(list.join(','));
        const resp = await fetch(`/api/findParts?primary=${qs}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        renderResults(list, data);
    } catch (e) {
        resultsEl.innerHTML = `<div class="hint" style="color:#ffb3b3">请求失败：${e.message}</div>`;
    }
}

// 事件绑定
btn.addEventListener('click', doSearch);
inputEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') doSearch();
    if (e.key === 'Enter' && (e.shiftKey || inputEl.value.length < 40)) {
        e.preventDefault();
        doSearch();
    }
});
