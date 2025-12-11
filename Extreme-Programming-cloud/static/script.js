const API = "/contacts";  // 使用相对路径
let editingId = null;
let favOnly = false;

const types = ['phone', 'email', 'qq', 'weixin', 'address'];

function addRow(type = 'phone', value = '') {
    const box = document.getElementById('details');
    const div = document.createElement('div');
    div.className = 'detail-row';
    div.innerHTML = `
        <select>
            <option value="phone"   ${type==='phone'?'selected':''}>电话</option>
            <option value="email"    ${type==='email'?'selected':''}>邮箱</option>
            <option value="qq"       ${type==='qq'?'selected':''}>QQ</option>
            <option value="weixin"   ${type==='weixin'?'selected':''}>微信</option>
            <option value="address"  ${type==='address'?'selected':''}>地址</option>
        </select>
        <input type="text" value="${value.replace(/"/g, '&quot;')}" placeholder="请输入内容">
        <button type="button" style="background:#f44336;color:#fff;border:none;border-radius:6px;padding:0 12px;cursor:pointer;">删除</button>
    `;
    div.querySelector('button').onclick = () => div.remove();
    box.appendChild(div);
}

function openModal(id = null, name = '', details = []) {
    editingId = id;
    document.getElementById('title').textContent = id ? '编辑联系人' : '添加联系人';
    document.getElementById('name').value = name || '';
    document.getElementById('details').innerHTML = '';
    details.length ? details.forEach(d => addRow(d.type, d.value)) : addRow();
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function save() {
    const name = document.getElementById('name').value.trim();
    const details = [];
    document.querySelectorAll('.detail-row').forEach(row => {
        const type = row.querySelector('select').value;
        const value = row.querySelector('input').value.trim();
        if (value) details.push({type, value});
    });
    if (!name || details.length === 0) return alert('姓名和至少一个联系方式必填！');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API}/${editingId}` : API;

    await fetch(url, {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, details})});
    closeModal();
    load();
}

async function load() {
    try {
        const p = new URLSearchParams();
        const s = document.getElementById('search').value.trim();
        if (s) p.append('search', s);
        if (favOnly) p.append('favorite','true');

        const res = await fetch(`${API}?${p}`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();

        const ul = document.getElementById('list');
        ul.innerHTML = '';

        data.forEach(c => {
            const detailsHtml = c.details?.length ? c.details.map(d => {
                const label = {phone:'电话', email:'邮箱', qq:'QQ', weixin:'微信', address:'地址'}[d.type] || d.type;
                return `• ${label}: ${d.value}`;
            }).join('<br>') : '<span style="color:#aaa">暂无联系方式</span>';

            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong style="font-size:19px">${c.name}</strong>
                    <div class="details" style="margin-top:8px;line-height:1.7">${detailsHtml}</div>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <button class="fav-btn ${c.is_favorite ? 'active' : ''}" data-id="${c.id}">
                        ${c.is_favorite ? '⭐' : '☆'}
                    </button>
                    <button class="edit"   data-id="${c.id}" data-name="${c.name}" data-details='${JSON.stringify(c.details)}'>编辑</button>
                    <button class="delete" data-id="${c.id}">删除</button>
                </div>
            `;
            ul.appendChild(li);
        });

        ul.onclick = e => {
            const t = e.target;
            if (t.classList.contains('fav-btn')) {
                const id = t.dataset.id;
                const willFav = !t.classList.contains('active');
                fetch(`${API}/${id}/favorite`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({is_favorite: willFav})
                }).then(() => load());
            }
            if (t.classList.contains('edit')) {
                openModal(+t.dataset.id, t.dataset.name, JSON.parse(t.dataset.details||'[]'));
            }
            if (t.classList.contains('delete') && confirm('确定删除？')) {
                fetch(`${API}/${t.dataset.id}`, {method:'DELETE'}).then(() => load());
            }
        };

    } catch (err) {
        document.getElementById('list').innerHTML = '<li style="color:red;text-align:center">连接失败：请确认 Flask 后端正在运行</li>';
    }
}

// ===== 导入/导出功能 =====
document.getElementById('exportBtn').onclick = () => {
    window.location.href = `${API}/export`;
};

document.getElementById('importBtn').onclick = () => {
    document.getElementById('importFile').click();
};

document.getElementById('importFile').onchange = async e => {
    const file = e.target.files[0];
    const form = new FormData();
    form.append('file', file);
    await fetch(`${API}/import`, {method:'POST', body: form});
    load();
};

// 事件绑定
document.getElementById('addBtn').onclick = () => openModal();
document.getElementById('addField').onclick = () => addRow();
document.getElementById('save').onclick = save;
document.getElementById('cancel').onclick = closeModal;
document.querySelector('.close').onclick = closeModal;
document.querySelector('.toolbar button:nth-child(2)').onclick = load;
document.querySelectorAll('.toolbar .reset')[0].onclick = () => {document.getElementById('search').value=''; load();};
document.getElementById('favOnly').onclick = () => {favOnly=true; load();};
document.getElementById('showAll').onclick = () => {favOnly=false; load();};

load();
