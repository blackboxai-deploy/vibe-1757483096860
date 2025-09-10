// Employees Component
const EmployeesComponent = {
    template: `
        <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Employee Management</h1>
                    <p class="text-gray-600 mt-1">Manage your workforce and employee information</p>
                </div>
                <button @click="openAddModal" 
                        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <span>+</span>
                    <span>Add Employee</span>
                </button>
            </div>

            <!-- Search and Filters -->
            <div class="bg-white rounded-xl shadow-sm p-6 border">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="text"
                            v-model="searchTerm"
                            placeholder="Search employees..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <select v-model="filterDepartment" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Departments</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>
                    <div>
                        <select v-model="filterStatus" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <select v-model="filterSalaryType" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                            <option value="">All Salary Types</option>
                            <option value="monthly">Monthly</option>
                            <option value="hourly">Hourly</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Employee Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg shadow-sm p-4 border">
                    <p class="text-sm text-gray-600">Total Employees</p>
                    <p class="text-2xl font-bold text-gray-900">{{ employees.length }}</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 border">
                    <p class="text-sm text-gray-600">Active</p>
                    <p class="text-2xl font-bold text-green-600">{{ activeEmployees }}</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 border">
                    <p class="text-sm text-gray-600">Departments</p>
                    <p class="text-2xl font-bold text-blue-600">{{ uniqueDepartments }}</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 border">
                    <p class="text-sm text-gray-600">Avg. Salary</p>
                    <p class="text-2xl font-bold text-purple-600">${{ averageSalary }}</p>
                </div>
            </div>

            <!-- Employee Table -->
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Employee</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Department</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Position</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Salary</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="employee in filteredEmployees" :key="employee.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                                            <span class="text-white font-medium">{{ getInitials(employee.first_name, employee.last_name) }}</span>
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-900">{{ employee.first_name }} {{ employee.last_name }}</div>
                                            <div class="text-sm text-gray-500">{{ employee.email }}</div>
                                            <div class="text-xs text-gray-400">ID: {{ employee.employee_id }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ employee.department }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ employee.position }}</td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">${{ formatCurrency(employee.base_salary) }}</div>
                                    <div class="text-xs text-gray-500 capitalize">{{ employee.salary_type }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', 
                                                  employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                                        {{ employee.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex space-x-2">
                                        <button @click="openEditModal(employee)" 
                                                class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                                            Edit
                                        </button>
                                        <button @click="$emit('delete-employee', employee.id)" 
                                                class="text-red-600 hover:text-red-900 text-sm font-medium">
                                            Delete
                                        </button>
                                        <button @click="viewEmployee(employee)" 
                                                class="text-green-600 hover:text-green-900 text-sm font-medium">
                                            View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Empty State -->
                    <div v-if="filteredEmployees.length === 0" class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-gray-400 text-2xl">👥</span>
                        </div>
                        <p class="text-gray-500">No employees found</p>
                        <p class="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Employee Modal -->
            <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                    <div class="p-6 border-b">
                        <h2 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Edit Employee' : 'Add New Employee' }}</h2>
                    </div>
                    
                    <form @submit.prevent="saveEmployee" class="p-6 space-y-6">
                        <!-- Personal Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    v-model="employeeForm.first_name"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    v-model="employeeForm.last_name"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                <input
                                    type="text"
                                    v-model="employeeForm.employee_id"
                                    required
                                    :disabled="isEditing"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    v-model="employeeForm.email"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    v-model="employeeForm.phone"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                                <input
                                    type="date"
                                    v-model="employeeForm.hire_date"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <!-- Work Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select
                                    v-model="employeeForm.department"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                <input
                                    type="text"
                                    v-model="employeeForm.position"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <!-- Salary Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
                                <select
                                    v-model="employeeForm.salary_type"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select Type</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="hourly">Hourly</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Base Salary {{ employeeForm.salary_type === 'hourly' ? '(per hour)' : '(per month)' }}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model="employeeForm.base_salary"
                                    required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                v-model="employeeForm.status"
                                required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                @click="closeModal"
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                {{ isEditing ? 'Update' : 'Save' }} Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    
    props: {
        employees: {
            type: Array,
            default: () => []
        }
    },
    
    emits: ['add-employee', 'edit-employee', 'delete-employee'],
    
    setup(props, { emit }) {
        const { ref, computed } = Vue;
        
        // Component state
        const showModal = ref(false);
        const isEditing = ref(false);
        const searchTerm = ref('');
        const filterDepartment = ref('');
        const filterStatus = ref('');
        const filterSalaryType = ref('');
        
        // Form data
        const employeeForm = ref({
            id: null,
            employee_id: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: '',
            position: '',
            hire_date: '',
            salary_type: '',
            base_salary: '',
            status: 'active'
        });
        
        // Computed properties
        const filteredEmployees = computed(() => {
            let filtered = props.employees || [];
            
            if (searchTerm.value) {
                const term = searchTerm.value.toLowerCase();
                filtered = filtered.filter(emp => 
                    emp.first_name.toLowerCase().includes(term) ||
                    emp.last_name.toLowerCase().includes(term) ||
                    emp.email.toLowerCase().includes(term) ||
                    emp.employee_id.toLowerCase().includes(term)
                );
            }
            
            if (filterDepartment.value) {
                filtered = filtered.filter(emp => emp.department === filterDepartment.value);
            }
            
            if (filterStatus.value) {
                filtered = filtered.filter(emp => emp.status === filterStatus.value);
            }
            
            if (filterSalaryType.value) {
                filtered = filtered.filter(emp => emp.salary_type === filterSalaryType.value);
            }
            
            return filtered;
        });
        
        const activeEmployees = computed(() => {
            return props.employees.filter(emp => emp.status === 'active').length;
        });
        
        const uniqueDepartments = computed(() => {
            const departments = new Set(props.employees.map(emp => emp.department));
            return departments.size;
        });
        
        const averageSalary = computed(() => {
            if (!props.employees.length) return 0;
            const total = props.employees.reduce((sum, emp) => sum + (parseFloat(emp.base_salary) || 0), 0);
            return Math.round(total / props.employees.length);
        });
        
        // Methods
        const openAddModal = () => {
            isEditing.value = false;
            resetForm();
            employeeForm.value.employee_id = generateEmployeeId();
            showModal.value = true;
        };
        
        const openEditModal = (employee) => {
            isEditing.value = true;
            employeeForm.value = { ...employee };
            showModal.value = true;
        };
        
        const closeModal = () => {
            showModal.value = false;
            resetForm();
        };
        
        const resetForm = () => {
            employeeForm.value = {
                id: null,
                employee_id: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                department: '',
                position: '',
                hire_date: '',
                salary_type: '',
                base_salary: '',
                status: 'active'
            };
        };
        
        const generateEmployeeId = () => {
            const existingIds = props.employees.map(emp => emp.employee_id);
            let counter = 1;
            let newId = `EMP${String(counter).padStart(3, '0')}`;
            
            while (existingIds.includes(newId)) {
                counter++;
                newId = `EMP${String(counter).padStart(3, '0')}`;
            }
            
            return newId;
        };
        
        const saveEmployee = () => {
            if (isEditing.value) {
                emit('edit-employee', { ...employeeForm.value });
            } else {
                emit('add-employee', { ...employeeForm.value });
            }
            closeModal();
        };
        
        const viewEmployee = (employee) => {
            alert(`Employee Details:\n\nName: ${employee.first_name} ${employee.last_name}\nID: ${employee.employee_id}\nDepartment: ${employee.department}\nPosition: ${employee.position}\nSalary: $${employee.base_salary} (${employee.salary_type})\nStatus: ${employee.status}`);
        };
        
        const getInitials = (firstName, lastName) => {
            return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        };
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US').format(amount || 0);
        };
        
        return {
            showModal,
            isEditing,
            searchTerm,
            filterDepartment,
            filterStatus,
            filterSalaryType,
            employeeForm,
            filteredEmployees,
            activeEmployees,
            uniqueDepartments,
            averageSalary,
            openAddModal,
            openEditModal,
            closeModal,
            saveEmployee,
            viewEmployee,
            getInitials,
            formatCurrency
        };
    }
};

// Register the component globally
window.app?.component('employees-component', EmployeesComponent);