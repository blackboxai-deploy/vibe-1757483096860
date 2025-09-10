// Dashboard Component
const DashboardComponent = {
    template: `
        <div class="p-6 space-y-6">
            <!-- Welcome Header -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Welcome to PayrollPro</h1>
                        <p class="text-gray-600 mt-1">Here's what's happening with your payroll system today</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">{{ getCurrentDateTime() }}</p>
                        <div class="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mt-2">
                            <span class="text-white font-bold text-xl">📊</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Employees -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total Employees</p>
                            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalEmployees || 0 }}</p>
                            <p class="text-sm text-green-600 mt-1">
                                <span>↗️</span> Active workforce
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span class="text-blue-600 text-xl">👥</span>
                        </div>
                    </div>
                </div>

                <!-- Total Payroll -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Monthly Payroll</p>
                            <p class="text-3xl font-bold text-gray-900 mt-2">${{ formatCurrency(stats.monthlyPayroll || stats.totalPayroll || 0) }}</p>
                            <p class="text-sm text-green-600 mt-1">
                                <span>💰</span> This month
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-green-600 text-xl">💰</span>
                        </div>
                    </div>
                </div>

                <!-- Pending Payrolls -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Pending Payrolls</p>
                            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.pendingPayrolls || 0 }}</p>
                            <p class="text-sm text-yellow-600 mt-1">
                                <span>⏳</span> Need processing
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span class="text-yellow-600 text-xl">⏳</span>
                        </div>
                    </div>
                </div>

                <!-- Present Today -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Present Today</p>
                            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.presentToday || 0 }}</p>
                            <p class="text-sm text-blue-600 mt-1">
                                <span>✅</span> {{ getAttendanceRate() }}% attendance
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span class="text-purple-600 text-xl">⏰</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts and Analytics Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Payroll Overview Chart -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Payroll Overview</h3>
                        <select class="text-sm border border-gray-300 rounded-lg px-3 py-1">
                            <option>Last 6 months</option>
                            <option>Last 12 months</option>
                            <option>This year</option>
                        </select>
                    </div>
                    
                    <!-- Simple Bar Chart Visualization -->
                    <div class="space-y-4">
                        <div v-for="(month, index) in chartData" :key="index" class="flex items-center">
                            <div class="w-16 text-sm text-gray-600">{{ month.name }}</div>
                            <div class="flex-1 bg-gray-200 rounded-full h-4 mx-4">
                                <div 
                                    class="bg-primary-500 h-4 rounded-full transition-all duration-500"
                                    :style="{ width: (month.value / getMaxChartValue()) * 100 + '%' }"
                                ></div>
                            </div>
                            <div class="w-20 text-sm text-gray-900 text-right">${{ formatCurrency(month.value) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
                    <div class="space-y-4">
                        <div v-for="activity in recentActivities" :key="activity.id" 
                             class="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="text-primary-600 text-sm">{{ activity.icon }}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                                <p class="text-xs text-gray-500">{{ activity.description }}</p>
                                <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View all activities
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button @click="$emit('navigate', 'employees')" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                            <span class="text-blue-600 text-xl">👥</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Add Employee</p>
                        <p class="text-xs text-gray-500">Manage workforce</p>
                    </button>

                    <button @click="$emit('navigate', 'payroll')" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                            <span class="text-green-600 text-xl">💰</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Process Payroll</p>
                        <p class="text-xs text-gray-500">Calculate salaries</p>
                    </button>

                    <button @click="$emit('navigate', 'attendance')" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200">
                            <span class="text-purple-600 text-xl">⏰</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Track Time</p>
                        <p class="text-xs text-gray-500">Attendance records</p>
                    </button>

                    <button @click="$emit('navigate', 'reports')" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200">
                            <span class="text-indigo-600 text-xl">📊</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">View Reports</p>
                        <p class="text-xs text-gray-500">Analytics & insights</p>
                    </button>
                </div>
            </div>

            <!-- System Status -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">Database Connection</span>
                        <span class="text-xs text-green-600 font-medium">Online</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">API Services</span>
                        <span class="text-xs text-green-600 font-medium">Running</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">Backup Status</span>
                        <span class="text-xs text-yellow-600 font-medium">Scheduled</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    props: {
        stats: {
            type: Object,
            default: () => ({
                totalEmployees: 0,
                totalPayroll: 0,
                pendingPayrolls: 0,
                presentToday: 0,
                monthlyPayroll: 0,
                averageSalary: 0,
                totalDeductions: 0,
                attendanceRate: 0
            })
        }
    },
    
    emits: ['navigate'],
    
    setup(props) {
        const { ref, computed } = Vue;
        
        // Chart data for payroll overview
        const chartData = ref([
            { name: 'Jan', value: 45000 },
            { name: 'Feb', value: 42000 },
            { name: 'Mar', value: 48000 },
            { name: 'Apr', value: 46000 },
            { name: 'May', value: 50000 },
            { name: 'Jun', value: 47000 }
        ]);
        
        // Recent activities
        const recentActivities = ref([
            {
                id: 1,
                icon: '👥',
                title: 'New employee added',
                description: 'John Doe joined the IT department',
                time: '2 hours ago'
            },
            {
                id: 2,
                icon: '💰',
                title: 'Payroll processed',
                description: 'Monthly payroll completed for 15 employees',
                time: '1 day ago'
            },
            {
                id: 3,
                icon: '⏰',
                title: 'Attendance recorded',
                description: '8 employees clocked in today',
                time: '3 hours ago'
            },
            {
                id: 4,
                icon: '📊',
                title: 'Report generated',
                description: 'Monthly payroll summary created',
                time: '2 days ago'
            }
        ]);
        
        // Computed properties
        const getAttendanceRate = () => {
            if (!props.stats.totalEmployees) return 0;
            return Math.round((props.stats.presentToday / props.stats.totalEmployees) * 100);
        };
        
        const getMaxChartValue = () => {
            return Math.max(...chartData.value.map(item => item.value));
        };
        
        // Methods
        const getCurrentDateTime = () => {
            return new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };
        
        return {
            chartData,
            recentActivities,
            getCurrentDateTime,
            formatCurrency,
            getAttendanceRate,
            getMaxChartValue
        };
    }
};

// Register the component globally
window.app?.component('dashboard-component', DashboardComponent);