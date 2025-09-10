// Payroll Component
const PayrollComponent = {
    template: `
        <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Payroll Management</h1>
                    <p class="text-gray-600 mt-1">Process employee payments and manage salary calculations</p>
                </div>
                <button @click="openProcessModal" 
                        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <span>💰</span>
                    <span>Process Payroll</span>
                </button>
            </div>

            <!-- Payroll Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total Payroll</p>
                            <p class="text-2xl font-bold text-gray-900">${{ formatCurrency(totalPayroll) }}</p>
                            <p class="text-sm text-green-600 mt-1">This month</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-green-600 text-xl">💰</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Processed</p>
                            <p class="text-2xl font-bold text-green-600">{{ processedCount }}</p>
                            <p class="text-sm text-gray-500 mt-1">Completed</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span class="text-blue-600 text-xl">✅</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Pending</p>
                            <p class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</p>
                            <p class="text-sm text-gray-500 mt-1">To process</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span class="text-yellow-600 text-xl">⏳</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Avg. Salary</p>
                            <p class="text-2xl font-bold text-purple-600">${{ formatCurrency(averageSalary) }}</p>
                            <p class="text-sm text-gray-500 mt-1">Per employee</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span class="text-purple-600 text-xl">📊</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="text"
                            v-model="searchTerm"
                            placeholder="Search payrolls..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <select v-model="filterStatus" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                        </select>
                    </div>
                    <div>
                        <select v-model="filterMonth" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Months</option>
                            <option v-for="month in availableMonths" :key="month" :value="month">{{ month }}</option>
                        </select>
                    </div>
                    <div>
                        <button @click="exportPayroll" 
                                class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <!-- Payroll Records Table -->
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Employee</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Pay Period</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Gross Pay</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Deductions</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Net Pay</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="record in filteredPayrollRecords" :key="record.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                                            <span class="text-white text-sm font-medium">{{ getEmployeeInitials(record.employee_name) }}</span>
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-900">{{ record.employee_name }}</div>
                                            <div class="text-sm text-gray-500">ID: {{ getEmployeeId(record.employee_id) }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ record.pay_period }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">${{ formatCurrency(record.gross_pay) }}</td>
                                <td class="px-6 py-4 text-sm text-red-600">-${{ formatCurrency(record.deductions) }}</td>
                                <td class="px-6 py-4 text-sm font-medium text-green-600">${{ formatCurrency(record.net_pay) }}</td>
                                <td class="px-6 py-4">
                                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(record.status)]">
                                        {{ record.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex space-x-2">
                                        <button @click="viewPayslip(record)" 
                                                class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                                            View
                                        </button>
                                        <button v-if="record.status === 'pending'" 
                                                @click="processPayment(record)" 
                                                class="text-green-600 hover:text-green-900 text-sm font-medium">
                                            Pay
                                        </button>
                                        <button @click="downloadPayslip(record)" 
                                                class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                            Download
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Empty State -->
                    <div v-if="filteredPayrollRecords.length === 0" class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-gray-400 text-2xl">💰</span>
                        </div>
                        <p class="text-gray-500">No payroll records found</p>
                        <p class="text-sm text-gray-400 mt-1">Start by processing payroll for your employees</p>
                    </div>
                </div>
            </div>

            <!-- Process Payroll Modal -->
            <div v-if="showProcessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                    <div class="p-6 border-b">
                        <h2 class="text-xl font-bold text-gray-900">Process Payroll</h2>
                        <p class="text-gray-600 mt-1">Calculate and process employee payments</p>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <!-- Pay Period Selection -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Pay Period Start</label>
                                <input
                                    type="date"
                                    v-model="payrollForm.start_date"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Pay Period End</label>
                                <input
                                    type="date"
                                    v-model="payrollForm.end_date"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <!-- Employee Selection -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-4">Select Employees</label>
                            <div class="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
                                <div class="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        :checked="allEmployeesSelected"
                                        @change="toggleAllEmployees"
                                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label class="ml-2 text-sm font-medium text-gray-700">Select All</label>
                                </div>
                                
                                <div v-for="employee in employees" :key="employee.id" class="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div class="flex items-center">
                                        <input
                                            type="checkbox"
                                            :value="employee.id"
                                            v-model="payrollForm.selected_employees"
                                            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <div class="ml-3">
                                            <div class="text-sm font-medium text-gray-900">{{ employee.first_name }} {{ employee.last_name }}</div>
                                            <div class="text-xs text-gray-500">{{ employee.department }} - {{ employee.position }}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-medium text-gray-900">${{ formatCurrency(employee.base_salary) }}</div>
                                        <div class="text-xs text-gray-500 capitalize">{{ employee.salary_type }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Settings -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model="payrollForm.tax_rate"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Insurance (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model="payrollForm.insurance_rate"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Other Deductions</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model="payrollForm.other_deductions"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <!-- Preview Calculation -->
                        <div v-if="payrollForm.selected_employees.length > 0" class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-medium text-gray-900 mb-2">Payroll Preview</h4>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>Total Employees: {{ payrollForm.selected_employees.length }}</div>
                                <div>Gross Pay: ${{ formatCurrency(calculateTotalGross()) }}</div>
                                <div>Total Deductions: ${{ formatCurrency(calculateTotalDeductions()) }}</div>
                                <div class="font-medium">Net Pay: ${{ formatCurrency(calculateTotalNet()) }}</div>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                @click="closeProcessModal"
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                @click="processPayrollCalculation"
                                :disabled="payrollForm.selected_employees.length === 0"
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                            >
                                Process Payroll
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    props: {
        employees: {
            type: Array,
            default: () => []
        },
        payrollRecords: {
            type: Array,
            default: () => []
        }
    },
    
    emits: ['process-payroll'],
    
    setup(props, { emit }) {
        const { ref, computed } = Vue;
        
        // Component state
        const showProcessModal = ref(false);
        const searchTerm = ref('');
        const filterStatus = ref('');
        const filterMonth = ref('');
        
        // Form data
        const payrollForm = ref({
            start_date: '',
            end_date: '',
            selected_employees: [],
            tax_rate: 15,
            insurance_rate: 5,
            other_deductions: 0
        });
        
        // Computed properties
        const filteredPayrollRecords = computed(() => {
            let filtered = props.payrollRecords || [];
            
            if (searchTerm.value) {
                const term = searchTerm.value.toLowerCase();
                filtered = filtered.filter(record => 
                    record.employee_name.toLowerCase().includes(term) ||
                    record.pay_period.toLowerCase().includes(term)
                );
            }
            
            if (filterStatus.value) {
                filtered = filtered.filter(record => record.status === filterStatus.value);
            }
            
            if (filterMonth.value) {
                filtered = filtered.filter(record => 
                    record.pay_period.includes(filterMonth.value)
                );
            }
            
            return filtered;
        });
        
        const totalPayroll = computed(() => {
            return props.payrollRecords.reduce((sum, record) => sum + (record.net_pay || 0), 0);
        });
        
        const processedCount = computed(() => {
            return props.payrollRecords.filter(record => record.status === 'paid').length;
        });
        
        const pendingCount = computed(() => {
            return props.payrollRecords.filter(record => record.status === 'pending').length;
        });
        
        const averageSalary = computed(() => {
            if (!props.employees.length) return 0;
            const total = props.employees.reduce((sum, emp) => sum + (parseFloat(emp.base_salary) || 0), 0);
            return Math.round(total / props.employees.length);
        });
        
        const availableMonths = computed(() => {
            const months = new Set();
            props.payrollRecords.forEach(record => {
                const period = record.pay_period;
                if (period && period.includes('to')) {
                    const endDate = period.split(' to ')[1];
                    const month = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    months.add(month);
                }
            });
            return Array.from(months);
        });
        
        const allEmployeesSelected = computed(() => {
            return props.employees.length > 0 && payrollForm.value.selected_employees.length === props.employees.length;
        });
        
        // Methods
        const openProcessModal = () => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            payrollForm.value.start_date = firstDay.toISOString().split('T')[0];
            payrollForm.value.end_date = lastDay.toISOString().split('T')[0];
            payrollForm.value.selected_employees = [];
            
            showProcessModal.value = true;
        };
        
        const closeProcessModal = () => {
            showProcessModal.value = false;
        };
        
        const toggleAllEmployees = () => {
            if (allEmployeesSelected.value) {
                payrollForm.value.selected_employees = [];
            } else {
                payrollForm.value.selected_employees = props.employees.map(emp => emp.id);
            }
        };
        
        const calculateTotalGross = () => {
            return payrollForm.value.selected_employees.reduce((total, empId) => {
                const employee = props.employees.find(emp => emp.id === empId);
                return total + (employee ? parseFloat(employee.base_salary) || 0 : 0);
            }, 0);
        };
        
        const calculateTotalDeductions = () => {
            const gross = calculateTotalGross();
            const taxDeduction = (gross * payrollForm.value.tax_rate) / 100;
            const insuranceDeduction = (gross * payrollForm.value.insurance_rate) / 100;
            const otherDeductions = parseFloat(payrollForm.value.other_deductions) || 0;
            
            return taxDeduction + insuranceDeduction + otherDeductions;
        };
        
        const calculateTotalNet = () => {
            return calculateTotalGross() - calculateTotalDeductions();
        };
        
        const processPayrollCalculation = () => {
            const payrollData = {
                start_date: payrollForm.value.start_date,
                end_date: payrollForm.value.end_date,
                selected_employees: payrollForm.value.selected_employees,
                tax_rate: payrollForm.value.tax_rate,
                insurance_rate: payrollForm.value.insurance_rate,
                other_deductions: payrollForm.value.other_deductions,
                gross_pay: calculateTotalGross(),
                total_deductions: calculateTotalDeductions(),
                net_pay: calculateTotalNet()
            };
            
            emit('process-payroll', payrollData);
            closeProcessModal();
        };
        
        const processPayment = (record) => {
            if (confirm(`Process payment for ${record.employee_name}?`)) {
                // Update record status
                record.status = 'paid';
            }
        };
        
        const viewPayslip = (record) => {
            const payslipInfo = 'PAYSLIP\n================\nEmployee: ' + record.employee_name + 
                '\nPay Period: ' + record.pay_period + 
                '\n\nGross Pay: 
        
        const downloadPayslip = (record) => {
            // Create CSV content for payslip
            const csvContent = 'Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n' +
                record.employee_name + ',' + record.pay_period + ',' + record.gross_pay + ',' + 
                record.deductions + ',' + record.net_pay + ',' + record.status;
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'payslip_' + record.employee_name.replace(' ', '_') + '_' + record.id + '.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const exportPayroll = () => {
            const csvHeader = 'Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n';
            const csvContent = props.payrollRecords.map(record => 
                record.employee_name + ',' + record.pay_period + ',' + record.gross_pay + ',' + 
                record.deductions + ',' + record.net_pay + ',' + record.status
            ).join('\n');
            
            const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'payroll_export_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const getStatusClass = (status) => {
            switch (status) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'processing': return 'bg-blue-100 text-blue-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };
        
        const getEmployeeInitials = (name) => {
            return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        };
        
        const getEmployeeId = (empId) => {
            const employee = props.employees.find(emp => emp.id === empId);
            return employee ? employee.employee_id : empId;
        };
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };
        
        return {
            showProcessModal,
            searchTerm,
            filterStatus,
            filterMonth,
            payrollForm,
            filteredPayrollRecords,
            totalPayroll,
            processedCount,
            pendingCount,
            averageSalary,
            availableMonths,
            allEmployeesSelected,
            openProcessModal,
            closeProcessModal,
            toggleAllEmployees,
            calculateTotalGross,
            calculateTotalDeductions,
            calculateTotalNet,
            processPayrollCalculation,
            processPayment,
            viewPayslip,
            downloadPayslip,
            exportPayroll,
            getStatusClass,
            getEmployeeInitials,
            getEmployeeId,
            formatCurrency
        };
    }
};

// Register the component globally
window.app?.component('payroll-component', PayrollComponent); + formatCurrency(record.gross_pay) +
                '\nDeductions: 
        
        const downloadPayslip = (record) => {
            // Create CSV content for payslip
            const csvContent = `Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n${record.employee_name},${record.pay_period},${record.gross_pay},${record.deductions},${record.net_pay},${record.status}`;
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${record.employee_name.replace(' ', '_')}_${record.id}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const exportPayroll = () => {
            const csvHeader = 'Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n';
            const csvContent = props.payrollRecords.map(record => 
                `${record.employee_name},${record.pay_period},${record.gross_pay},${record.deductions},${record.net_pay},${record.status}`
            ).join('\n');
            
            const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const getStatusClass = (status) => {
            switch (status) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'processing': return 'bg-blue-100 text-blue-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };
        
        const getEmployeeInitials = (name) => {
            return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        };
        
        const getEmployeeId = (empId) => {
            const employee = props.employees.find(emp => emp.id === empId);
            return employee ? employee.employee_id : empId;
        };
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };
        
        return {
            showProcessModal,
            searchTerm,
            filterStatus,
            filterMonth,
            payrollForm,
            filteredPayrollRecords,
            totalPayroll,
            processedCount,
            pendingCount,
            averageSalary,
            availableMonths,
            allEmployeesSelected,
            openProcessModal,
            closeProcessModal,
            toggleAllEmployees,
            calculateTotalGross,
            calculateTotalDeductions,
            calculateTotalNet,
            processPayrollCalculation,
            processPayment,
            viewPayslip,
            downloadPayslip,
            exportPayroll,
            getStatusClass,
            getEmployeeInitials,
            getEmployeeId,
            formatCurrency
        };
    }
};

// Register the component globally
window.app?.component('payroll-component', PayrollComponent); + formatCurrency(record.deductions) +
                '\nNet Pay: 
        
        const downloadPayslip = (record) => {
            // Create CSV content for payslip
            const csvContent = `Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n${record.employee_name},${record.pay_period},${record.gross_pay},${record.deductions},${record.net_pay},${record.status}`;
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${record.employee_name.replace(' ', '_')}_${record.id}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const exportPayroll = () => {
            const csvHeader = 'Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n';
            const csvContent = props.payrollRecords.map(record => 
                `${record.employee_name},${record.pay_period},${record.gross_pay},${record.deductions},${record.net_pay},${record.status}`
            ).join('\n');
            
            const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const getStatusClass = (status) => {
            switch (status) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'processing': return 'bg-blue-100 text-blue-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };
        
        const getEmployeeInitials = (name) => {
            return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        };
        
        const getEmployeeId = (empId) => {
            const employee = props.employees.find(emp => emp.id === empId);
            return employee ? employee.employee_id : empId;
        };
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };
        
        return {
            showProcessModal,
            searchTerm,
            filterStatus,
            filterMonth,
            payrollForm,
            filteredPayrollRecords,
            totalPayroll,
            processedCount,
            pendingCount,
            averageSalary,
            availableMonths,
            allEmployeesSelected,
            openProcessModal,
            closeProcessModal,
            toggleAllEmployees,
            calculateTotalGross,
            calculateTotalDeductions,
            calculateTotalNet,
            processPayrollCalculation,
            processPayment,
            viewPayslip,
            downloadPayslip,
            exportPayroll,
            getStatusClass,
            getEmployeeInitials,
            getEmployeeId,
            formatCurrency
        };
    }
};

// Register the component globally
window.app?.component('payroll-component', PayrollComponent); + formatCurrency(record.net_pay) +
                '\n\nStatus: ' + record.status +
                '\nDate: ' + (record.created_at || new Date().toLocaleDateString());
            
            alert(payslipInfo);
        };
        
        const downloadPayslip = (record) => {
            // Create CSV content for payslip
            const csvContent = `Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n${record.employee_name},${record.pay_period},${record.gross_pay},${record.deductions},${record.net_pay},${record.status}`;
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${record.employee_name.replace(' ', '_')}_${record.id}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const exportPayroll = () => {
            const csvHeader = 'Employee,Pay Period,Gross Pay,Deductions,Net Pay,Status\n';
            const csvContent = props.payrollRecords.map(record => 
                `${record.employee_name},${record.pay_period},${record.gross_pay},${record.deductions},${record.net_pay},${record.status}`
            ).join('\n');
            
            const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const getStatusClass = (status) => {
            switch (status) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'processing': return 'bg-blue-100 text-blue-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };
        
        const getEmployeeInitials = (name) => {
            return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        };
        
        const getEmployeeId = (empId) => {
            const employee = props.employees.find(emp => emp.id === empId);
            return employee ? employee.employee_id : empId;
        };
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };
        
        return {
            showProcessModal,
            searchTerm,
            filterStatus,
            filterMonth,
            payrollForm,
            filteredPayrollRecords,
            totalPayroll,
            processedCount,
            pendingCount,
            averageSalary,
            availableMonths,
            allEmployeesSelected,
            openProcessModal,
            closeProcessModal,
            toggleAllEmployees,
            calculateTotalGross,
            calculateTotalDeductions,
            calculateTotalNet,
            processPayrollCalculation,
            processPayment,
            viewPayslip,
            downloadPayslip,
            exportPayroll,
            getStatusClass,
            getEmployeeInitials,
            getEmployeeId,
            formatCurrency
        };
    }
};

// Register the component globally
window.app?.component('payroll-component', PayrollComponent);