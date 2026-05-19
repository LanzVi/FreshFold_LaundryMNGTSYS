/* app.js — Central Frontend Database & Routing State Engine */

// ── NAVIGATION SITE MAP SCHEMA ─────────────────────────────────────────
const ROUTE_MANIFEST = [
  { viewId: 'view-customer-dashboard', label: 'Book Appointment', roles: ['customer'] },
  { viewId: 'view-operations', label: 'Orders', roles: ['staff', 'admin'] },
  { viewId: 'view-system-management', label: 'Users', roles: ['admin'] }
];

const STAFF_ACCESS_SECRET = 'FRESHFOLD2025';

// ── CLIENT-SIDE LOCAL STORAGE VIRTUAL ENGINE DATA STORAGE ──────────────────
function getStore(key, defaultData) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultData;
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed Initial Local Core Setup Values if empty
let dbUsers = getStore('ff_users', [
  { id: 101, name: 'Owner', email: 'admin@freshfold.com', pass: 'admin123', role: 'admin' },
  { id: 102, name: 'Employee', email: 'staff@freshfold.com', pass: 'staff123', role: 'staff' },
  { id: 103, name: 'Customer', email: 'customer@freshfold.com', pass: 'customer123', role: 'customer' }
]);
let dbAppointments = getStore('ff_appointments', [
  { id: 1, txn: 'TXN-8821', userId: 103, name: 'Customer', svc: 'Wash & Fold', weight: 6, amount: 390, status: 'Pending' },
  { id: 1, txn: 'TXN-8821', userId: 103, name: 'Customer', svc: 'Wash & Fold', weight: 6, amount: 390, status: 'Pending' },
  { id: 2, txn: 'TXN-4119', userId: 103, name: 'Customer', svc: 'Dry Cleaning', weight: 2, amount: 360, status: 'Processing' }
]);
setStore('ff_users', dbUsers);
setStore('ff_appointments', dbAppointments);

let activeSessionUser = JSON.parse(localStorage.getItem('ff_active_session')) || null;
let currentSelectedRegisterRole = 'customer';

// ── VIEW ROUTER MUTATION CONTROLLER ──────────────────────────────────────
function navigateToView(targetViewId) {
  if (!activeSessionUser) {
    showAuthenticationLayout();
    return;
  }

  const targetedPageSection = document.getElementById(targetViewId);
  if (!targetedPageSection) return;

  // Evaluate permission clearances directly against active view configurations
  const structuralAllowedRoles = targetedPageSection.getAttribute('data-roles').split(',');
  if (!structuralAllowedRoles.includes(activeSessionUser.role)) {
    triggerToast('Authorization Error: Access Clearances Missing.', 'err');
    const defaultRoleFallbackView = activeSessionUser.role === 'customer' ? 'view-customer-dashboard' : 'view-operations';
    navigateToView(defaultRoleFallbackView);
    return;
  }

  // Clear tracking display visual selection classes
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(link => link.classList.remove('active'));

  // Trigger active layouts
  targetedPageSection.classList.add('active');
  const activeSidebarLink = document.getElementById(`nav-link-${targetViewId}`);
  if (activeSidebarLink) activeSidebarLink.classList.add('active');

  // Trigger internal dynamic data mutations render processes
  executeTargetViewLifecycleRender(targetViewId);
}

function showAuthenticationLayout() {
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
}

function showMainApplicationLayout() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  // Load identity view elements
  document.getElementById('user-display-name').textContent = activeSessionUser.name;
  document.getElementById('user-display-email').textContent = activeSessionUser.email;
  
  const labelBadge = document.getElementById('user-display-role');
  labelBadge.textContent = activeSessionUser.role;
  labelBadge.className = `sb-badge badge-${activeSessionUser.role}`;

  renderDynamicNavigationSidebar();

  const landingTargetRoute = activeSessionUser.role === 'customer' ? 'view-customer-dashboard' : 'view-operations';
  navigateToView(landingTargetRoute);
}

function renderDynamicNavigationSidebar() {
  const navContainer = document.getElementById('sidebar-navigation');
  navContainer.innerHTML = '';

  ROUTE_MANIFEST.forEach(route => {
    if (route.roles.includes(activeSessionUser.role)) {
      const navBtn = document.createElement('button');
      navBtn.className = 'sb-link';
      navBtn.id = `nav-link-${route.viewId}`;
      navBtn.textContent = route.label;
      navBtn.onclick = () => navigateToView(route.viewId);
      navContainer.appendChild(navBtn);
    }
  });
}

// ── RENDER COMPONENT CONTROLLERS ──────────────────────────────────────────
function executeTargetViewLifecycleRender(viewId) {
  const localApptsList = getStore('ff_appointments', []);
  const localUsersList = getStore('ff_users', []);

  if (viewId === 'view-customer-dashboard') {
    const userFilteredAppts = localApptsList.filter(a => a.userId === activeSessionUser.id);
    document.getElementById('m-cust-count').textContent = userFilteredAppts.length;
    document.getElementById('customer-welcome-heading').textContent = `Welcome back, ${activeSessionUser.name}`;

    const custTableBody = document.getElementById('cust-orders-tbody');
    custTableBody.innerHTML = userFilteredAppts.length ? '' : '<tr><td colspan="3" style="text-align:center; color:var(--muted);">No current orders booked.</td></tr>';
    
    userFilteredAppts.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `<td><b>${order.txn}</b></td><td>${order.svc} (${order.weight}kg)</td><td><span class="sb-badge badge-customer">${order.status}</span></td>`;
      custTableBody.appendChild(row);
    });
  }

  if (viewId === 'view-operations') {
    const operationsTableBody = document.getElementById('operations-table-body');
    operationsTableBody.innerHTML = localApptsList.length ? '' : '<tr><td colspan="5" style="text-align:center; color:var(--muted);">Operations tracking pipeline empty.</td></tr>';
    
    localApptsList.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><b>${order.txn}</b></td>
        <td>${order.name}</td>
        <td>${order.svc} — <b>${order.weight} kg</b></td>
        <td><span class="sb-badge badge-staff">${order.status}</span></td>
        <td>
          <button class="sm-btn" onclick="cycleOrderStatusStep('${order.txn}')">Advance Step</button>
        </td>
      `;
      operationsTableBody.appendChild(row);
    });
  }

  if (viewId === 'view-system-management') {
    const managementTableBody = document.getElementById('management-table-body');
    managementTableBody.innerHTML = '';
    
    localUsersList.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>#${user.id}</td>
        <td><b>${user.name}</b></td>
        <td>${user.email}</td>
        <td><span class="sb-badge badge-${user.role}">${user.role}</span></td>
        <td>
          <select style="padding: 4px; font-size:12px; width:auto;" onchange="updateUserAuthorizationRole(${user.id}, this.value)">
            <option value="">-- Shift Role --</option>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </td>
      `;
      managementTableBody.appendChild(row);
    });
  }
}

// ── LOGIC OPERATIONS & CONTROLLERS ACTION ACTIONS ───────────────────────────
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function selectRegisterRole(role) {
  currentSelectedRegisterRole = role;
  document.getElementById('chip-customer').classList.toggle('active', role === 'customer');
  document.getElementById('chip-staff').classList.toggle('active', role === 'staff');
  document.getElementById('staff-code-field').style.display = role === 'staff' ? 'block' : 'none';
}

function handleLogin() {
  const emailInput = document.getElementById('l-email').value.trim();
  const passInput = document.getElementById('l-pass').value;
  const currentUsers = getStore('ff_users', []);

  const verifiedUser = currentUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.pass === passInput);

  if (!verifiedUser) {
    triggerToast('Authentication failed: Invalid credentials configuration matching.', 'err');
    return;
  }

  activeSessionUser = verifiedUser;
  localStorage.setItem('ff_active_session', JSON.stringify(activeSessionUser));
  triggerToast(`Welcome back, ${activeSessionUser.name}.`);
  showMainApplicationLayout();
}

function handleRegister() {
  const fullName = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const pass = document.getElementById('r-pass').value;
  const currentUsers = getStore('ff_users', []);

  if (!fullName || !email || !pass) {
    triggerToast('Validation Error: Form text targets incomplete.', 'err');
    return;
  }

  if (currentUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    triggerToast('Data Matrix Conflict: Email address already mapped.', 'err');
    return;
  }

  if (currentSelectedRegisterRole === 'staff') {
    const inputCode = document.getElementById('r-staff-code').value;
    if (inputCode !== STAFF_ACCESS_SECRET) {
      triggerToast('Security Validation Rejection: Invalid infrastructure access code.', 'err');
      return;
    }
  }

  const newUserObject = {
    id: Date.now(),
    name: fullName,
    email: email,
    phone: phone,
    pass: pass,
    role: currentSelectedRegisterRole
  };

  currentUsers.push(newUserObject);
  setStore('ff_users', currentUsers);

  activeSessionUser = newUserObject;
  localStorage.setItem('ff_active_session', JSON.stringify(activeSessionUser));
  triggerToast('Registration execution finalized.');
  showMainApplicationLayout();
}

function handleLogout() {
  localStorage.removeItem('ff_active_session');
  activeSessionUser = null;
  triggerToast('Identity session context terminated.');
  showAuthenticationLayout();
}

function submitBooking() {
  const selectedSvc = document.getElementById('appt-service').value;
  const weightVal = parseFloat(document.getElementById('appt-weight').value) || 1;
  const currentAppts = getStore('ff_appointments', []);

  let ratePerKg = 65;
  if (selectedSvc === 'Dry Cleaning') ratePerKg = 180;
  if (selectedSvc === 'Ironing & Press') ratePerKg = 40;

  const apptTxnRef = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
  const newAppointment = {
    id: Date.now(),
    txn: apptTxnRef,
    userId: activeSessionUser.id,
    name: activeSessionUser.name,
    svc: selectedSvc,
    weight: weightVal,
    amount: weightVal * ratePerKg,
    status: 'Pending'
  };

  currentAppts.unshift(newAppointment);
  setStore('ff_appointments', currentAppts);
  triggerToast(`Order requested: Reference key ${apptTxnRef}`);
  executeTargetViewLifecycleRender('view-customer-dashboard');
}

function cycleOrderStatusStep(txnRef) {
  const currentAppts = getStore('ff_appointments', []);
  const targetIndex = currentAppts.findIndex(a => a.txn === txnRef);
  
  if (targetIndex !== -1) {
    const operationalCurrentStatus = currentAppts[targetIndex].status;
    let nextStatus = 'Processing';
    if (operationalCurrentStatus === 'Processing') nextStatus = 'Ready';
    if (operationalCurrentStatus === 'Ready') nextStatus = 'Picked Up';
    
    currentAppts[targetIndex].status = nextStatus;
    setStore('ff_appointments', currentAppts);
    triggerToast(`Order status updated to: ${nextStatus}`);
    executeTargetViewLifecycleRender('view-operations');
  }
}

function updateUserAuthorizationRole(userId, newRole) {
  if (!newRole) return;
  const currentUsers = getStore('ff_users', []);
  const targetIndex = currentUsers.findIndex(u => u.id === userId);

  if (targetIndex !== -1) {
    currentUsers[targetIndex].role = newRole;
    setStore('ff_users', currentUsers);
    triggerToast('Account role authorization record state modified.');
    executeTargetViewLifecycleRender('view-system-management');
  }
}

function triggerToast(messageText, stateVariant = 'ok') {
  const toastBox = document.getElementById('toast-wrapper');
  toastBox.textContent = messageText;
  toastBox.className = `toast show ${stateVariant}`;
  setTimeout(() => toastBox.classList.remove('show'), 3500);
}

// ── INITIALIZATION CYCLE RUN SYSTEM BOOTSTRAP ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (activeSessionUser) {
    showMainApplicationLayout();
  } else {
    showAuthenticationLayout();
  }
});