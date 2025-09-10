// Attendance Component
const AttendanceComponent = {
    template: `
        <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p class="text-gray-600 mt-1">Track employee working hours and attendance records</p>
                </div>
                <div class="flex space-x-3">
                    <button @click="openClockModal" 
                            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span>⏰</span>
                        <span>Clock In/Out</span>
                    </button>
                    <button @click="exportAttendance" 
                            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span>📊</span>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <!-- Attendance Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Present Today</p>
                            <p class="text-2xl font-bold text-green-600">{{ presentToday }}</p>
                            <p class="text-sm text-gray-500 mt-1">{{ attendanceRate }}% attendance</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-green-600 text-xl">✅</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Absent Today</p>
                            <p class="text-2xl font-bold text-red-600">{{ absentToday }}</p>
                            <p class="text-sm text-gray-500 mt-1">Missing employees</p>
                        </div>
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <span class="text-red-600 text-xl">❌</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Late Arrivals</p>
                            <p class="text-2xl font-bold text-yellow-600">{{ lateToday }}</p>
                            <p class="text-sm text-gray-500 mt-1">After 9:00 AM</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span class="text-yellow-600 text-xl">⚠️</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Avg. Hours</p>
                            <p class="text-2xl font-bold text-purple-600">{{ averageHours }}</p>
                            <p class="text-sm text-gray-500 mt-1">Per day</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span class="text-purple-600 text-xl">⏱️</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Date Filter and Search -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <input
                            type="text"
                            v-model="searchTerm"
                            placeholder="Search employees..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            v-model="filterDate"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <select v-model="filterStatus" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                    <div>
                        <select v-model="filterDepartment" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Departments</option>
                            <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">{{ dept }}</option>
                        </select>
                    </div>
                    <div>
                        <button @click="resetFilters" 
                                class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Clock Actions -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button @click="bulkClockIn" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                            <span class="text-green-600 text-xl">📥</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Bulk Clock In</p>
                        <p class="text-xs text-gray-500">Multiple employees</p>
                    </button>

                    <button @click="bulkClockOut" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group">
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-red-200">
                            <span class="text-red-600 text-xl">📤</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Bulk Clock Out</p>
                        <p class="text-xs text-gray-500">End of day</p>
                    </button>

                    <button @click="generateReport" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                            <span class="text-blue-600 text-xl">📈</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Daily Report</p>
                        <p class="text-xs text-gray-500">Today's summary</p>
                    </button>

                    <button @click="manageLeaves" 
                            class="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200">
                            <span class="text-purple-600 text-xl">🏖️</span>
                        </div>
                        <p class="text-sm font-medium text-gray-900">Manage Leaves</p>
                        <p class="text-xs text-gray-500">Vacation requests</p>
                    </button>
                </div>
            </div>

            <!-- Attendance Records Table -->
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Employee</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Clock In</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Clock Out</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Hours</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="record in filteredAttendanceRecords" :key="record.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                                            <span class="text-white text-sm font-medium">{{ getEmployeeInitials(record.employee_name) }}</span>
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-900">{{ record.employee_name }}</div>
                                            <div class="text-sm text-gray-500">{{ getEmployeeDepartment(record.employee_id) }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(record.date) }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">
                                    <span :class="[isLate(record.clock_in) ? 'text-red-600' : 'text-gray-900']">
                                        {{ record.clock_in || '-' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ record.clock_out || '-' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">
                                    <span class="font-medium">{{ formatHours(record.hours_worked) }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(record.status)]">
                                        {{ record.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex space-x-2">
                                        <button v-if="!record.clock_in" 
                                                @click="clockIn(record.employee_id)" 
                                                class="text-green-600 hover:text-green-900 text-sm font-medium">
                                            Clock In
                                        </button>
                                        <button v-if="record.clock_in && !record.clock_out" 
                                                @click="clockOut(record.employee_id)" 
                                                class="text-red-600 hover:text-red-900 text-sm font-medium">
                                            Clock Out
                                        </button>
                                        <button @click="editRecord(record)" 
                                                class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Empty State -->
                    <div v-if="filteredAttendanceRecords.length === 0" class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-gray-400 text-2xl">⏰</span>
                        </div>
                        <p class="text-gray-500">No attendance records found</p>
                        <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or date range</p>
                    </div>
                </div>
            </div>

            <!-- Clock In/Out Modal -->
            <div v-if="showClockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-md w-full">
                    <div class="p-6 border-b">
                        <h2 class="text-xl font-bold text-gray-900">Employee Clock In/Out</h2>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <!-- Employee Selection -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                            <select
                                v-model="clockForm.employee_id"
                                required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Choose Employee</option>
                                <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                                    {{ employee.first_name }} {{ employee.last_name }} - {{ employee.employee_id }}
                                </option>
                            </select>
                        </div>

                        <!-- Action Selection -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Action</label>
                            <div class="grid grid-cols-2 gap-4">
                                <button
                                    @click="clockForm.action = 'clock_in'"
                                    :class="['p-4 border rounded-lg text-center transition-colors',
                                             clockForm.action === 'clock_in' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50']"
                                >
                                    <div class="text-2xl mb-2">📥</div>
                                    <div class="font-medium">Clock In</div>
                                </button>
                                <button
                                    @click="clockForm.action = 'clock_out'"
                                    :class="['p-4 border rounded-lg text-center transition-colors',
                                             clockForm.action === 'clock_out' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 hover:bg-gray-50']"
                                >
                                    <div class="text-2xl mb-2">📤</div>
                                    <div class="font-medium">Clock Out</div>
                                </button>
                            </div>
                        </div>

                        <!-- Current Time Display -->
                        <div class="bg-gray-50 rounded-lg p-4 text-center">
                            <p class="text-sm text-gray-600">Current Time</p>
                            <p class="text-2xl font-bold text-gray-900">{{ getCurrentTime() }}</p>
                            <p class="text-sm text-gray-500">{{ getCurrentDate() }}</p>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                @click="closeClockModal"
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                @click="submitClock"
                                :disabled="!clockForm.employee_id || !clockForm.action"
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                            >
                                {{ clockForm.action === 'clock_in' ? 'Clock In' : 'Clock Out' }}
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
        attendanceRecords: {
            type: Array,
            default: () => []
        }
    },
    
    emits: ['clock-in', 'clock-out'],
    
    setup(props, { emit }) {
        const { ref, computed } = Vue;
        
        // Component state
        const showClockModal = ref(false);
        const searchTerm = ref('');
        const filterDate = ref(new Date().toISOString().split('T')[0]);
        const filterStatus = ref('');
        const filterDepartment = ref('');
        
        // Clock form
        const clockForm = ref({
            employee_id: '',
            action: ''
        });
        
        // Computed properties
        const filteredAttendanceRecords = computed(() => {
            let filtered = props.attendanceRecords || [];
            
            if (searchTerm.value) {
                const term = searchTerm.value.toLowerCase();
                filtered = filtered.filter(record => 
                    record.employee_name.toLowerCase().includes(term)
                );
            }
            
            if (filterDate.value) {
                filtered = filtered.filter(record => record.date === filterDate.value);
            }
            
            if (filterStatus.value) {
                filtered = filtered.filter(record => record.status === filterStatus.value);
            }
            
            if (filterDepartment.value) {
                filtered = filtered.filter(record => {
                    const employee = props.employees.find(emp => emp.id === record.employee_id);
                    return employee && employee.department === filterDepartment.value;
                });
            }
            
            return filtered;
        });
        
        const presentToday = computed(() => {
            const today = new Date().toISOString().split('T')[0];
            return props.attendanceRecords.filter(record => 
                record.date === today && record.status === 'present'
            ).length;
        });
        
        const absentToday = computed(() => {
            return props.employees.length - presentToday.value;
        });
        
        const lateToday = computed(() => {
            const today = new Date().toISOString().split('T')[0];
            return props.attendanceRecords.filter(record => 
                record.date === today && isLate(record.clock_in)
            ).length;
        });
        
        const averageHours = computed(() => {
            const validRecords = props.attendanceRecords.filter(record => record.hours_worked);
            if (!validRecords.length) return 0;
            const total = validRecords.reduce((sum, record) => sum + (record.hours_worked || 0), 0);
            return Math.round((total / validRecords.length) * 10) / 10;
        });
        
        const attendanceRate = computed(() => {
            if (!props.employees.length) return 0;
            return Math.round((presentToday.value / props.employees.length) * 100);
        });
        
        const uniqueDepartments = computed(() => {
            return [...new Set(props.employees.map(emp => emp.department))];
        });
        
        // Methods
        const openClockModal = () => {
            clockForm.value = { employee_id: '', action: '' };
            showClockModal.value = true;
        };
        
        const closeClockModal = () => {
            showClockModal.value = false;
        };
        
        const submitClock = () => {
            if (clockForm.value.action === 'clock_in') {
                emit('clock-in', clockForm.value.employee_id);
            } else {
                emit('clock-out', clockForm.value.employee_id);
            }
            closeClockModal();
        };
        
        const clockIn = (employeeId) => {
            emit('clock-in', employeeId);
        };
        
        const clockOut = (employeeId) => {
            emit('clock-out', employeeId);
        };
        
        const bulkClockIn = () => {
            if (confirm('Clock in all employees?')) {
                props.employees.forEach(employee => {
                    const hasRecord = props.attendanceRecords.find(record => 
                        record.employee_id === employee.id && 
                        record.date === new Date().toISOString().split('T')[0]
                    );
                    if (!hasRecord) {
                        emit('clock-in', employee.id);
                    }
                });
            }
        };
        
        const bulkClockOut = () => {
            if (confirm('Clock out all employees?')) {
                const today = new Date().toISOString().split('T')[0];
                props.attendanceRecords.forEach(record => {
                    if (record.date === today && record.clock_in && !record.clock_out) {
                        emit('clock-out', record.employee_id);
                    }
                });
            }
        };
        
        const generateReport = () => {
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = props.attendanceRecords.filter(record => record.date === today);
            
            const reportData = 'Employee,Clock In,Clock Out,Hours,Status\n' + 
                todayRecords.map(record => 
                    record.employee_name + ',' + (record.clock_in || '-') + ',' + 
                    (record.clock_out || '-') + ',' + (record.hours_worked || 0) + ',' + record.status
                ).join('\n');
            
            const blob = new Blob([reportData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'daily_attendance_' + today + '.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const manageLeaves = () => {
            alert('Leave management feature will be available in the next version.');
        };
        
        const exportAttendance = () => {
            const csvHeader = 'Employee,Date,Clock In,Clock Out,Hours,Status\n';
            const csvContent = props.attendanceRecords.map(record => 
                record.employee_name + ',' + record.date + ',' + (record.clock_in || '-') + ',' + 
                (record.clock_out || '-') + ',' + (record.hours_worked || 0) + ',' + record.status
            ).join('\n');
            
            const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'attendance_export_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        const resetFilters = () => {
            searchTerm.value = '';
            filterDate.value = new Date().toISOString().split('T')[0];
            filterStatus.value = '';
            filterDepartment.value = '';
        };
        
        const editRecord = (record) => {
            alert('Editing attendance records will be available in the next version.');
        };
        
        const isLate = (clockInTime) => {
            if (!clockInTime) return false;
            const clockIn = new Date('1970-01-01T' + clockInTime);
            const nineAM = new Date('1970-01-01T09:00:00');
            return clockIn > nineAM;
        };
        
        const getStatusClass = (status) => {
            switch (status) {
                case 'present': return 'bg-green-100 text-green-800';
                case 'absent': return 'bg-red-100 text-red-800';
                case 'late': return 'bg-yellow-100 text-yellow-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };
        
        const getEmployeeInitials = (name) => {
            return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        };
        
        const getEmployeeDepartment = (employeeId) => {
            const employee = props.employees.find(emp => emp.id === employeeId);
            return employee ? employee.department : '';
        };
        
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        };
        
        const formatHours = (hours) => {
            return hours ? hours.toFixed(1) + 'h' : '0h';
        };
        
        const getCurrentTime = () => {
            return new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        const getCurrentDate = () => {
            return new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        };
        
        return {
            showClockModal,
            searchTerm,
            filterDate,
            filterStatus,
            filterDepartment,
            clockForm,
            filteredAttendanceRecords,
            presentToday,
            absentToday,
            lateToday,
            averageHours,
            attendanceRate,
            uniqueDepartments,
            openClockModal,
            closeClockModal,
            submitClock,
            clockIn,
            clockOut,
            bulkClockIn,
            bulkClockOut,
            generateReport,
            manageLeaves,
            exportAttendance,
            resetFilters,
            editRecord,
            isLate,
            getStatusClass,
            getEmployeeInitials,
            getEmployeeDepartment,
            formatDate,
            formatHours,
            getCurrentTime,
            getCurrentDate
        };
    }
};

// Register the component globally
window.app?.component('attendance-component', AttendanceComponent);