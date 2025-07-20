// ================================
// CONFIGURATION - UPDATE WITH YOUR SUPABASE DETAILS
// ================================
const CONFIG = {
    supabase: {
        url: 'https://iugwfmnfmulgxvaxjkwv.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z3dmbW5mbXVsZ3h2YXhqa3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU2MDIsImV4cCI6MjA2ODI5MTYwMn0.pUExanPG_BdTN11gtHg_cOubUkMOEv3n0a1mksLH_ZE',
        tableName: 'delivery_data'
    },
    adminPassword: 'qube2025'
};

// Sample data (will be replaced by database data)
let deliveryData = [
    { ticketId: '60210', orderReceived: '7/11/2025', type: 'Delivery', urgent: 'Yes', customer: 'Segi University', aging: 1 },
    { ticketId: '60521', orderReceived: '7/14/2025', type: 'Delivery', urgent: 'No', customer: 'Ingram', aging: 5 },
    { ticketId: '60570', orderReceived: '7/15/2025', type: 'Delivery', urgent: 'No', customer: 'Imazium', aging: 2 },
    { ticketId: '60572', orderReceived: '7/15/2025', type: 'Collection', urgent: 'No', customer: 'Evoscale', aging: 1 },
    { ticketId: '60574', orderReceived: '7/15/2025', type: 'Delivery', urgent: 'Yes', customer: 'Ginmaro', aging: 4 },
    { ticketId: '60584', orderReceived: '7/15/2025', type: 'Collection', urgent: 'No', customer: 'MLINK', aging: 2 },
    { ticketId: '60585', orderReceived: '7/15/2025', type: 'Collection', urgent: 'No', customer: 'Vstecs', aging: 3 },
    { ticketId: '60588', orderReceived: '7/15/2025', type: 'Delivery', urgent: 'No', customer: 'MR DIY HQ', aging: 1 },
    { ticketId: '60591', orderReceived: '7/15/2025', type: 'Collection', urgent: 'Yes', customer: 'PC Image', aging: 6 },
    { ticketId: '60620', orderReceived: '7/15/2025', type: 'Delivery', urgent: 'No', customer: 'PKT', aging: 2 }
];

let currentFilter = 'all';
let filteredData = [...deliveryData];

// ================================
// SUPABASE CLIENT
// ================================
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async query(method, endpoint, data = null) {
        const url = `${this.url}/rest/v1/${endpoint}`;
        console.log(`${method} ${url}`, data ? 'with data' : 'no data');
        
        const response = await fetch(url, {
            method,
            headers: this.headers,
            body: data ? JSON.stringify(data) : null
        });

        console.log(`Response: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const error = await response.text();
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${response.status} - ${error}`);
        }

        const result = await response.json();
        console.log('Response data:', result);
        return result;
    }

    // Get all delivery data
    async getDeliveryData() {
        try {
            const data = await this.query('GET', `${CONFIG.supabase.tableName}?select=*&order=created_at.desc`);
            console.log('Loaded delivery data:', data);
            return data || [];
        } catch (error) {
            console.error('Error getting delivery data:', error);
            return [];
        }
    }

    // Clear all existing data
    async clearDeliveryData() {
        try {
            await this.query('DELETE', `${CONFIG.supabase.tableName}?id=gte.1`);
            console.log('Cleared existing delivery data');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Save delivery data (replaces all data)
    async saveDeliveryData(data) {
        try {
            console.log('Saving delivery data:', data);
            
            // First, clear existing data
            await this.clearDeliveryData();
            
            // If no data to save, just update metadata
            if (!data || data.length === 0) {
                await this.updateMetadata(0);
                return true;
            }

            // Prepare records for database
            const records = data.map((item, index) => ({
                ticket_id: item.ticketId,
                order_received: item.orderReceived,
                type: item.type || '',
                urgent: item.urgent || 'No',
                customer: item.customer || '',
                aging: parseInt(item.aging) || 0,
                updated_by: 'Admin'
            }));

            console.log('Prepared records for database:', records);

            // Insert new data
            const result = await this.query('POST', CONFIG.supabase.tableName, records);
            console.log('Insert result:', result);

            // Update metadata
            await this.updateMetadata(data.length);

            return true;
        } catch (error) {
            console.error('Error saving delivery data:', error);
            throw error;
        }
    }

    // Get metadata (last update info)
    async getMetadata() {
        try {
            const result = await this.query('GET', 'delivery_metadata?select=*&order=id.desc&limit=1');
            const metadata = result && result.length > 0 ? result[0] : null;
            console.log('Loaded metadata:', metadata);
            return metadata || { 
                last_update: 'Never', 
                updated_by: 'System',
                total_records: 0
            };
        } catch (error) {
            console.error('Error getting metadata:', error);
            return { 
                last_update: 'Never', 
                updated_by: 'System',
                total_records: 0
            };
        }
    }

    // Update metadata
    async updateMetadata(recordCount = 0) {
        try {
            const metadata = {
                last_update: new Date().toLocaleString(),
                updated_by: 'Admin',
                total_records: recordCount,
                updated_at: new Date().toISOString()
            };

            console.log('Updating metadata:', metadata);

            // Try to update existing record with id=1
            try {
                const updateResult = await this.query('PATCH', 'delivery_metadata?id=eq.1', metadata);
                console.log('Metadata update result:', updateResult);
                
                // If no rows were updated, insert a new record
                if (!updateResult || updateResult.length === 0) {
                    const insertResult = await this.query('POST', 'delivery_metadata', [{ id: 1, ...metadata }]);
                    console.log('Metadata insert result:', insertResult);
                }
            } catch (updateError) {
                console.log('Update failed, trying insert:', updateError);
                // If update fails, try insert
                const insertResult = await this.query('POST', 'delivery_metadata', [{ id: 1, ...metadata }]);
                console.log('Metadata insert result:', insertResult);
            }

            return true;
        } catch (error) {
            console.error('Error updating metadata:', error);
            return false;
        }
    }
}

let supabase;

function initializeDatabase() {
    if (!CONFIG.supabase.url || CONFIG.supabase.url === 'YOUR_SUPABASE_URL') {
        throw new Error('Supabase URL not configured');
    }
    if (!CONFIG.supabase.key || CONFIG.supabase.key === 'YOUR_SUPABASE_ANON_KEY') {
        throw new Error('Supabase API key not configured');
    }

    supabase = new SupabaseClient(CONFIG.supabase.url, CONFIG.supabase.key);
}

// ================================
// DATABASE TEST FUNCTION
// ================================
async function testDatabaseConnection() {
    try {
        showMessage('🔧 Testing database connection...', 'info');

        initializeDatabase();

        // Test 1: Basic connection
        console.log('Test 1: Testing basic connection...');
        const testData = await supabase.query('GET', 'delivery_data?limit=1');
        console.log('✅ Basic connection works, got:', testData);

        // Test 2: Insert a test record
        console.log('Test 2: Testing insert...');
        const testRecord = {
            ticket_id: 'TEST123',
            order_received: '01/01/2025',
            type: 'Test',
            urgent: 'No',
            customer: 'Test Customer',
            aging: 1,
            updated_by: 'Test'
        };

        const insertResult = await supabase.query('POST', 'delivery_data', [testRecord]);
        console.log('✅ Insert works, got:', insertResult);

        // Test 3: Read the data back
        console.log('Test 3: Testing read...');
        const readResult = await supabase.query('GET', 'delivery_data?ticket_id=eq.TEST123');
        console.log('✅ Read works, got:', readResult);

        // Test 4: Delete the test record
        console.log('Test 4: Testing delete...');
        const deleteResult = await supabase.query('DELETE', 'delivery_data?ticket_id=eq.TEST123');
        console.log('✅ Delete works, got:', deleteResult);

        showMessage('✅ Database connection test successful! All operations work.', 'success');

        return true;

    } catch (error) {
        console.error('❌ Database test failed:', error);
        showMessage(`❌ Database test failed: ${error.message}<br><br>
            <strong>Common issues:</strong><br>
            • Wrong Supabase URL or API key<br>
            • Tables don't exist<br>
            • Row Level Security is enabled<br>
            • Network connectivity issues`, 'error');

        return false;
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================
function showMessage(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

function updateStats() {
    const stats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalPending = 0;
    let urgentCount = 0;
    
    deliveryData.forEach(item => {
        if (item.aging !== undefined && item.aging >= 0) {
            // Convert aging to display aging (aging 1 = same day, aging 2 = 1 day, etc.)
            const displayAging = Math.max(0, item.aging - 1);
            
            if (displayAging <= 3) {
                stats[displayAging]++;
            } else {
                stats[4]++;
            }
            totalPending++;
        }
        if (item.urgent && item.urgent.toLowerCase() === 'yes') {
            urgentCount++;
        }
    });

    document.getElementById('count-0').textContent = stats[0];
    document.getElementById('count-1').textContent = stats[1];
    document.getElementById('count-2').textContent = stats[2];
    document.getElementById('count-3').textContent = stats[3];
    document.getElementById('count-4').textContent = stats[4];
    document.getElementById('urgent-count').textContent = urgentCount;
    document.getElementById('total-count').textContent = totalPending;
}

// ================================
// DATA RENDERING
// ================================
function getAgingBadge(aging) {
    // Convert aging to display aging (aging 1 = same day, aging 2 = 1 day, etc.)
    const displayAging = Math.max(0, aging - 1);
    
    if (displayAging === 0) {
        return `<span class="badge badge-aging-0">Same Day</span>`;
    } else if (displayAging <= 3) {
        return `<span class="badge badge-aging-${displayAging}">${displayAging} Day${displayAging > 1 ? 's' : ''}</span>`;
    } else {
        return `<span class="badge badge-aging-4">${displayAging} Days</span>`;
    }
}

function getPriority(item) {
    const displayAging = Math.max(0, item.aging - 1);
    
    if (item.urgent === 'Yes' && displayAging > 3) {
        return { class: 'critical', text: 'Critical' };
    } else if (item.urgent === 'Yes' || displayAging > 3) {
        return { class: 'high', text: 'High' };
    } else if (displayAging === 3) {
        return { class: 'medium', text: 'Medium' };
    } else {
        return { class: 'low', text: 'Low' };
    }
}

function getActionRequired(item) {
    const displayAging = Math.max(0, item.aging - 1);
    
    if (item.urgent === 'Yes' && displayAging > 3) {
        return { class: 'urgent', text: 'Urgent' };
    } else if (displayAging > 3) {
        return { class: 'urgent', text: 'Overdue' };
    } else if (displayAging === 3) {
        return { class: 'today', text: 'Today' };
    } else if (displayAging === 2) {
        return { class: 'tomorrow', text: 'Tomorrow' };
    } else if (displayAging === 1) {
        return { class: 'scheduled', text: 'Plan Ahead' };
    } else {
        return { class: 'scheduled', text: 'Same Day' };
    }
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No pending tickets found</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => {
        const priority = getPriority(item);
        const action = getActionRequired(item);
        const customerName = (item.customer || '').toUpperCase();
        
        return `
            <tr>
                <td>
                    <div class="ticket-info">
                        <div class="ticket-main"><strong>${item.ticketId}</strong> - ${customerName}</div>
                        <div class="ticket-details">[${item.type || 'N/A'}]</div>
                    </div>
                </td>
                <td>${item.orderReceived}</td>
                <td>${item.urgent === 'Yes' ? '<span class="badge badge-urgent">URGENT</span>' : item.urgent}</td>
                <td>${getAgingBadge(item.aging)}</td>
                <td><span class="badge badge-priority-${priority.class}">${priority.text}</span></td>
                <td><span class="badge badge-priority-${action.class}">${action.text}</span></td>
            </tr>
        `;
    }).join('');
}

function updateReminders(data = deliveryData) {
    const reminderContent = document.getElementById('reminderContent');
    
    // Convert aging to display aging for reminders
    const overdueTickets = data.filter(item => (item.aging - 1) > 3);
    const todayTickets = data.filter(item => (item.aging - 1) === 3);
    const tomorrowTickets = data.filter(item => (item.aging - 1) === 2);
    const sameDayTickets = data.filter(item => (item.aging - 1) === 0);
    const urgentTickets = data.filter(item => item.urgent === 'Yes');
    
    let html = '';
    
    if (overdueTickets.length > 0) {
        html += `
            <div class="reminder-section">
                <div class="reminder-title">
                    🚨 <span style="color: #e74c3c;">OVERDUE - Complete Immediately</span>
                </div>
                <ul class="reminder-list">
                    ${overdueTickets.map(item => `
                        <li class="reminder-item">
                            <div>
                                <strong>${item.ticketId}</strong> - ${(item.customer || '').toUpperCase()} [${item.type}]
                                <br><small style="color: #666;">Aging: ${Math.max(0, item.aging - 1)} days</small>
                            </div>
                            <span class="badge badge-urgent">URGENT</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    if (todayTickets.length > 0) {
        html += `
            <div class="reminder-section">
                <div class="reminder-title">
                    📅 <span style="color: #f39c12;">Complete Today (Day 3 - Last Day)</span>
                </div>
                <ul class="reminder-list">
                    ${todayTickets.map(item => `
                        <li class="reminder-item">
                            <div>
                                <strong>${item.ticketId}</strong> - ${(item.customer || '').toUpperCase()} [${item.type}]
                                ${item.urgent === 'Yes' ? '<span class="badge badge-urgent" style="margin-left: 10px;">URGENT</span>' : ''}
                            </div>
                            <span class="badge badge-aging-3">TODAY</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    if (tomorrowTickets.length > 0) {
        html += `
            <div class="reminder-section">
                <div class="reminder-title">
                    📋 <span style="color: #3b82f6;">Plan for Tomorrow (Day 2)</span>
                </div>
                <ul class="reminder-list">
                    ${tomorrowTickets.map(item => `
                        <li class="reminder-item">
                            <div>
                                <strong>${item.ticketId}</strong> - ${(item.customer || '').toUpperCase()} [${item.type}]
                                ${item.urgent === 'Yes' ? '<span class="badge badge-urgent" style="margin-left: 10px;">URGENT</span>' : ''}
                            </div>
                            <span class="badge badge-aging-2">TOMORROW</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    if (sameDayTickets.length > 0) {
        html += `
            <div class="reminder-section">
                <div class="reminder-title">
                    🆕 <span style="color: #3b82f6;">Same Day Tickets (Just Created)</span>
                </div>
                <ul class="reminder-list">
                    ${sameDayTickets.map(item => `
                        <li class="reminder-item">
                            <div>
                                <strong>${item.ticketId}</strong> - ${(item.customer || '').toUpperCase()} [${item.type}]
                                ${item.urgent === 'Yes' ? '<span class="badge badge-urgent" style="margin-left: 10px;">URGENT</span>' : ''}
                            </div>
                            <span class="badge badge-aging-0">SAME DAY</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    if (urgentTickets.length > 0) {
        html += `
            <div class="reminder-section">
                <div class="reminder-title">
                    ⚠️ <span style="color: #e74c3c;">All Urgent Items Priority</span>
                </div>
                <ul class="reminder-list">
                    ${urgentTickets.map(item => `
                        <li class="reminder-item">
                            <div>
                                <strong>${item.ticketId}</strong> - ${(item.customer || '').toUpperCase()} [${item.type}]
                                <br><small style="color: #666;">Aging: ${Math.max(0, item.aging - 1)} days - Priority delivery required</small>
                            </div>
                            <span class="badge badge-urgent">URGENT</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    const totalTickets = data.length;
    const onTimeTickets = data.filter(item => (item.aging - 1) <= 3).length;
    const performanceRate = totalTickets > 0 ? Math.round((onTimeTickets / totalTickets) * 100) : 100;
    
    html += `
        <div class="reminder-section">
            <div class="reminder-title">
                📊 <span style="color: #1e3c72;">Performance Summary</span>
            </div>
            <div class="performance-grid">
                <div class="performance-card">
                    <div class="performance-number" style="color: ${performanceRate >= 80 ? '#27ae60' : performanceRate >= 60 ? '#f39c12' : '#e74c3c'};">${performanceRate}%</div>
                    <div class="performance-label">On-time Performance</div>
                </div>
                <div class="performance-card">
                    <div class="performance-number" style="color: #e74c3c;">${overdueTickets.length}</div>
                    <div class="performance-label">Overdue Items</div>
                </div>
                <div class="performance-card">
                    <div class="performance-number" style="color: #f39c12;">${todayTickets.length}</div>
                    <div class="performance-label">Due Today</div>
                </div>
                <div class="performance-card">
                    <div class="performance-number" style="color: #3b82f6;">${tomorrowTickets.length}</div>
                    <div class="performance-label">Due Tomorrow</div>
                </div>
                <div class="performance-card">
                    <div class="performance-number" style="color: #3b82f6;">${sameDayTickets.length}</div>
                    <div class="performance-label">Same Day</div>
                </div>
            </div>
        </div>
    `;
    
    if (html === '') {
        html = `
            <div style="text-align: center; color: #27ae60; padding: 20px;">
                ✅ <strong>Great job!</strong> No pending deliveries found.
            </div>
        `;
    }
    
    reminderContent.innerHTML = html;
}

// ================================
// FILTERING
// ================================
function applyFilters() {
    let filtered = [...deliveryData];

    // Filter out items with invalid aging
    filtered = filtered.filter(item => item.aging !== undefined && item.aging >= 1);

    // Apply current filter
    if (currentFilter === 'urgent') {
        filtered = filtered.filter(item => item.urgent && item.urgent.toLowerCase() === 'yes');
    } else if (currentFilter !== 'all') {
        const displayAging = parseInt(currentFilter);
        if (displayAging === 0) {
            // Same day tickets (aging 1 in data = same day display)
            filtered = filtered.filter(item => (item.aging - 1) === 0);
        } else if (displayAging === 4) {
            // > 3 days aging
            filtered = filtered.filter(item => (item.aging - 1) > 3);
        } else {
            // Specific aging days
            filtered = filtered.filter(item => (item.aging - 1) === displayAging);
        }
    }

    // Apply search
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.ticketId.toLowerCase().includes(searchTerm) ||
            item.customer.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm)
        );
    }

    filteredData = filtered;
    renderTable(filteredData);
    updateReminders(filtered);
}

// ================================
// DATABASE INTEGRATION
// ================================
async function loadDataFromDatabase() {
    try {
        showMessage('🔄 Loading latest data from database...', 'info');
        
        initializeDatabase();
        
        console.log('Loading data from database...');
        const [data, metadata] = await Promise.all([
            supabase.getDeliveryData(),
            supabase.getMetadata()
        ]);
        
        console.log('Raw data from database:', data);
        console.log('Metadata from database:', metadata);
        
        // Convert back to original format
        if (data && data.length > 0) {
            deliveryData = data.map(item => ({
                ticketId: item.ticket_id,
                orderReceived: item.order_received,
                type: item.type,
                urgent: item.urgent,
                customer: item.customer,
                aging: item.aging
            }));
            
            console.log('Converted delivery data:', deliveryData);
            
            showMessage(`✅ Data loaded successfully (${deliveryData.length} records, Last update: ${metadata.last_update})`, 'success');
        } else {
            deliveryData = [];
            showMessage(`ℹ️ No data found in database (Last update: ${metadata.last_update})`, 'info');
        }
        
        updateStats();
        applyFilters();
        
        return true;
    } catch (error) {
        console.error('Error loading data from database:', error);
        showMessage(`❌ Could not load data from database: ${error.message}`, 'error');
        
        // Keep existing sample data as fallback
        console.log('Using fallback sample data');
        updateStats();
        applyFilters();
        
        return false;
    }
}

async function uploadData(data) {
    try {
        showMessage('📤 Uploading data to database...', 'info');
        
        initializeDatabase();
        
        console.log('Uploading data to database:', data);
        
        const { error } = await supabase
            .from(CONFIG.supabase.tableName)
            .upsert(data, { onConflict: 'ticket_id' });

        if (error) {
            throw error;
        }
        
        console.log('Data uploaded successfully');
        showMessage('✅ Data uploaded successfully! All users will see the update.', 'success');
        
        // Immediately reload to verify the save worked
        setTimeout(async () => {
            await loadDataFromDatabase();
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error('Error uploading data to database:', error);
        showMessage(`❌ Failed to upload data: ${error.message}`, 'error');
        return false;
    }
}

// ================================
// FILE PROCESSING
// ================================

// Convert Excel serial number to proper date
function convertExcelDate(serialNumber) {
    if (!serialNumber || isNaN(serialNumber)) {
        return serialNumber; // Return original if not a number
    }
    
    // Excel epoch starts from January 1, 1900 (but Excel incorrectly treats 1900 as a leap year)
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const days = parseInt(serialNumber);
    const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
    
    console.log('CSV Headers found:', headers);
    
    const findColumn = (possibleNames) => {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };
    
    const ticketIdCol = findColumn(['Ticket ID', 'TicketID', 'Ticket', 'TICKET ID']) !== -1 ? findColumn(['Ticket ID', 'TicketID', 'Ticket', 'TICKET ID']) : 0;
    const orderReceivedCol = findColumn(['Order Received', 'OrderReceived', 'Date', 'ORDER RECEIVED']) !== -1 ? findColumn(['Order Received', 'OrderReceived', 'Date', 'ORDER RECEIVED']) : 1;
    const typeCol = findColumn(['Type', 'Service Type', 'TYPE']) !== -1 ? findColumn(['Type', 'Service Type', 'TYPE']) : 2;
    const urgentCol = findColumn(['Urgent', 'Urgent?', 'URGENT?']) !== -1 ? findColumn(['Urgent', 'Urgent?', 'URGENT?']) : 3;
    const customerCol = findColumn(['Customer', 'Client', 'CUSTOMER']) !== -1 ? findColumn(['Customer', 'Client', 'CUSTOMER']) : 4;
    const agingCol = findColumn(['Aging', 'AGING']) !== -1 ? findColumn(['Aging', 'AGING']) : 5;
    
    console.log('Column mapping:', {
        ticketId: ticketIdCol,
        orderReceived: orderReceivedCol,
        type: typeCol,
        urgent: urgentCol,
        customer: customerCol,
        aging: agingCol
    });
    
    return rows.map(row => {
        const cols = row.split(',').map(c => c.trim().replace(/"/g, ''));
        const aging = parseInt(cols[agingCol]) || 0;
        const rawDate = cols[orderReceivedCol] || '';
        
        // Convert Excel serial number to proper date
        const convertedDate = convertExcelDate(rawDate);
        
        return {
            ticketId: cols[ticketIdCol] || '',
            orderReceived: convertedDate,
            type: cols[typeCol] || '',
            urgent: cols[urgentCol] || 'No',
            customer: cols[customerCol] || '',
            aging: aging
        };
    }).filter(item => item.ticketId && item.ticketId.toString().trim() !== '' && item.aging >= 1);
}

function parseExcel(arrayBuffer) {
    const XLSX = window.XLSX;
    if (!XLSX) {
        throw new Error('Excel library not loaded');
    }
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(sheet, { 
        header: 1, 
        raw: false,
        defval: ''
    });
    
    if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
    }
    
    const headers = jsonData[0];
    const rows = jsonData.slice(1);
    
    console.log('Excel Headers found:', headers);
    
    const findColumn = (possibleNames) => {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };
    
    const ticketIdCol = findColumn(['Ticket ID', 'TicketID', 'Ticket', 'TICKET ID']) !== -1 ? findColumn(['Ticket ID', 'TicketID', 'Ticket', 'TICKET ID']) : 0;
    const orderReceivedCol = findColumn(['Order Received', 'OrderReceived', 'Date', 'ORDER RECEIVED']) !== -1 ? findColumn(['Order Received', 'OrderReceived', 'Date', 'ORDER RECEIVED']) : 1;
    const typeCol = findColumn(['Type', 'Service Type', 'TYPE']) !== -1 ? findColumn(['Type', 'Service Type', 'TYPE']) : 2;
    const urgentCol = findColumn(['Urgent', 'Urgent?', 'URGENT?']) !== -1 ? findColumn(['Urgent', 'Urgent?', 'URGENT?']) : 3;
    const customerCol = findColumn(['Customer', 'Client', 'CUSTOMER']) !== -1 ? findColumn(['Customer', 'Client', 'CUSTOMER']) : 4;
    const agingCol = findColumn(['Aging', 'AGING']) !== -1 ? findColumn(['Aging', 'AGING']) : 5;
    
    console.log('Column mapping:', {
        ticketId: ticketIdCol,
        orderReceived: orderReceivedCol,
        type: typeCol,
        urgent: urgentCol,
        customer: customerCol,
        aging: agingCol
    });
    
    return rows.map(row => {
        const aging = parseInt(row[agingCol]) || 0;
        const rawDate = row[orderReceivedCol] || '';
        
        // Convert Excel serial number to proper date
        const convertedDate = convertExcelDate(rawDate);
        
        return {
            ticketId: row[ticketIdCol] || '',
            orderReceived: convertedDate,
            type: row[typeCol] || '',
            urgent: row[urgentCol] || 'No',
            customer: row[customerCol] || '',
            aging: aging
        };
    }).filter(item => item.ticketId && item.ticketId.toString().trim() !== '' && item.aging >= 1);
}

async function processFile(file) {
    showMessage('Reading file...', 'info');
    
    try {
        const fileName = file.name.toLowerCase();
        let parsedData;
        
        if (fileName.endsWith('.csv')) {
            const text = await file.text();
            parsedData = parseCSV(text);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            const arrayBuffer = await file.arrayBuffer();
            parsedData = parseExcel(arrayBuffer);
        } else {
            throw new Error('Unsupported file format. Please use .xlsx, .xls, or .csv files.');
        }

        const dataToUpload = parsedData.map(item => ({
            ticket_id: item.ticketId,
            order_received: item.orderReceived,
            type: item.type,
            urgent: item.urgent,
            customer: item.customer,
            aging: item.aging
        }));
        
        const uploaded = await uploadData(dataToUpload);
        
        if (uploaded) {
            await loadDataFromDatabase();
        }
        
    } catch (error) {
        console.error('Error processing file:', error);
        showMessage(`❌ Error processing file: ${error.message}`, 'error');
    }
}

// ================================
// EVENT HANDLERS
// ================================
function initializeEventHandlers() {
    // Admin upload button
    document.getElementById('adminBtn').addEventListener('click', function() {
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('adminPassword').focus();
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', async function() {
        await loadDataFromDatabase();
    });

    // Test database button
    document.getElementById('testBtn').addEventListener('click', async function() {
        await testDatabaseConnection();
    });

    // Modal buttons
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    });

    document.getElementById('accessBtn').addEventListener('click', function() {
        const enteredPassword = document.getElementById('adminPassword').value;
        
        if (enteredPassword === CONFIG.adminPassword) {
            document.getElementById('passwordModal').style.display = 'none';
            document.getElementById('adminPassword').value = '';
            document.getElementById('fileInput').click();
        } else {
            alert('❌ Incorrect password. Access denied.');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    });

    // File input
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    });

    // Search box
    document.getElementById('searchBox').addEventListener('input', applyFilters);

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter
            currentFilter = this.getAttribute('data-filter');
            applyFilters();
        });
    });

    // Keyboard support for modal
    document.addEventListener('keydown', function(event) {
        const modal = document.getElementById('passwordModal');
        if (modal.style.display === 'flex') {
            if (event.key === 'Enter') {
                document.getElementById('accessBtn').click();
            }
            if (event.key === 'Escape') {
                document.getElementById('cancelBtn').click();
            }
        }
    });
}

// ================================
// CONFIGURATION CHECKER
// ================================
function checkConfiguration() {
    const issues = [];
    
    if (!CONFIG.supabase.url || CONFIG.supabase.url === 'YOUR_SUPABASE_URL') {
        issues.push('Supabase URL not set');
    }
    
    if (!CONFIG.supabase.key || CONFIG.supabase.key === 'YOUR_SUPABASE_ANON_KEY') {
        issues.push('Supabase API key not set');
    }
    
    if (!CONFIG.supabase.tableName || CONFIG.supabase.tableName === 'YOUR_TABLE_NAME') {
        issues.push('Table name not set');
    }
    
    return issues;
}

// ================================
// THEME SWITCHER
// ================================
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('themeToggle');

    // Set initial theme based on saved preference or system setting
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.checked = false;
    }

    // Handle theme toggle
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Listen for changes in system color scheme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.checked = false;
            localStorage.setItem('theme', 'light');
        }
    });
}

// ================================
// INITIALIZATION
// ================================
async function initialize() {
    // Initialize event handlers
    initializeEventHandlers();
    initializeThemeSwitcher();
    
    // Check configuration
    const configIssues = checkConfiguration();
    
    if (configIssues.length > 0) {
        showMessage(`⚠️ <strong>Configuration Required:</strong><br><br>
            Please update the CONFIG section in your code:<br>
            • ${configIssues.join('<br>• ')}<br><br>
            <strong>Find this section at the top of the script:</strong><br>
            <code>const CONFIG = { supabase: { ... } }</code><br><br>
            <strong>For now, using sample data.</strong>`, 'error');
        
        // Use sample data
        updateStats();
        renderTable(deliveryData);
        updateReminders();
        return;
    }
    
    // Try to load data from database
    const loadSuccess = await loadDataFromDatabase();
    
    if (!loadSuccess) {
        // Initialize with sample data
        updateStats();
        renderTable(deliveryData);
        updateReminders();
    }
}

// Auto-refresh every 30 seconds
setInterval(async () => {
    await loadDataFromDatabase();
}, 30000);

// Start the application
document.addEventListener('DOMContentLoaded', initialize);