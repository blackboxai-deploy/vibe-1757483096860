// Main Vue.js Application
const { createApp, ref, reactive, onMounted, computed } = Vue;

const PayrollApp = {
    setup() {
        // Application state
        const loading = ref(true);
        const isAuthenticated = ref(false);
        const authLoading = ref(false);
        const currentView = ref('dashboard');
        
        // User data
        const user = ref({
            id: null,
            name: 'Admin User',
            email: 'admin@payroll.com',
            role: 'Administrator'
        });

        // Application data
        const employees = ref([]);
        const payrollRecords = ref([]);
        const attendanceRecords = ref([]);
        const dashboardStats = ref({
            totalEmployees: 0,
            totalPayroll: 0,
            pendingPayrolls: 0,
            presentToday: 0
        });

        // Modal state
        const showModal = ref(false);
        const modalTitle = ref('');
        const modalContent = ref('');
        const modalAction = ref(null);

        // Toast notifications
        const toasts = ref([]);
        let toastIdCounter = 0;

        // Computed properties
        const getCurrentDate = () => {
            return new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const getCurrentTime = () => {
            return new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getViewDescription = () => {
            const descriptions = {
                dashboard: 'Overview of your payroll system',
                employees: 'Manage employee information and profiles',
                payroll: 'Process payments and manage salary calculations',
                attendance: 'Track employee attendance and working hours',
                reports: 'Generate reports and analytics'
            };
            return descriptions[currentView.value] || '';
        };

        // Authentication methods
        const handleLogin = async (credentials) => {
            authLoading.value = true;
            try {
                const response = await API.login(credentials);
                if (response.success) {
                    isAuthenticated.value = true;
                    user.value = response.user;
                    showToast('Login successful!', 'success');
                    await loadInitialData();
                } else {
                    showToast(response.message || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('Login failed. Please try again.', 'error');
            } finally {
                authLoading.value = false;
            }
        };

        const logout = () => {
            showModal.value = true;
            modalTitle.value = 'Confirm Logout';
            modalContent.value = 'Are you sure you want to logout?';
            modalAction.value = () => {
                isAuthenticated.value = false;
                user.value = { id: null, name: '', email: '', role: '' };
                currentView.value = 'dashboard';
                employees.value = [];
                payrollRecords.value = [];
                attendanceRecords.value = [];
                closeModal();
                showToast('Logged out successfully', 'success');
            };
        };

        // Data loading methods
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    loadEmployees(),
                    loadPayrollRecords(),
                    loadAttendanceRecords(),
                    loadDashboardStats()
                ]);
            } catch (error) {
                console.error('Error loading initial data:', error);
                showToast('Error loading data', 'error');
            }
        };

        const loadEmployees = async () => {
            try {
                const response = await API.getEmployees();
                if (response.success) {
                    employees.value = response.data;
                }
            } catch (error) {
                console.error('Error loading employees:', error);
                showToast('Error loading employees', 'error');
            }
        };

        const loadPayrollRecords = async () => {
            try {
                const response = await API.getPayrollRecords();
                if (response.success) {
                    payrollRecords.value = response.data;
                }
            } catch (error) {
                console.error('Error loading payroll records:', error);
                showToast('Error loading payroll records', 'error');
            }
        };

        const loadAttendanceRecords = async () => {
            try {
                const response = await API.getAttendanceRecords();
                if (response.success) {
                    attendanceRecords.value = response.data;
                }
            } catch (error) {
                console.error('Error loading attendance records:', error);
                showToast('Error loading attendance records', 'error');
            }
        };

        const loadDashboardStats = async () => {
            try {
                const response = await API.getDashboardStats();
                if (response.success) {
                    dashboardStats.value = response.data;
                }
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
                // Set default stats if API fails
                dashboardStats.value = {
                    totalEmployees: employees.value.length,
                    totalPayroll: payrollRecords.value.reduce((sum, record) => sum + record.amount, 0),
                    pendingPayrolls: payrollRecords.value.filter(record => record.status === 'pending').length,
                    presentToday: attendanceRecords.value.filter(record => 
                        record.date === new Date().toISOString().split('T')[0] && record.status === 'present'
                    ).length
                };
            }
        };

        // Employee management methods
        const addEmployee = async (employeeData) => {
            try {
                const response = await API.createEmployee(employeeData);
                if (response.success) {
                    employees.value.push(response.data);
                    showToast('Employee added successfully!', 'success');
                    await loadDashboardStats();
                } else {
                    showToast(response.message || 'Error adding employee', 'error');
                }
            } catch (error) {
                console.error('Error adding employee:', error);
                showToast('Error adding employee', 'error');
            }
        };

        const editEmployee = async (employeeData) => {
            try {
                const response = await API.updateEmployee(employeeData.id, employeeData);
                if (response.success) {
                    const index = employees.value.findIndex(emp => emp.id === employeeData.id);
                    if (index !== -1) {
                        employees.value[index] = response.data;
                    }
                    showToast('Employee updated successfully!', 'success');
                } else {
                    showToast(response.message || 'Error updating employee', 'error');
                }
            } catch (error) {
                console.error('Error updating employee:', error);
                showToast('Error updating employee', 'error');
            }
        };

        const deleteEmployee = async (employeeId) => {
            showModal.value = true;
            modalTitle.value = 'Confirm Delete';
            modalContent.value = 'Are you sure you want to delete this employee? This action cannot be undone.';
            modalAction.value = async () => {
                try {
                    const response = await API.deleteEmployee(employeeId);
                    if (response.success) {
                        employees.value = employees.value.filter(emp => emp.id !== employeeId);
                        showToast('Employee deleted successfully!', 'success');
                        await loadDashboardStats();
                    } else {
                        showToast(response.message || 'Error deleting employee', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting employee:', error);
                    showToast('Error deleting employee', 'error');
                } finally {
                    closeModal();
                }
            };
        };

        // Payroll methods
        const processPayroll = async (payrollData) => {
            try {
                const response = await API.processPayroll(payrollData);
                if (response.success) {
                    payrollRecords.value.push(response.data);
                    showToast('Payroll processed successfully!', 'success');
                    await loadDashboardStats();
                } else {
                    showToast(response.message || 'Error processing payroll', 'error');
                }
            } catch (error) {
                console.error('Error processing payroll:', error);
                showToast('Error processing payroll', 'error');
            }
        };

        // Attendance methods
        const clockIn = async (employeeId) => {
            try {
                const response = await API.clockIn(employeeId);
                if (response.success) {
                    attendanceRecords.value.push(response.data);
                    showToast('Clocked in successfully!', 'success');
                    await loadDashboardStats();
                } else {
                    showToast(response.message || 'Error clocking in', 'error');
                }
            } catch (error) {
                console.error('Error clocking in:', error);
                showToast('Error clocking in', 'error');
            }
        };

        const clockOut = async (employeeId) => {
            try {
                const response = await API.clockOut(employeeId);
                if (response.success) {
                    const index = attendanceRecords.value.findIndex(
                        record => record.employee_id === employeeId && !record.clock_out
                    );
                    if (index !== -1) {
                        attendanceRecords.value[index] = response.data;
                    }
                    showToast('Clocked out successfully!', 'success');
                } else {
                    showToast(response.message || 'Error clocking out', 'error');
                }
            } catch (error) {
                console.error('Error clocking out:', error);
                showToast('Error clocking out', 'error');
            }
        };

        // Modal methods
        const closeModal = () => {
            showModal.value = false;
            modalTitle.value = '';
            modalContent.value = '';
            modalAction.value = null;
        };

        // Toast notification methods
        const showToast = (message, type = 'info') => {
            const toast = {
                id: ++toastIdCounter,
                message,
                type
            };
            toasts.value.push(toast);
            
            // Auto-remove toast after 5 seconds
            setTimeout(() => {
                const index = toasts.value.findIndex(t => t.id === toast.id);
                if (index > -1) {
                    toasts.value.splice(index, 1);
                }
            }, 5000);
        };

        // Initialize application
        onMounted(async () => {
            try {
                // Simulate initial loading
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Check if user is already authenticated (from localStorage/session)
                const savedAuth = localStorage.getItem('payroll_auth');
                if (savedAuth) {
                    const authData = JSON.parse(savedAuth);
                    isAuthenticated.value = true;
                    user.value = authData.user;
                    await loadInitialData();
                }
                
                loading.value = false;
            } catch (error) {
                console.error('Initialization error:', error);
                loading.value = false;
                showToast('Application initialization failed', 'error');
            }
        });

        return {
            // State
            loading,
            isAuthenticated,
            authLoading,
            currentView,
            user,
            employees,
            payrollRecords,
            attendanceRecords,
            dashboardStats,
            showModal,
            modalTitle,
            modalContent,
            modalAction,
            toasts,
            
            // Methods
            handleLogin,
            logout,
            addEmployee,
            editEmployee,
            deleteEmployee,
            processPayroll,
            clockIn,
            clockOut,
            closeModal,
            showToast,
            getCurrentDate,
            getCurrentTime,
            getViewDescription
        };
    }
};

// Create and mount the Vue app
createApp(PayrollApp).mount('#app');