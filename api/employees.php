<?php
/**
 * Employee Management API
 * Handles CRUD operations for employees
 */

require_once 'config/database.php';

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class EmployeeAPI {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all employees
     */
    public function getEmployees() {
        try {
            $query = "SELECT * FROM employees ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $employees = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $employees[] = [
                    'id' => (int)$row['id'],
                    'employee_id' => $row['employee_id'],
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'department' => $row['department'],
                    'position' => $row['position'],
                    'hire_date' => $row['hire_date'],
                    'salary_type' => $row['salary_type'],
                    'base_salary' => (float)$row['base_salary'],
                    'status' => $row['status'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }

            return [
                'success' => true,
                'data' => $employees,
                'count' => count($employees)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching employees: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get employee by ID
     */
    public function getEmployee($id) {
        try {
            $query = "SELECT * FROM employees WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id]);

            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                return [
                    'success' => true,
                    'data' => [
                        'id' => (int)$row['id'],
                        'employee_id' => $row['employee_id'],
                        'first_name' => $row['first_name'],
                        'last_name' => $row['last_name'],
                        'email' => $row['email'],
                        'phone' => $row['phone'],
                        'department' => $row['department'],
                        'position' => $row['position'],
                        'hire_date' => $row['hire_date'],
                        'salary_type' => $row['salary_type'],
                        'base_salary' => (float)$row['base_salary'],
                        'status' => $row['status'],
                        'created_at' => $row['created_at'],
                        'updated_at' => $row['updated_at']
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Employee not found'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching employee: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create new employee
     */
    public function createEmployee($data) {
        try {
            // Validate required fields
            $required_fields = ['employee_id', 'first_name', 'last_name', 'email', 'department', 'position', 'hire_date', 'salary_type', 'base_salary'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'success' => false,
                        'message' => "Missing required field: {$field}"
                    ];
                }
            }

            // Check if employee_id already exists
            $check_query = "SELECT COUNT(*) FROM employees WHERE employee_id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$data['employee_id']]);
            if ($check_stmt->fetchColumn() > 0) {
                return [
                    'success' => false,
                    'message' => 'Employee ID already exists'
                ];
            }

            // Check if email already exists
            $check_query = "SELECT COUNT(*) FROM employees WHERE email = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$data['email']]);
            if ($check_stmt->fetchColumn() > 0) {
                return [
                    'success' => false,
                    'message' => 'Email already exists'
                ];
            }

            // Insert new employee
            $query = "INSERT INTO employees (employee_id, first_name, last_name, email, phone, department, position, hire_date, salary_type, base_salary, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['employee_id'],
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone'] ?? null,
                $data['department'],
                $data['position'],
                $data['hire_date'],
                $data['salary_type'],
                $data['base_salary'],
                $data['status'] ?? 'active'
            ]);

            $employee_id = $this->conn->lastInsertId();
            
            // Return created employee
            return $this->getEmployee($employee_id);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error creating employee: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update employee
     */
    public function updateEmployee($id, $data) {
        try {
            // Check if employee exists
            $check_query = "SELECT COUNT(*) FROM employees WHERE id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$id]);
            if ($check_stmt->fetchColumn() == 0) {
                return [
                    'success' => false,
                    'message' => 'Employee not found'
                ];
            }

            // Build dynamic update query
            $update_fields = [];
            $values = [];
            
            $allowed_fields = ['first_name', 'last_name', 'email', 'phone', 'department', 'position', 'hire_date', 'salary_type', 'base_salary', 'status'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $update_fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($update_fields)) {
                return [
                    'success' => false,
                    'message' => 'No valid fields to update'
                ];
            }

            // Check for email uniqueness if email is being updated
            if (isset($data['email'])) {
                $check_query = "SELECT COUNT(*) FROM employees WHERE email = ? AND id != ?";
                $check_stmt = $this->conn->prepare($check_query);
                $check_stmt->execute([$data['email'], $id]);
                if ($check_stmt->fetchColumn() > 0) {
                    return [
                        'success' => false,
                        'message' => 'Email already exists'
                    ];
                }
            }

            $values[] = $id;
            $query = "UPDATE employees SET " . implode(', ', $update_fields) . " WHERE id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($values);

            // Return updated employee
            return $this->getEmployee($id);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating employee: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete employee
     */
    public function deleteEmployee($id) {
        try {
            // Check if employee exists
            $check_query = "SELECT COUNT(*) FROM employees WHERE id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$id]);
            if ($check_stmt->fetchColumn() == 0) {
                return [
                    'success' => false,
                    'message' => 'Employee not found'
                ];
            }

            // Check for related records (attendance, payroll)
            $check_attendance = "SELECT COUNT(*) FROM attendance WHERE employee_id = ?";
            $stmt = $this->conn->prepare($check_attendance);
            $stmt->execute([$id]);
            $attendance_count = $stmt->fetchColumn();

            $check_payroll = "SELECT COUNT(*) FROM payroll WHERE employee_id = ?";
            $stmt = $this->conn->prepare($check_payroll);
            $stmt->execute([$id]);
            $payroll_count = $stmt->fetchColumn();

            if ($attendance_count > 0 || $payroll_count > 0) {
                // Soft delete - just set status to inactive
                $query = "UPDATE employees SET status = 'inactive' WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$id]);

                return [
                    'success' => true,
                    'message' => 'Employee deactivated (has attendance/payroll records)'
                ];
            } else {
                // Hard delete if no related records
                $query = "DELETE FROM employees WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$id]);

                return [
                    'success' => true,
                    'message' => 'Employee deleted successfully'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error deleting employee: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get employee statistics
     */
    public function getEmployeeStats() {
        try {
            $stats = [];

            // Total employees
            $query = "SELECT COUNT(*) as total FROM employees";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total'] = (int)$stmt->fetchColumn();

            // Active employees
            $query = "SELECT COUNT(*) as active FROM employees WHERE status = 'active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['active'] = (int)$stmt->fetchColumn();

            // Departments
            $query = "SELECT COUNT(DISTINCT department) as departments FROM employees";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['departments'] = (int)$stmt->fetchColumn();

            // Average salary
            $query = "SELECT AVG(base_salary) as avg_salary FROM employees WHERE status = 'active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['average_salary'] = (float)$stmt->fetchColumn();

            // Department breakdown
            $query = "SELECT department, COUNT(*) as count, AVG(base_salary) as avg_salary 
                     FROM employees WHERE status = 'active' 
                     GROUP BY department 
                     ORDER BY count DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $departments = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $departments[] = [
                    'department' => $row['department'],
                    'count' => (int)$row['count'],
                    'average_salary' => (float)$row['avg_salary']
                ];
            }
            $stats['departments_breakdown'] = $departments;

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching employee statistics: ' . $e->getMessage()
            ];
        }
    }
}

// Handle the API request
try {
    $api = new EmployeeAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                echo json_encode($api->getEmployee($_GET['id']));
            } elseif (isset($_GET['stats'])) {
                echo json_encode($api->getEmployeeStats());
            } else {
                echo json_encode($api->getEmployees());
            }
            break;

        case 'POST':
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'create':
                        echo json_encode($api->createEmployee($input));
                        break;
                    default:
                        echo json_encode(['success' => false, 'message' => 'Invalid action']);
                }
            } else {
                echo json_encode($api->createEmployee($input));
            }
            break;

        case 'PUT':
            if (isset($input['id'])) {
                echo json_encode($api->updateEmployee($input['id'], $input));
            } else {
                echo json_encode(['success' => false, 'message' => 'Employee ID required']);
            }
            break;

        case 'DELETE':
            if (isset($input['id'])) {
                echo json_encode($api->deleteEmployee($input['id']));
            } else {
                echo json_encode(['success' => false, 'message' => 'Employee ID required']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'API Error: ' . $e->getMessage()
    ]);
}
?>