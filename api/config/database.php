<?php
/**
 * Database Configuration for Payroll System
 * XAMPP/MySQL Database Connection
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'payroll_system';
    private $username = 'root';
    private $password = '';
    private $conn;

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo json_encode([
                'success' => false,
                'message' => 'Database connection error: ' . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }

    /**
     * Create database if it doesn't exist
     */
    public function createDatabase() {
        try {
            $conn = new PDO(
                "mysql:host=" . $this->host,
                $this->username,
                $this->password
            );
            $conn->exec("CREATE DATABASE IF NOT EXISTS " . $this->db_name);
            $conn = null;
            return true;
        } catch(PDOException $exception) {
            return false;
        }
    }

    /**
     * Initialize database tables
     */
    public function initializeTables() {
        $conn = $this->getConnection();
        
        try {
            // Users table for authentication
            $conn->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'hr', 'employee') DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Departments table
            $conn->exec("
                CREATE TABLE IF NOT EXISTS departments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Positions table
            $conn->exec("
                CREATE TABLE IF NOT EXISTS positions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(100) NOT NULL,
                    department_id INT,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (department_id) REFERENCES departments(id)
                )
            ");

            // Employees table
            $conn->exec("
                CREATE TABLE IF NOT EXISTS employees (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    employee_id VARCHAR(20) UNIQUE NOT NULL,
                    first_name VARCHAR(50) NOT NULL,
                    last_name VARCHAR(50) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    department VARCHAR(50) NOT NULL,
                    position VARCHAR(100) NOT NULL,
                    hire_date DATE NOT NULL,
                    salary_type ENUM('monthly', 'hourly') NOT NULL,
                    base_salary DECIMAL(10,2) NOT NULL,
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ");

            // Attendance table
            $conn->exec("
                CREATE TABLE IF NOT EXISTS attendance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    employee_id INT NOT NULL,
                    date DATE NOT NULL,
                    clock_in TIME,
                    clock_out TIME,
                    hours_worked DECIMAL(4,2),
                    status ENUM('present', 'absent', 'late') DEFAULT 'present',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (employee_id) REFERENCES employees(id),
                    UNIQUE KEY unique_employee_date (employee_id, date)
                )
            ");

            // Payroll table
            $conn->exec("
                CREATE TABLE IF NOT EXISTS payroll (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    employee_id INT NOT NULL,
                    pay_period_start DATE NOT NULL,
                    pay_period_end DATE NOT NULL,
                    gross_pay DECIMAL(10,2) NOT NULL,
                    tax_deduction DECIMAL(10,2) DEFAULT 0,
                    insurance_deduction DECIMAL(10,2) DEFAULT 0,
                    other_deductions DECIMAL(10,2) DEFAULT 0,
                    total_deductions DECIMAL(10,2) NOT NULL,
                    net_pay DECIMAL(10,2) NOT NULL,
                    status ENUM('pending', 'processing', 'paid') DEFAULT 'pending',
                    processed_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (employee_id) REFERENCES employees(id)
                )
            ");

            // Deduction types table
            $conn->exec("
                CREATE TABLE IF NOT EXISTS deduction_types (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    type ENUM('percentage', 'fixed') NOT NULL,
                    value DECIMAL(10,2) NOT NULL,
                    description TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Insert default admin user
            $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
            $stmt->execute(['admin@payroll.com']);
            if ($stmt->fetchColumn() == 0) {
                $password_hash = password_hash('admin123', PASSWORD_DEFAULT);
                $stmt = $conn->prepare("
                    INSERT INTO users (name, email, password, role) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute(['Admin User', 'admin@payroll.com', $password_hash, 'admin']);
            }

            // Insert default departments
            $departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations'];
            foreach ($departments as $dept) {
                $stmt = $conn->prepare("SELECT COUNT(*) FROM departments WHERE name = ?");
                $stmt->execute([$dept]);
                if ($stmt->fetchColumn() == 0) {
                    $stmt = $conn->prepare("INSERT INTO departments (name) VALUES (?)");
                    $stmt->execute([$dept]);
                }
            }

            // Insert default deduction types
            $deductions = [
                ['Tax', 'percentage', 15.00, 'Income tax deduction'],
                ['Health Insurance', 'percentage', 5.00, 'Health insurance premium'],
                ['Pension Fund', 'percentage', 3.00, 'Pension contribution'],
                ['Life Insurance', 'fixed', 50.00, 'Life insurance premium']
            ];
            
            foreach ($deductions as $deduction) {
                $stmt = $conn->prepare("SELECT COUNT(*) FROM deduction_types WHERE name = ?");
                $stmt->execute([$deduction[0]]);
                if ($stmt->fetchColumn() == 0) {
                    $stmt = $conn->prepare("
                        INSERT INTO deduction_types (name, type, value, description) 
                        VALUES (?, ?, ?, ?)
                    ");
                    $stmt->execute($deduction);
                }
            }

            return true;
        } catch(PDOException $exception) {
            error_log("Database initialization error: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Insert sample data for testing
     */
    public function insertSampleData() {
        $conn = $this->getConnection();
        
        try {
            // Check if sample employees already exist
            $stmt = $conn->query("SELECT COUNT(*) FROM employees");
            if ($stmt->fetchColumn() > 0) {
                return true; // Sample data already exists
            }

            // Sample employees
            $employees = [
                ['EMP001', 'John', 'Doe', 'john.doe@company.com', '+1234567890', 'IT', 'Software Developer', '2023-01-15', 'monthly', 5000.00],
                ['EMP002', 'Jane', 'Smith', 'jane.smith@company.com', '+1234567891', 'HR', 'HR Manager', '2022-11-20', 'monthly', 4500.00],
                ['EMP003', 'Mike', 'Johnson', 'mike.johnson@company.com', '+1234567892', 'Finance', 'Accountant', '2023-03-10', 'hourly', 25.00],
                ['EMP004', 'Sarah', 'Wilson', 'sarah.wilson@company.com', '+1234567893', 'Marketing', 'Marketing Specialist', '2023-02-01', 'monthly', 4000.00],
                ['EMP005', 'David', 'Brown', 'david.brown@company.com', '+1234567894', 'Operations', 'Operations Manager', '2022-08-15', 'monthly', 5500.00]
            ];

            $stmt = $conn->prepare("
                INSERT INTO employees (employee_id, first_name, last_name, email, phone, department, position, hire_date, salary_type, base_salary) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            foreach ($employees as $emp) {
                $stmt->execute($emp);
            }

            // Sample attendance records for today
            $today = date('Y-m-d');
            $attendance_data = [
                [1, $today, '09:00:00', '17:30:00', 8.5, 'present'],
                [2, $today, '08:30:00', '17:00:00', 8.5, 'present'],
                [3, $today, '09:15:00', null, null, 'present'],
                [4, $today, '09:05:00', '16:45:00', 7.67, 'late'],
                [5, $today, null, null, null, 'absent']
            ];

            $stmt = $conn->prepare("
                INSERT INTO attendance (employee_id, date, clock_in, clock_out, hours_worked, status) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                clock_in = VALUES(clock_in), 
                clock_out = VALUES(clock_out), 
                hours_worked = VALUES(hours_worked), 
                status = VALUES(status)
            ");

            foreach ($attendance_data as $att) {
                $stmt->execute($att);
            }

            // Sample payroll records
            $payroll_data = [
                [1, '2024-01-01', '2024-01-31', 5000.00, 750.00, 250.00, 0.00, 1000.00, 4000.00, 'paid'],
                [2, '2024-01-01', '2024-01-31', 4500.00, 675.00, 225.00, 0.00, 900.00, 3600.00, 'paid'],
                [3, '2024-01-01', '2024-01-31', 4200.00, 630.00, 210.00, 0.00, 840.00, 3360.00, 'pending']
            ];

            $stmt = $conn->prepare("
                INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, gross_pay, tax_deduction, insurance_deduction, other_deductions, total_deductions, net_pay, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            foreach ($payroll_data as $pay) {
                $stmt->execute($pay);
            }

            return true;
        } catch(PDOException $exception) {
            error_log("Sample data insertion error: " . $exception->getMessage());
            return false;
        }
    }
}

// Enable CORS for API requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Auto-initialize database on first access
$database = new Database();
$database->createDatabase();
$database->initializeTables();
$database->insertSampleData();
?>