// API Utility for XAMPP Backend Communication
window.API = {
    // Base configuration
    baseURL: 'http://localhost/payroll-system/api',
    
    // Helper method for making HTTP requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include cookies for session management
        };

        const config = { ...defaultOptions, ...options };
        
        // Add body data if it's not a GET request
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('Content-Type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Request Error (${endpoint}):`, error);
            
            // Return a standardized error response
            return {
                success: false,
                message: error.message || 'Network error occurred',
                error: true
            };
        }
    },

    // Authentication endpoints
    async login(credentials) {
        try {
            const response = await this.request('/auth.php', {
                method: 'POST',
                body: {
                    action: 'login',
                    email: credentials.email,
                    password: credentials.password
                }
            });
            
            // Store authentication data in localStorage
            if (response.success) {
                localStorage.setItem('payroll_auth', JSON.stringify({
                    user: response.user,
                    token: response.token,
                    timestamp: Date.now()
                }));
            }
            
            return response;
        } catch (error) {
            // Fallback for development/testing
            if (credentials.email === 'admin@payroll.com' && credentials.password === 'admin123') {
                const mockUser = {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@payroll.com',
                    role: 'Administrator'
                };
                
                localStorage.setItem('payroll_auth', JSON.stringify({
                    user: mockUser,
                    token: 'mock-token',
                    timestamp: Date.now()
                }));
                
                return {
                    success: true,
                    user: mockUser,
                    token: 'mock-token'
                };
            }
            
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
    },

    async logout() {
        try {
            await this.request('/auth.php', {
                method: 'POST',
                body: { action: 'logout' }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('payroll_auth');
        }
    },

    // Employee management endpoints
    async getEmployees() {
        try {
            const response = await this.request('/employees.php');
            return response.success ? response : this.getMockEmployees();
        } catch (error) {
            return this.getMockEmployees();
        }
    },

    async createEmployee(employeeData) {
        try {
            const response = await this.request('/employees.php', {
                method: 'POST',
                body: {
                    action: 'create',
                    ...employeeData
                }
            });
            return response;
        } catch (error) {
            // Mock response for development
            return {
                success: true,
                data: {
                    id: Date.now(),
                    ...employeeData,
                    created_at: new Date().toISOString()
                }
            };
        }
    },

    async updateEmployee(id, employeeData) {
        try {
            const response = await this.request('/employees.php', {
                method: 'PUT',
                body: {
                    action: 'update',
                    id: id,
                    ...employeeData
                }
            });
            return response;
        } catch (error) {
            // Mock response for development
            return {
                success: true,
                data: {
                    id: id,
                    ...employeeData,
                    updated_at: new Date().toISOString()
                }
            };
        }
    },

    async deleteEmployee(id) {
        try {
            const response = await this.request('/employees.php', {
                method: 'DELETE',
                body: {
                    action: 'delete',
                    id: id
                }
            });
            return response;
        } catch (error) {
            // Mock response for development
            return {
                success: true,
                message: 'Employee deleted successfully'
            };
        }
    },

    // Payroll management endpoints
    async getPayrollRecords() {
        try {
            const response = await this.request('/payroll.php');
            return response.success ? response : this.getMockPayrollRecords();
        } catch (error) {
            return this.getMockPayrollRecords();
        }
    },

    async processPayroll(payrollData) {
        try {
            const response = await this.request('/payroll.php', {
                method: 'POST',
                body: {
                    action: 'process',
                    ...payrollData
                }
            });
            return response;
        } catch (error) {
            // Mock response for development
            return {
                success: true,
                data: {
                    id: Date.now(),
                    ...payrollData,
                    processed_at: new Date().toISOString(),
                    status: 'completed'
                }
            };
        }
    },

    // Attendance management endpoints
    async getAttendanceRecords() {
        try {
            const response = await this.request('/attendance.php');
            return response.success ? response : this.getMockAttendanceRecords();
        } catch (error) {
            return this.getMockAttendanceRecords();
        }
    },

    async clockIn(employeeId) {
        try {
            const response = await this.request('/attendance.php', {
                method: 'POST',
                body: {
                    action: 'clock_in',
                    employee_id: employeeId
                }
            });
            return response;
        } catch (error) {
            // Mock response for development
            return {
                success: true,
                data: {
                    id: Date.now(),
                    employee_id: employeeId,
                    date: new Date().toISOString().split('T')[0],
                    clock_in: new Date().toTimeString().split(' ')[0],
                    clock_out: null,
                    status: 'present'
                }
            };
        }
    },

    async clockOut(employeeId) {
        try {
            const response = await this.request('/attendance.php', {
                method: 'POST',
                body: {
                    action: 'clock_out',
                    employee_id: employeeId
                }
            });
            return response;
        } catch (error) {
            // Mock response for development
            return {
                success: true,
                data: {
                    id: Date.now(),
                    employee_id: employeeId,
                    date: new Date().toISOString().split('T')[0],
                    clock_in: '09:00:00',
                    clock_out: new Date().toTimeString().split(' ')[0],
                    status: 'present',
                    hours_worked: 8.5
                }
            };
        }
    },

    // Dashboard statistics
    async getDashboardStats() {
        try {
            const response = await this.request('/dashboard.php');
            return response.success ? response : this.getMockDashboardStats();
        } catch (error) {
            return this.getMockDashboardStats();
        }
    },

    // Mock data methods for development/fallback
    getMockEmployees() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@company.com',
                    phone: '+1234567890',
                    department: 'IT',
                    position: 'Software Developer',
                    hire_date: '2023-01-15',
                    salary_type: 'monthly',
                    base_salary: 5000,
                    status: 'active'
                },
                {
                    id: 2,
                    employee_id: 'EMP002',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'jane.smith@company.com',
                    phone: '+1234567891',
                    department: 'HR',
                    position: 'HR Manager',
                    hire_date: '2022-11-20',
                    salary_type: 'monthly',
                    base_salary: 4500,
                    status: 'active'
                },
                {
                    id: 3,
                    employee_id: 'EMP003',
                    first_name: 'Mike',
                    last_name: 'Johnson',
                    email: 'mike.johnson@company.com',
                    phone: '+1234567892',
                    department: 'Finance',
                    position: 'Accountant',
                    hire_date: '2023-03-10',
                    salary_type: 'hourly',
                    base_salary: 25,
                    status: 'active'
                }
            ]
        };
    },

    getMockPayrollRecords() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'John Doe',
                    pay_period: '2024-01-01 to 2024-01-31',
                    gross_pay: 5000,
                    deductions: 850,
                    net_pay: 4150,
                    status: 'paid',
                    created_at: '2024-02-01'
                },
                {
                    id: 2,
                    employee_id: 2,
                    employee_name: 'Jane Smith',
                    pay_period: '2024-01-01 to 2024-01-31',
                    gross_pay: 4500,
                    deductions: 765,
                    net_pay: 3735,
                    status: 'paid',
                    created_at: '2024-02-01'
                },
                {
                    id: 3,
                    employee_id: 3,
                    employee_name: 'Mike Johnson',
                    pay_period: '2024-01-01 to 2024-01-31',
                    gross_pay: 4200,
                    deductions: 714,
                    net_pay: 3486,
                    status: 'pending',
                    created_at: '2024-02-01'
                }
            ]
        };
    },

    getMockAttendanceRecords() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'John Doe',
                    date: new Date().toISOString().split('T')[0],
                    clock_in: '09:00:00',
                    clock_out: '17:30:00',
                    status: 'present',
                    hours_worked: 8.5
                },
                {
                    id: 2,
                    employee_id: 2,
                    employee_name: 'Jane Smith',
                    date: new Date().toISOString().split('T')[0],
                    clock_in: '08:30:00',
                    clock_out: '17:00:00',
                    status: 'present',
                    hours_worked: 8.5
                }
            ]
        };
    },

    getMockDashboardStats() {
        return {
            success: true,
            data: {
                totalEmployees: 3,
                totalPayroll: 11349,
                pendingPayrolls: 1,
                presentToday: 2,
                monthlyPayroll: 45000,
                averageSalary: 4500,
                totalDeductions: 2329,
                attendanceRate: 85.5
            }
        };
    }
};