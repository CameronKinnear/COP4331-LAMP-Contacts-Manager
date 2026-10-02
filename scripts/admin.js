(() => {
    const API = 'api/admin.php';
    const PAGE_SIZE = 50;
    const byId = (id) => document.getElementById(id);
    const state = { query: '', offset: 0, users: [], contactsUser: null, contactQuery: '' };
    let searchTimer;
    let contactSearchTimer;
    let messageTimer;

    byId('admin-name').textContent = sessionStorage.getItem('firstName') || 'Admin';

    function showMessage(message, type = 'success') {
        const region = byId('status-message');
        region.textContent = message;
        region.className = `status-message visible ${type}`;
        clearTimeout(messageTimer);
        messageTimer = setTimeout(() => {
            region.textContent = '';
            region.className = 'status-message';
        }, 5000);
    }

    async function request(url, options = {}) {
        const response = await fetch(url, options);
        let body;
        try { body = await response.json(); } catch (_) { body = {}; }
        if (response.status === 401 || response.status === 403) {
            if (url.includes('logout=1')) throw new Error(body.error || 'Unable to log out.');
            showMessage(body.error || 'Admin access required. Please sign in with an admin account.', 'error');
            setTimeout(() => { window.location.assign('index.html'); }, 1200);
            throw new Error(body.error || 'Admin access required.');
        }
        if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
        return body;
    }

    function makeBadge(label, className) {
        const badge = document.createElement('span');
        badge.className = `badge ${className}`;
        badge.textContent = label;
        return badge;
    }

    function addCell(row, value) {
        const cell = document.createElement('td');
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value == null || value === '' ? '—' : String(value);
        row.append(cell);
        return cell;
    }

    function actionButton(label, callback, extraClass = '') {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        if (extraClass) button.className = extraClass;
        button.addEventListener('click', callback);
        return button;
    }

    function renderUsers(users) {
        const body = byId('users-table-body');
        body.replaceChildren();
        const adminId = Number(sessionStorage.getItem('userId'));

        users.forEach((user) => {
            const row = document.createElement('tr');
            if (!user.active) row.classList.add('disabled-row');
            addCell(row, user.id);
            addCell(row, `${user.firstName || ''} ${user.lastName || ''}`.trim());
            addCell(row, user.login);
            addCell(row, makeBadge(user.role, user.role === 'admin' ? 'admin' : ''));
            addCell(row, makeBadge(user.active ? 'Active' : 'Disabled', user.active ? 'active' : 'disabled'));

            const actions = document.createElement('div');
            actions.className = 'row-actions';
            if (Number(user.id) !== adminId) {
                actions.append(actionButton(user.active ? 'Disable' : 'Enable', () => updateUser(user, { active: !user.active }), user.active ? 'danger-button' : ''));
            }
            actions.append(actionButton('Reset password', () => resetPassword(user)));
            actions.append(actionButton('View contacts', () => openContacts(user)));
            addCell(row, actions);
            body.append(row);
        });
        byId('users-empty').hidden = users.length !== 0;
    }

    async function loadUsers() {
        byId('users-loading').hidden = false;
        byId('users-empty').hidden = true;
        byId('page-prev').disabled = state.offset === 0;
        byId('page-next').disabled = true;
        try {
            const params = new URLSearchParams({ resource: 'users', limit: String(PAGE_SIZE), offset: String(state.offset) });
            if (state.query) params.set('q', state.query);
            const result = await request(`${API}?${params}`);
            state.users = Array.isArray(result.users) ? result.users : [];
            renderUsers(state.users);
            const page = Math.floor(state.offset / PAGE_SIZE) + 1;
            byId('page-info').textContent = `Page ${page} · Showing ${state.users.length} users`;
            byId('page-prev').disabled = state.offset === 0;
            byId('page-next').disabled = state.users.length < PAGE_SIZE;
        } catch (error) {
            if (error.message !== 'Admin access required.') showMessage(error.message, 'error');
            byId('users-table-body').replaceChildren();
        } finally {
            byId('users-loading').hidden = true;
        }
    }

    async function updateUser(user, changes) {
        try {
            await request(`${API}?resource=users&id=${encodeURIComponent(user.id)}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes)
            });
            showMessage(changes.password ? 'Password updated.' : (changes.active ? 'Account enabled.' : 'Account disabled.'));
            await loadUsers();
        } catch (error) { showMessage(error.message, 'error'); }
    }

    async function resetPassword(user) {
        const password = window.prompt(`Enter a new password for ${user.login}:`);
        if (password === null) return;
        if (!password.trim()) { showMessage('Password cannot be empty.', 'error'); return; }
        await updateUser(user, { password });
    }

    async function openContacts(user) {
        state.contactsUser = user;
        state.contactQuery = '';
        byId('contacts-owner').textContent = user.login;
        byId('admin-contact-search').value = '';
        byId('contacts-panel').classList.remove('hidden');
        await loadContacts();
        byId('contacts-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function loadContacts() {
        if (!state.contactsUser) return;
        const body = byId('admin-contacts-body');
        body.replaceChildren();
        byId('contacts-empty').hidden = true;
        try {
            const params = new URLSearchParams({ resource: 'contacts', userId: String(state.contactsUser.id), limit: '100', offset: '0' });
            if (state.contactQuery) params.set('q', state.contactQuery);
            const result = await request(`${API}?${params}`);
            const contacts = Array.isArray(result.contacts) ? result.contacts : [];
            contacts.forEach((contact) => {
                const row = document.createElement('tr');
                addCell(row, `${contact.FirstName || contact.firstName || ''} ${contact.LastName || contact.lastName || ''}`.trim());
                addCell(row, contact.Email || contact.email);
                addCell(row, contact.PhoneNumber || contact.phoneNumber || contact.Phone || contact.phone);
                body.append(row);
            });
            byId('contacts-empty').hidden = contacts.length > 0;
        } catch (error) { showMessage(error.message, 'error'); }
    }

    byId('user-search-bar').addEventListener('input', (event) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.query = event.target.value.trim();
            state.offset = 0;
            loadUsers();
        }, 300);
    });
    byId('user-search-clear').addEventListener('click', () => {
        byId('user-search-bar').value = '';
        state.query = '';
        state.offset = 0;
        loadUsers();
    });
    byId('page-prev').addEventListener('click', () => { state.offset = Math.max(0, state.offset - PAGE_SIZE); loadUsers(); });
    byId('page-next').addEventListener('click', () => { state.offset += PAGE_SIZE; loadUsers(); });
    byId('create-admin-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const payload = Object.fromEntries(data.entries());
        try {
            await request(`${API}?resource=users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            form.reset();
            showMessage('Admin account created.');
            state.offset = 0;
            await loadUsers();
        } catch (error) { showMessage(error.message, 'error'); }
    });
    byId('admin-contact-search').addEventListener('input', (event) => {
        clearTimeout(contactSearchTimer);
        contactSearchTimer = setTimeout(() => { state.contactQuery = event.target.value.trim(); loadContacts(); }, 300);
    });
    byId('contacts-close').addEventListener('click', () => {
        byId('contacts-panel').classList.add('hidden');
        state.contactsUser = null;
    });
    byId('logout-button').addEventListener('click', async () => {
        try {
            await fetch('api/index.php?logout=1', { method: 'POST' });
        } finally {
            sessionStorage.clear();
            window.location.assign('index.html');
        }
    });

    loadUsers();
})();
