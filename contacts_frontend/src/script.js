const API_URL = "http://127.0.0.1:5000/contacts";
let showFavorites = false;
let debounceTimer;

async function loadContacts(search = "") {
    document.getElementById("loading").style.display = "block";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (showFavorites) params.append("favorite", "true");
    const url = `${API_URL}?${params.toString()}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        const list = document.getElementById("contactList");
        list.innerHTML = "";
        data.forEach(c => {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${c.name} - ${c.phone}`;  // XSS 防护
            li.appendChild(span);

            const buttons = document.createElement("span");
            buttons.className = "contact-buttons";

            const favoriteBtn = document.createElement("button");
            favoriteBtn.className = c.is_favorite ? "favorite active" : "favorite";
            favoriteBtn.textContent = c.is_favorite ? "★" : "☆";
            favoriteBtn.onclick = () => toggleFavorite(c.id, !c.is_favorite);

            const editBtn = document.createElement("button");
            editBtn.className = "edit";
            editBtn.textContent = "Modify";
            editBtn.onclick = () => editContact(c.id, c.name, c.phone);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteContact(c.id);

            buttons.append(favoriteBtn, editBtn, deleteBtn);
            li.appendChild(buttons);
            list.appendChild(li);
        });
    } catch (error) {
        alert(`Failed to load contacts: ${error.message}`);
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

async function addContact() {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    if (!name || !phone) {
        alert("Please enter name and phone");
        return;
    }
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone })
        });
        if (!res.ok) throw new Error(await res.json().error);
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
        loadContacts();
    } catch (error) {
        alert(`Failed to add contact: ${error.message}`);
    }
}

async function deleteContact(id) {
    if (!confirm("Are you sure?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.json().error);
        loadContacts();
    } catch (error) {
        alert(`Failed to delete: ${error.message}`);
    }
}

async function editContact(id, currentName, currentPhone) {
    const newName = prompt("Enter new name:", currentName);
    const newPhone = prompt("Enter new phone:", currentPhone);
    if (newName && newPhone) {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim() })
            });
            if (!res.ok) throw new Error(await res.json().error);
            loadContacts();
        } catch (error) {
            alert(`Failed to update: ${error.message}`);
        }
    }
}

async function toggleFavorite(id, is_favorite) {
    try {
        const res = await fetch(`${API_URL}/${id}/favorite`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_favorite })
        });
        if (!res.ok) throw new Error(await res.json().error);
        loadContacts();
    } catch (error) {
        alert(`Failed to toggle favorite: ${error.message}`);
    }
}

function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        loadContacts(document.getElementById("searchInput").value);
    }, 300);
}

// 事件绑定
document.getElementById("addBtn").onclick = addContact;
document.getElementById("searchBtn").onclick = () => loadContacts(document.getElementById("searchInput").value);
document.getElementById("resetBtn").onclick = () => {
    document.getElementById("searchInput").value = "";
    loadContacts();
};
document.getElementById("showFavoritesBtn").onclick = () => {
    showFavorites = true;
    loadContacts();
};
document.getElementById("showAllBtn").onclick = () => {
    showFavorites = false;
    loadContacts();
};
document.getElementById("searchInput").oninput = debounceSearch;

loadContacts();