/* app.js */

// ── INITIAL SYSTEM STATE MOCK ──────────────────────────────────────────
const SYSTEM_ROUTER_LINKS = [
  { viewId: 'view-customer-dashboard', label: '✨ Customer Booking', roles: ['customer'] },
  { viewId: 'view-operations', label: '🔧 Laundry Queue Operations', roles: ['staff', 'admin'] },
  { viewId: 'view-system-management', label: '👑 Core System Admin', roles: ['admin'] }
];

let globalActiveUser = JSON.parse(localStorage.getItem('ff_session')) || null;
let activeRegisterRole = 'customer';

// Mock DB Cache values to maintain isolated local testing runtime
let localOrders = JSON.parse(localStorage.getItem('ff_orders')) || [
  { txn: 'TXN-1001', name: 'Juan Dela Cruz', svc: 'Wash & Fold', status: 'Pending' },
  { txn: 'TXN-1002', name: 'Ana Reyes', svc: 'Dry Cleaning', status: 'Processing' }
];

// ── CORE SINGLE PAGE APPLICATION ROUTING ENGINE ────────────────────────
function navigateToView(targetViewId) {
  if (!globalActiveUser) {
    showAuthLayout();
    return;
  }

  const targetedViewElement = document.getElementById(targetViewId);
  if (!targetedViewElement) return;

  // Assert view permission validation parameters
  const targetAllowedRoles = targetedViewElement.getAttribute('data-roles').split(',');
  if (!targetAllowedRoles.includes(globalActiveUser.role)) {
    triggerToast('Access Denied: Missing authorization clearances.', 'err');
    // Default fallback routing redirect based on role assignment
    const defaultRoute = globalActiveUser.role === 'customer' ? 'view-customer-dashboard' : 'view-operations';
    navigateToView(defaultRoute);
    return;
  }

  // Deactivate all matching page sections across the document flow
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));

  // Toggle active styling triggers
  targetedViewElement.classList.add('active');
  const contextNavLink = document.getElementById(`nav-link-${targetViewId}`);
  if (contextNavLink) contextNavLink.classList.add('active');

  // Trigger contextual presentation view hooks
  executeViewRenderLifecycle(targetViewId);
}

function showAuthLayout() {
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
}

function showMainApplicationLayout() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  
  // Render user metadata panel elements
  document.getElementById('user-display-name').textContent = globalActiveUser.name;
  document.getElementById('user-display-email').textContent = globalActiveUser.email;
  
  const roleBadge = document.getElementById('user-display-role');
  roleBadge.textContent = globalActiveUser.role.toUpperCase();
  roleBadge.className = `sb-badge badge-${globalActiveUser.role}`;

  renderNavigationSidebar();
  
  // Route initial user access path securely
  const primaryInitialView = globalActiveUser.role === 'customer' ? 'view-customer-dashboard' : 'view-operations';
  navigateToView(primaryInitialView);
}

// ── RENDER ENGINE MUTATIONS ────────────────────────────────────────────
function renderNavigationSidebar() {
  const navContainer = document.getElementById('sidebar-navigation');
  navContainer.innerHTML = '';

  SYSTEM_ROUTER_LINKS.forEach(linkItem => {
    if (linkItem.roles.includes(globalActiveUser.role)) {
      const btn = document.createElement('button');
      btn.className = 'sb-link';
      btn.id = `nav-link-${linkItem.viewId}`;
      btn.textContent = linkItem.label;
      btn.onclick = () => navigateToView(linkItem.viewId);
      navContainer.appendChild(btn);
    }
  });
}

function executeViewRenderLifecycle(viewId) {
  if (viewId === 'view-operations') {
    const tbody = document.getElementById('operations-table-body');
    tbody.innerHTML = '';
    localOrders.forEach((order, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><b>${order.txn}</b></td>
        <td>${order.name}</td>
        <td>${order.svc}</td>
        <td><span class="badge b-pending">${order.status}</span></td>
        <td>
          <button class="sm-btn sm-blue" onclick="progressOrderState(${idx})">Progress Step</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
}

// ── CONTROLLER ACTIONS & STATE HANDLERS ────────────────────────────────
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function selectRegisterRole(role) {
  activeRegisterRole = role;
  document.getElementById('chip-customer').classList.toggle('active', role === 'customer');
  document.getElementById('chip-staff').classList.toggle('active', role === 'staff');
  document.getElementById('staff-code-field').style.display = role === 'staff' ? 'block' : 'none';
}

function handleLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass = document.getElementById('l-pass').value;

  if (!email || !pass) {
    triggerToast('Please provide valid verification tokens.', 'err');
    return;
  }

  // Handle core system testing configurations
  if (email.includes('owner') || email.includes('admin')) {
    globalActiveUser = { name: 'Admin Master', email: email, role: 'admin' };
  } else if (email.includes('staff')) {
    globalActiveUser = { name: 'Operator Agent', email: email, role: 'staff' };
  } else {
    globalActiveUser = { name: 'Valued Client', email: email, role: 'customer' };
  }

  localStorage.setItem('ff_session', JSON.stringify(globalActiveUser));
  triggerToast('Authentication profile mapped successfully.', 'ok');
  showMainApplicationLayout();
}

function handleRegister() {
  const name = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  
  if (activeRegisterRole === 'staff' && document.getElementById('r-staff-code').value !== 'FRESHFOLD2025') {
    triggerToast('Invalid deployment infrastructure secret access key.', 'err');
    return;
  }

  globalActiveUser = { name: name || 'New User Account', email: email, role: activeRegisterRole };
  localStorage.setItem('ff_session', JSON.stringify(globalActiveUser));
  showMainApplicationLayout();
}

function handleLogout() {
  localStorage.removeItem('ff_session');
  globalActiveUser = null;
  showAuthLayout();
}

function submitBooking() {
  const selectedService = document.getElementById('appt-service').value;
  const newOrder = {
    txn: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
    name: globalActiveUser.name,
    svc: selectedService,
    status: 'Pending'
  };
  
  localOrders.unshift(newOrder);
  localStorage.setItem('ff_orders', JSON.stringify(localOrders));
  triggerToast(`Booking registration generated: ${newOrder.txn}`, 'ok');
}

function progressOrderState(index) {
  localOrders[index].status = 'Processing';
  localStorage.setItem('ff_orders', JSON.stringify(localOrders));
  triggerToast('Internal operations state machine incremented.', 'ok');
  executeViewRenderLifecycle('view-operations');
}

function triggerToast(msg, variant = 'ok') {
  const container = document.getElementById('toast-wrapper');
  container.textContent = msg;
  container.className = `toast show ${variant}`;
  setTimeout(() => container.classList.remove('show'), 4000);
}

// ── INITIALIZATION ENTRY HOOK ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (globalActiveUser) {
    showMainApplicationLayout();
  } else {
    showAuthLayout();
  }
});