// Login Component
const LoginComponent = {
    template: `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div class="max-w-md w-full space-y-8 p-8">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-white font-bold text-2xl">P</span>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-900">PayrollPro</h2>
                        <p class="text-gray-600 mt-2">Sign in to your account</p>
                    </div>

                    <!-- Login Form -->
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <!-- Email Field -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                v-model="formData.email"
                                required
                                :disabled="loading"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="admin@payroll.com"
                            />
                        </div>

                        <!-- Password Field -->
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div class="relative">
                                <input
                                    :type="showPassword ? 'text' : 'password'"
                                    id="password"
                                    v-model="formData.password"
                                    required
                                    :disabled="loading"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500 pr-12"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    @click="showPassword = !showPassword"
                                    class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    :disabled="loading"
                                >
                                    <span v-if="showPassword">🙈</span>
                                    <span v-else>👁️</span>
                                </button>
                            </div>
                        </div>

                        <!-- Remember Me -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    v-model="formData.remember"
                                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                >
                                <label for="remember" class="ml-2 text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" class="text-sm text-primary-600 hover:text-primary-500">
                                Forgot password?
                            </a>
                        </div>

                        <!-- Error Message -->
                        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div class="flex items-center">
                                <span class="text-red-500 mr-2">⚠️</span>
                                <p class="text-sm text-red-700">{{ error }}</p>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            :disabled="loading"
                            class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                            <div v-if="loading" class="flex items-center">
                                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Signing in...
                            </div>
                            <span v-else>Sign in</span>
                        </button>
                    </form>

                    <!-- Demo Credentials -->
                    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 class="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h4>
                        <div class="text-sm text-blue-700 space-y-1">
                            <p><strong>Email:</strong> admin@payroll.com</p>
                            <p><strong>Password:</strong> admin123</p>
                        </div>
                        <button 
                            @click="fillDemoCredentials"
                            class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                            :disabled="loading"
                        >
                            Fill Demo Credentials
                        </button>
                    </div>

                    <!-- Features Info -->
                    <div class="mt-6 text-center">
                        <p class="text-xs text-gray-500 mb-4">Payroll Management System Features:</p>
                        <div class="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div class="flex items-center">
                                <span class="mr-1">👥</span>
                                Employee Management
                            </div>
                            <div class="flex items-center">
                                <span class="mr-1">💰</span>
                                Payroll Processing
                            </div>
                            <div class="flex items-center">
                                <span class="mr-1">⏰</span>
                                Time Tracking
                            </div>
                            <div class="flex items-center">
                                <span class="mr-1">📊</span>
                                Reports & Analytics
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="text-center text-sm text-gray-500">
                    <p>&copy; 2024 PayrollPro. Built with Vue.js & PHP.</p>
                </div>
            </div>
        </div>
    `,
    
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    
    emits: ['login'],
    
    setup(props, { emit }) {
        const { ref } = Vue;
        
        // Form data
        const formData = ref({
            email: '',
            password: '',
            remember: false
        });
        
        // Component state
        const showPassword = ref(false);
        const error = ref('');
        
        // Methods
        const handleSubmit = async () => {
            error.value = '';
            
            // Basic validation
            if (!formData.value.email || !formData.value.password) {
                error.value = 'Please fill in all fields';
                return;
            }
            
            if (!isValidEmail(formData.value.email)) {
                error.value = 'Please enter a valid email address';
                return;
            }
            
            // Emit login event to parent
            emit('login', {
                email: formData.value.email,
                password: formData.value.password,
                remember: formData.value.remember
            });
        };
        
        const fillDemoCredentials = () => {
            formData.value.email = 'admin@payroll.com';
            formData.value.password = 'admin123';
        };
        
        const isValidEmail = (email) => {
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailRegex.test(email);
        };
        
        return {
            formData,
            showPassword,
            error,
            handleSubmit,
            fillDemoCredentials
        };
    }
};

// Register the component globally
window.app?.component('login-component', LoginComponent);