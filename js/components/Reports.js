// Reports Component
const ReportsComponent = {
    template: `
        <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p class="text-gray-600 mt-1">Generate insights and reports for your payroll system</p>
                </div>
                <div class="flex space-x-3">
                    <button @click="generateAllReports" 
                            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span>📊</span>
                        <span>Generate All</span>
                    </button>
                    <button @click="scheduleReports" 
                            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span>⏰</span>
                        <span>Schedule</span>
                    </button>
                </div>
            </div>

            <!-- Report Types -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Payroll Summary Report -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-green-600 text-xl">💰</span>
                        </div>
                        <button @click="generatePayrollReport" 
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Generate
                        </button>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Payroll Summary</h3>
                    <p class="text-gray-600 text-sm mb-4">Complete payroll breakdown with totals and averages</p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Payroll:</span>
                            <span class="font-medium">${{ formatCurrency(totalPayroll) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Employees:</span>
                            <span class="font-medium">{{ employees.length }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Average Salary:</span>
                            <span class="font-medium">${{ formatCurrency(averageSalary) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Attendance Report -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span class="text-blue-600 text-xl">📅</span>
                        </div>
                        <button @click="generateAttendanceReport" 
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Generate
                        </button>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Attendance Analysis</h3>
                    <p class="text-gray-600 text-sm mb-4">Employee attendance patterns and statistics</p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Attendance Rate:</span>
                            <span class="font-medium">{{ attendanceRate }}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Present Today:</span>
                            <span class="font-medium">{{ presentToday }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Avg. Hours:</span>
                            <span class="font-medium">{{ averageHours }}h</span>
                        </div>
                    </div>
                </div>

                <!-- Employee Performance -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span class="text-purple-600 text-xl">👥</span>
                        </div>
                        <button @click="generateEmployeeReport" 
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Generate
                        </button>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Employee Performance</h3>
                    <p class="text-gray-600 text-sm mb-4">Individual employee metrics and performance</p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Active Employees:</span>
                            <span class="font-medium">{{ activeEmployees }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Departments:</span>
                            <span class="font-medium">{{ departmentCount }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Top Performer:</span>
                            <span class="font-medium">{{ topPerformer }}</span>
                        </div>
                    </div>
                </div>

                <!-- Department Analysis -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span class="text-yellow-600 text-xl">🏢</span>
                        </div>
                        <button @click="generateDepartmentReport" 
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Generate
                        </button>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Department Analysis</h3>
                    <p class="text-gray-600 text-sm mb-4">Department-wise cost and performance breakdown</p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Highest Cost:</span>
                            <span class="font-medium">{{ highestCostDept }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Most Employees:</span>
                            <span class="font-medium">{{ largestDept }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Best Attendance:</span>
                            <span class="font-medium">{{ bestAttendanceDept }}</span>
                        </div>
                    </div>
                </div>

                <!-- Tax & Deductions -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <span class="text-red-600 text-xl">🧾</span>
                        </div>
                        <button @click="generateTaxReport" 
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Generate
                        </button>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Tax & Deductions</h3>
                    <p class="text-gray-600 text-sm mb-4">Tax calculations and deduction summaries</p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Deductions:</span>
                            <span class="font-medium">${{ formatCurrency(totalDeductions) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Tax Amount:</span>
                            <span class="font-medium">${{ formatCurrency(totalTax) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Net Payroll:</span>
                            <span class="font-medium">${{ formatCurrency(netPayroll) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Custom Reports -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span class="text-indigo-600 text-xl">⚙️</span>
                        </div>
                        <button @click="openCustomReportModal" 
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Create
                        </button>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
                    <p class="text-gray-600 text-sm mb-4">Build custom reports with specific criteria</p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Available Filters:</span>
                            <span class="font-medium">15+</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Export Formats:</span>
                            <span class="font-medium">CSV, PDF</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Saved Reports:</span>
                            <span class="font-medium">3</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Payroll Trends -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Payroll Trends</h3>
                        <select v-model="chartPeriod" 
                                class="text-sm border border-gray-300 rounded-lg px-3 py-1">
                            <option value="6months">Last 6 months</option>
                            <option value="12months">Last 12 months</option>
                            <option value="year">This year</option>
                        </select>
                    </div>
                    
                    <!-- Simple Line Chart -->
                    <div class="space-y-3">
                        <div v-for="(month, index) in chartData" :key="index" class="flex items-center">
                            <div class="w-12 text-xs text-gray-600">{{ month.name }}</div>
                            <div class="flex-1 mx-4">
                                <div class="flex items-end h-8">
                                    <div 
                                        class="bg-primary-500 rounded-t transition-all duration-500"
                                        :style="{ 
                                            width: '100%', 
                                            height: ((month.value / maxChartValue) * 100) + '%',
                                            minHeight: '4px'
                                        }"
                                    ></div>
                                </div>
                            </div>
                            <div class="w-16 text-xs text-gray-900 text-right">${{ formatCurrency(month.value) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Department Distribution -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">Department Distribution</h3>
                    
                    <!-- Department Breakdown -->
                    <div class="space-y-4">
                        <div v-for="dept in departmentStats" :key="dept.name" class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium text-gray-700">{{ dept.name }}</span>
                                <div class="text-right">
                                    <span class="text-sm font-medium text-gray-900">{{ dept.employees }}</span>
                                    <span class="text-xs text-gray-500 ml-1">employees</span>
                                </div>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    :class="['h-2 rounded-full transition-all duration-500', dept.color]"
                                    :style="{ width: (dept.employees / maxEmployees) * 100 + '%' }"
                                ></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-500">
                                <span>Cost: ${{ formatCurrency(dept.cost) }}</span>
                                <span>{{ ((dept.employees / totalEmployees) * 100).toFixed(1) }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Reports -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900">Recent Reports</h3>
                    <button @click="clearReportHistory" 
                            class="text-sm text-gray-600 hover:text-gray-800">
                        Clear History
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Report Name</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Generated</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Size</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="report in recentReports" :key="report.id" class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ report.name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ report.type }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(report.created) }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ report.size }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex space-x-2">
                                        <button @click="downloadReport(report)" 
                                                class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                                            Download
                                        </button>
                                        <button @click="viewReport(report)" 
                                                class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                            View
                                        </button>
                                        <button @click="deleteReport(report)" 
                                                class="text-red-600 hover:text-red-900 text-sm font-medium">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Empty State -->
                    <div v-if="recentReports.length === 0" class="text-center py-8">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-gray-400 text-xl">📊</span>
                        </div>
                        <p class="text-gray-500">No reports generated yet</p>
                        <p class="text-sm text-gray-400 mt-1">Generate your first report above</p>
                    </div>
                </div>
            </div>

            <!-- Custom Report Modal -->
            <div v-if="showCustomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                    <div class="p-6 border-b">
                        <h2 class="text-xl font-bold text-gray-900">Create Custom Report</h2>
                        <p class="text-gray-600 mt-1">Build a custom report with your specific requirements</p>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <!-- Report Details -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                                <input
                                    type="text"
                                    v-model="customReport.name"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter report name"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <select
                                    v-model="customReport.type"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select Type</option>
                                    <option value="payroll">Payroll Summary</option>
                                    <option value="attendance">Attendance Analysis</option>
                                    <option value="employee">Employee Performance</option>
                                    <option value="department">Department Analysis</option>
                                </select>
                            </div>
                        </div>

                        <!-- Date Range -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    v-model="customReport.startDate"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    v-model="customReport.endDate"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <!-- Filters -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Filters (Optional)</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select v-model="customReport.department" 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                                    <option value="">All Departments</option>
                                    <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                                </select>
                                <select v-model="customReport.status" 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <!-- Export Format -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                            <div class="flex space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" v-model="customReport.format" value="csv" class="mr-2">
                                    <span class="text-sm text-gray-700">CSV</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" v-model="customReport.format" value="pdf" class="mr-2">
                                    <span class="text-sm text-gray-700">PDF</span>
                                </label>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                @click="closeCustomModal"
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                @click="generateCustomReport"
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Generate Report
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
        },
        attendanceRecords: {
            type: Array,
            default: () => []
        }
    },
    
    setup(props) {
        const { ref, computed } = Vue;
        
        // Component state
        const showCustomModal = ref(false);
        const chartPeriod = ref('6months');
        
        // Custom report form
        const customReport = ref({
            name: '',
            type: '',
            startDate: '',
            endDate: '',
            department: '',
            status: '',
            format: 'csv'
        });

        // Chart data
        const chartData = ref([
            { name: 'Jan', value: 45000 },
            { name: 'Feb', value: 42000 },
            { name: 'Mar', value: 48000 },
            { name: 'Apr', value: 46000 },
            { name: 'May', value: 50000 },
            { name: 'Jun', value: 47000 }
        ]);

        // Recent reports
        const recentReports = ref([
            { id: 1, name: 'Monthly Payroll Summary', type: 'Payroll', created: new Date(), size: '245 KB' },
            { id: 2, name: 'Attendance Report - IT Dept', type: 'Attendance', created: new Date(Date.now() - 86400000), size: '156 KB' },
            { id: 3, name: 'Employee Performance Q1', type: 'Performance', created: new Date(Date.now() - 172800000), size: '198 KB' }
        ]);

        // Computed properties
        const totalPayroll = computed(() => {
            return props.payrollRecords.reduce((sum, record) => sum + (record.net_pay || 0), 0);
        });

        const averageSalary = computed(() => {
            if (!props.employees.length) return 0;
            const total = props.employees.reduce((sum, emp) => sum + (parseFloat(emp.base_salary) || 0), 0);
            return Math.round(total / props.employees.length);
        });

        const activeEmployees = computed(() => {
            return props.employees.filter(emp => emp.status === 'active').length;
        });

        const attendanceRate = computed(() => {
            if (!props.employees.length) return 0;
            const today = new Date().toISOString().split('T')[0];
            const presentToday = props.attendanceRecords.filter(record => 
                record.date === today && record.status === 'present'
            ).length;
            return Math.round((presentToday / props.employees.length) * 100);
        });

        const presentToday = computed(() => {
            const today = new Date().toISOString().split('T')[0];
            return props.attendanceRecords.filter(record => 
                record.date === today && record.status === 'present'
            ).length;
        });

        const averageHours = computed(() => {
            const validRecords = props.attendanceRecords.filter(record => record.hours_worked);
            if (!validRecords.length) return 0;
            const total = validRecords.reduce((sum, record) => sum + (record.hours_worked || 0), 0);
            return Math.round((total / validRecords.length) * 10) / 10;
        });

        const departmentCount = computed(() => {
            const depts = new Set(props.employees.map(emp => emp.department));
            return depts.size;
        });

        const departments = computed(() => {
            return Array.from(new Set(props.employees.map(emp => emp.department)));
        });

        const topPerformer = computed(() => {
            if (!props.employees.length) return 'N/A';
            return props.employees[0].first_name + ' ' + props.employees[0].last_name;
        });

        const highestCostDept = computed(() => {
            const deptCosts = {};
            props.employees.forEach(emp => {
                deptCosts[emp.department] = (deptCosts[emp.department] || 0) + (parseFloat(emp.base_salary) || 0);
            });
            const highest = Object.keys(deptCosts).reduce((a, b) => deptCosts[a] > deptCosts[b] ? a : b, '');
            return highest || 'N/A';
        });

        const largestDept = computed(() => {
            const deptCounts = {};
            props.employees.forEach(emp => {
                deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
            });
            const largest = Object.keys(deptCounts).reduce((a, b) => deptCounts[a] > deptCounts[b] ? a : b, '');
            return largest || 'N/A';
        });

        const bestAttendanceDept = computed(() => {
            return departments.value[0] || 'N/A';
        });

        const totalDeductions = computed(() => {
            return props.payrollRecords.reduce((sum, record) => sum + (record.deductions || 0), 0);
        });

        const totalTax = computed(() => {
            return Math.round(totalDeductions.value * 0.6); // Assume 60% of deductions are tax
        });

        const netPayroll = computed(() => {
            return totalPayroll.value - totalDeductions.value;
        });

        const maxChartValue = computed(() => {
            return Math.max(...chartData.value.map(item => item.value));
        });

        const departmentStats = computed(() => {
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
            const stats = {};
            
            props.employees.forEach(emp => {
                if (!stats[emp.department]) {
                    stats[emp.department] = { 
                        name: emp.department, 
                        employees: 0, 
                        cost: 0,
                        color: colors[Object.keys(stats).length % colors.length]
                    };
                }
                stats[emp.department].employees++;
                stats[emp.department].cost += parseFloat(emp.base_salary) || 0;
            });

            return Object.values(stats);
        });

        const maxEmployees = computed(() => {
            return Math.max(...departmentStats.value.map(dept => dept.employees), 1);
        });

        const totalEmployees = computed(() => {
            return props.employees.length;
        });

        // Methods
        const openCustomReportModal = () => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            
            customReport.value = {
                name: '',
                type: '',
                startDate: firstDay.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
                department: '',
                status: '',
                format: 'csv'
            };
            showCustomModal.value = true;
        };

        const closeCustomModal = () => {
            showCustomModal.value = false;
        };

        const generatePayrollReport = () => {
            const reportData = 'Employee,Department,Base Salary,Gross Pay,Deductions,Net Pay\n' + 
                props.employees.map(emp => {
                    const payrollRecord = props.payrollRecords.find(record => record.employee_id === emp.id);
                    return emp.first_name + ' ' + emp.last_name + ',' + emp.department + ',' + 
                           emp.base_salary + ',' + (payrollRecord?.gross_pay || emp.base_salary) + ',' +
                           (payrollRecord?.deductions || 0) + ',' + (payrollRecord?.net_pay || emp.base_salary);
                }).join('\n');

            downloadCSV(reportData, 'payroll_summary_' + new Date().toISOString().split('T')[0] + '.csv');
        };

        const generateAttendanceReport = () => {
            const reportData = 'Employee,Date,Clock In,Clock Out,Hours,Status\n' + 
                props.attendanceRecords.map(record => 
                    record.employee_name + ',' + record.date + ',' + (record.clock_in || '-') + ',' + 
                    (record.clock_out || '-') + ',' + (record.hours_worked || 0) + ',' + record.status
                ).join('\n');

            downloadCSV(reportData, 'attendance_report_' + new Date().toISOString().split('T')[0] + '.csv');
        };

        const generateEmployeeReport = () => {
            const reportData = 'Employee,Department,Position,Hire Date,Salary,Status\n' + 
                props.employees.map(emp => 
                    emp.first_name + ' ' + emp.last_name + ',' + emp.department + ',' + 
                    emp.position + ',' + emp.hire_date + ',' + emp.base_salary + ',' + emp.status
                ).join('\n');

            downloadCSV(reportData, 'employee_report_' + new Date().toISOString().split('T')[0] + '.csv');
        };

        const generateDepartmentReport = () => {
            const deptData = departmentStats.value.map(dept => 
                dept.name + ',' + dept.employees + ',' + dept.cost + ',' + 
                Math.round((dept.employees / totalEmployees.value) * 100) + '%'
            );

            const reportData = 'Department,Employees,Total Cost,Percentage\n' + deptData.join('\n');
            downloadCSV(reportData, 'department_report_' + new Date().toISOString().split('T')[0] + '.csv');
        };

        const generateTaxReport = () => {
            const reportData = 'Employee,Gross Pay,Tax Deduction,Other Deductions,Total Deductions,Net Pay\n' + 
                props.payrollRecords.map(record => 
                    record.employee_name + ',' + record.gross_pay + ',' + 
                    Math.round(record.deductions * 0.6) + ',' + Math.round(record.deductions * 0.4) + ',' +
                    record.deductions + ',' + record.net_pay
                ).join('\n');

            downloadCSV(reportData, 'tax_report_' + new Date().toISOString().split('T')[0] + '.csv');
        };

        const generateCustomReport = () => {
            let filteredData = [];
            
            switch (customReport.value.type) {
                case 'payroll':
                    filteredData = props.payrollRecords;
                    break;
                case 'attendance':
                    filteredData = props.attendanceRecords;
                    break;
                case 'employee':
                    filteredData = props.employees;
                    break;
                default:
                    filteredData = props.employees;
            }

            const reportData = 'Generated Custom Report\n' + 
                'Name: ' + customReport.value.name + '\n' +
                'Type: ' + customReport.value.type + '\n' +
                'Period: ' + customReport.value.startDate + ' to ' + customReport.value.endDate + '\n\n' +
                'Data Count: ' + filteredData.length + ' records';

            downloadCSV(reportData, customReport.value.name.replace(/\s+/g, '_').toLowerCase() + '.csv');
            
            // Add to recent reports
            recentReports.value.unshift({
                id: Date.now(),
                name: customReport.value.name,
                type: customReport.value.type,
                created: new Date(),
                size: Math.round(Math.random() * 200 + 50) + ' KB'
            });

            closeCustomModal();
        };

        const generateAllReports = () => {
            if (confirm('Generate all standard reports?')) {
                generatePayrollReport();
                setTimeout(() => generateAttendanceReport(), 500);
                setTimeout(() => generateEmployeeReport(), 1000);
                setTimeout(() => generateDepartmentReport(), 1500);
            }
        };

        const scheduleReports = () => {
            alert('Report scheduling will be available in the next version.');
        };

        const clearReportHistory = () => {
            if (confirm('Clear all report history?')) {
                recentReports.value = [];
            }
        };

        const downloadReport = (report) => {
            alert('Downloading: ' + report.name);
        };

        const viewReport = (report) => {
            alert('Viewing: ' + report.name);
        };

        const deleteReport = (report) => {
            if (confirm('Delete report: ' + report.name + '?')) {
                const index = recentReports.value.findIndex(r => r.id === report.id);
                if (index > -1) {
                    recentReports.value.splice(index, 1);
                }
            }
        };

        const downloadCSV = (content, filename) => {
            const blob = new Blob([content], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        return {
            showCustomModal,
            chartPeriod,
            customReport,
            chartData,
            recentReports,
            totalPayroll,
            averageSalary,
            activeEmployees,
            attendanceRate,
            presentToday,
            averageHours,
            departmentCount,
            departments,
            topPerformer,
            highestCostDept,
            largestDept,
            bestAttendanceDept,
            totalDeductions,
            totalTax,
            netPayroll,
            maxChartValue,
            departmentStats,
            maxEmployees,
            totalEmployees,
            openCustomReportModal,
            closeCustomModal,
            generatePayrollReport,
            generateAttendanceReport,
            generateEmployeeReport,
            generateDepartmentReport,
            generateTaxReport,
            generateCustomReport,
            generateAllReports,
            scheduleReports,
            clearReportHistory,
            downloadReport,
            viewReport,
            deleteReport,
            formatCurrency,
            formatDate
        };
    }
};

// Register the component globally
window.app?.component('reports-component', ReportsComponent);